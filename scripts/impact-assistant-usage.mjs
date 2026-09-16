#!/usr/bin/env node
/**
 * Recompute SickleCellPedia usage figures for the Impact page.
 *
 *   VOICEFLOW_API_KEY=... node scripts/impact-assistant-usage.mjs 2026-Q3
 *   VOICEFLOW_API_KEY=... node scripts/impact-assistant-usage.mjs 2026-H1 --through 2026-06-30
 *
 * Writes content/impact-data/<period>.assistant.json — the `assistant` block of the
 * period file (merge it into content/impact-data/<period>.json by hand or with --write).
 * Raw API responses are cached under scripts/.impact-raw/ (gitignored — they contain
 * conversation text and WhatsApp phone numbers and must never be committed).
 *
 * Method (keep in sync with content/impact-data/README.md):
 *   • Period totals come from the Voiceflow Analytics API (monthly buckets, America/New_York).
 *   • Channel / engaged / country / language splits come from the Transcripts API, which only
 *     retains the trailing 6 months — for older periods the transcripts block is null.
 *   • engaged conversation = ≥1 user message AND ≥1 assistant reply AND no runtime error.
 *   • Test traffic (wa:smoke-*, wa:probe-*, test-console sessions on the WhatsApp agent,
 *     the relay smoke prompt) is excluded.
 *
 * Endpoints (Voiceflow "stable" REST API, Bearer auth):
 *   POST https://realtime-api.voiceflow.com/v1/stable/analytics/query/{transcript-count|unique-user-count|interaction-count}/project/{projectID}
 *   POST https://realtime-api.voiceflow.com/v1/stable/transcript/search?projectID={projectID}
 *   GET  https://realtime-api.voiceflow.com/v1/stable/transcript/{transcriptID}?projectID={projectID}&filterConversation=true
 */
import fs from "node:fs";
import path from "node:path";

const API = "https://realtime-api.voiceflow.com/v1/stable";
const KEY = process.env.VOICEFLOW_API_KEY;
if (!KEY) { console.error("Set VOICEFLOW_API_KEY"); process.exit(1); }

const AGENTS = {
  web: "684db2d2921b2a3ad5910594",      // 2025 SickleCellPedia V2 — web widget; also WhatsApp via FlowBridge until May 2026
  whatsapp: "6a1f2795e85b1c323616c71a", // SickleCellPedia WhatsApp — self-hosted relay, June 2026 onward
};
/**
 * SCKIN's own test handsets, matched on the last four digits only. Storing a
 * suffix rather than the number keeps a team member's phone number out of the
 * repo while still being unambiguous across a few hundred contacts. Add a new
 * entry here when someone else starts testing from their own phone.
 */
const TEST_NUMBER_SUFFIXES = ["5345"]; // Zacharie's test handset (+1 607 …)

const SMOKE_PROMPT = "Give me a detailed overview of all treatment options for sickle cell disease, with sources.";
const TZ = "America/New_York";

// ---------- period parsing ----------
const [periodArg, ...rest] = process.argv.slice(2);
if (!periodArg) { console.error("Usage: impact-assistant-usage.mjs <YYYY|YYYY-H1|YYYY-H2|YYYY-Qn> [--through YYYY-MM-DD] [--write]"); process.exit(1); }
const through = rest.includes("--through") ? rest[rest.indexOf("--through") + 1] : null;
const write = rest.includes("--write");
const [year, part] = periodArg.split("-");
const ranges = { undefined: [1, 12], H1: [1, 6], H2: [7, 12], Q1: [1, 3], Q2: [4, 6], Q3: [7, 9], Q4: [10, 12] };
const [m0, m1] = ranges[part];
const start = `${year}-${String(m0).padStart(2, "0")}-01T00:00:00Z`;
const lastDay = new Date(Date.UTC(+year, m1, 0)).getUTCDate();
const end = through ? `${through}T23:59:59Z` : `${year}-${String(m1).padStart(2, "0")}-${lastDay}T23:59:59Z`;

// ---------- helpers ----------
const RAW = path.join(path.dirname(new URL(import.meta.url).pathname), ".impact-raw");
fs.mkdirSync(RAW, { recursive: true });
async function vf(method, url, body) {
  const r = await fetch(url, { method, headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  if (!r.ok) throw new Error(`${method} ${url} → ${r.status} ${await r.text()}`);
  return r.json();
}
const monthKey = (iso) => new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ }).slice(0, 7);

// ---------- 1. analytics ----------
async function analytics(projectID) {
  const body = { startDate: start, endDate: end, interval: "month", timezone: TZ };
  const [sessions, users, inter] = await Promise.all([
    vf("POST", `${API}/analytics/query/transcript-count/project/${projectID}`, body),
    vf("POST", `${API}/analytics/query/unique-user-count/project/${projectID}`, body),
    vf("POST", `${API}/analytics/query/interaction-count/project/${projectID}`, body),
  ]);
  const byMonth = {};
  const put = (rows, k) => rows.rows.forEach((r) => { const m = monthKey(r.intervalStartDate); (byMonth[m] ??= {})[k] = r.count; });
  put(sessions, "sessions"); put(users, "unique_users"); put(inter, "interactions");
  const sum = (k) => Object.values(byMonth).reduce((a, v) => a + (v[k] || 0), 0);
  return { project_id: projectID, sessions: sum("sessions"), unique_users_monthly_sum: sum("unique_users"), interactions: sum("interactions"), by_month: byMonth };
}

// ---------- 2. transcripts ----------
async function searchAll(projectID) {
  const out = [];
  for (let skip = 0; ; skip += 100) {
    const page = await vf("POST", `${API}/transcript/search?projectID=${projectID}`, { startDate: start, endDate: end, take: 100, skip });
    out.push(...page.transcripts);
    if (page.transcripts.length < 100) break;
  }
  return out;
}
async function turns(projectID, id) {
  const cache = path.join(RAW, `${id}.json`);
  if (fs.existsSync(cache)) return JSON.parse(fs.readFileSync(cache, "utf8"));
  const { transcript } = await vf("GET", `${API}/transcript/${id}?projectID=${projectID}&filterConversation=true`);
  let user_msgs = 0, bot_msgs = 0, error_msgs = 0, first_user = null;
  for (const l of transcript.logs || []) {
    if (l.type === "action" && l.data?.type === "text") { user_msgs++; first_user ??= String(l.data.payload).slice(0, 120); }
    if (l.type === "trace" && l.data?.type === "text") { bot_msgs++; if (String(l.data.payload?.message || "").includes("Something went wrong")) error_msgs++; }
  }
  const rec = { user_msgs, bot_msgs, error_msgs, first_user };
  fs.writeFileSync(cache, JSON.stringify(rec));
  return rec;
}

// Dial code → country for WhatsApp ids (longest prefix wins). Extend as new countries appear.
const DIAL = { 1: "North America (US/Canada)", 33: "France", 44: "United Kingdom", 91: "India", 92: "Pakistan", 212: "Morocco", 221: "Senegal",
  223: "Mali", 224: "Guinea", 225: "Côte d'Ivoire", 226: "Burkina Faso", 227: "Niger", 228: "Togo", 229: "Benin", 233: "Ghana", 234: "Nigeria",
  237: "Cameroon", 242: "Republic of the Congo", 243: "DR Congo", 254: "Kenya", 255: "Tanzania", 256: "Uganda", 260: "Zambia", 261: "Madagascar",
  27: "South Africa", 232: "Sierra Leone", 509: "Haiti", 1868: "Trinidad and Tobago", 1876: "Jamaica", 971: "United Arab Emirates", 966: "Saudi Arabia" };
const dialCountry = (n) => { for (const k of [4, 3, 2, 1]) if (DIAL[n.slice(0, k)]) return DIAL[n.slice(0, k)]; return "Unknown"; };
const prop = (t, name) => t.properties?.find((p) => p.name === name)?.value ?? null;

async function transcripts() {
  const rows = [];
  for (const [agent, projectID] of Object.entries(AGENTS)) {
    const list = await searchAll(projectID);
    for (const t of list) {
      const tr = await turns(projectID, t.id);
      const modality = prop(t, "modality");
      const uid = t.userID || "";
      const channel = modality === "api" ? "whatsapp" : modality === "chat" ? "web" : "other";
      let test = null;
      if (uid.startsWith("wa:") && !/^\d+$/.test(uid.slice(3))) test = "synthetic wa: id";
      else if (agent === "whatsapp" && modality === "chat") test = "test console";
      else if (tr.first_user === SMOKE_PROMPT) test = "smoke prompt";
      else if (channel === "whatsapp" && TEST_NUMBER_SUFFIXES.some((sfx) => uid.replace(/\D/g, "").endsWith(sfx)))
        test = "SCKIN test handset";
      let country;
      if (channel === "whatsapp") { const n = uid.replace(/^wa:/, ""); country = /^\d+$/.test(n) ? dialCountry(n) : "Unknown"; }
      else { country = prop(t, "vf-country") || "Unknown"; if (country === "United States" || country === "Canada") country = "North America (US/Canada)"; }
      rows.push({ channel, month: monthKey(t.createdAt), user: uid, country, test, ...tr, engaged: tr.user_msgs >= 1 && tr.bot_msgs >= 1 && tr.error_msgs === 0 });
    }
  }
  const real = rows.filter((r) => !r.test), eng = real.filter((r) => r.engaged);
  const count = (arr, f) => arr.reduce((m, r) => (m[f(r)] = (m[f(r)] || 0) + 1, m), {});
  const countries = count(eng, (r) => r.country); const unknown = countries.Unknown || 0; delete countries.Unknown;
  return {
    source: "Voiceflow Transcripts API (search + get, filterConversation=true); one record per session",
    window: `${start.slice(0, 10)} to ${end.slice(0, 10)} (transcripts retained 6 months)`,
    sessions_fetched: rows.length, sessions_excluded_as_test: rows.length - real.length, sessions: real.length,
    engaged_conversations: eng.length, engaged_rate: real.length ? +(eng.length / real.length).toFixed(3) : null,
    unique_users: new Set(real.map((r) => r.user)).size, unique_users_engaged: new Set(eng.map((r) => r.user)).size,
    user_messages: real.reduce((a, r) => a + r.user_msgs, 0), assistant_messages: real.reduce((a, r) => a + r.bot_msgs, 0),
    by_channel: Object.fromEntries(["web", "whatsapp"].map((c) => [c, { sessions: real.filter((r) => r.channel === c).length, engaged: eng.filter((r) => r.channel === c).length, unique_users: new Set(real.filter((r) => r.channel === c).map((r) => r.user)).size }])),
    by_month: Object.fromEntries([...new Set(real.map((r) => r.month))].sort().map((m) => [m, { sessions: real.filter((r) => r.month === m).length, engaged: eng.filter((r) => r.month === m).length }])),
    countries_reached: Object.keys(countries).length, countries_engaged_conversations: countries, country_unknown_engaged: unknown,
    languages_first_message: "run scripts/impact-language-id.py on scripts/.impact-raw to add (optional)",
  };
}

// ---------- run ----------
const web = await analytics(AGENTS.web);
const wa = await analytics(AGENTS.whatsapp);
const block = {
  analytics: {
    source: "Voiceflow Analytics API (transcript-count, unique-user-count, interaction-count), monthly buckets, America/New_York",
    pulled_on: new Date().toISOString().slice(0, 10),
    sessions: web.sessions + wa.sessions, unique_users_monthly_sum: web.unique_users_monthly_sum + wa.unique_users_monthly_sum, interactions: web.interactions + wa.interactions,
    per_project: { web_agent: web, whatsapp_agent: wa },
  },
  transcripts: await transcripts(),
};
const outDir = path.resolve("content/impact-data");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `${periodArg}.assistant.json`);
fs.writeFileSync(outFile, JSON.stringify(block, null, 2) + "\n");
console.log(`wrote ${outFile}`);
if (write) {
  const periodFile = path.join(outDir, `${periodArg}.json`);
  const cur = fs.existsSync(periodFile) ? JSON.parse(fs.readFileSync(periodFile, "utf8")) : { period: periodArg };
  cur.assistant = { ...(cur.assistant || {}), ...block };
  cur.generated_on = block.analytics.pulled_on;
  if (through) cur.data_through = through;
  fs.writeFileSync(periodFile, JSON.stringify(cur, null, 2) + "\n");
  console.log(`merged into ${periodFile}`);
}
