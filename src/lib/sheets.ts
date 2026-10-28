/**
 * Server-only Google Sheets bridge: appends form submissions as rows to the
 * combined "contacts" Sheet. Auth is Workload Identity Federation — no
 * long-lived service-account key ever exists. Vercel's own OIDC token is
 * exchanged for short-lived credentials that impersonate a keyless GCP
 * service account:
 *   Vercel OIDC token (audience-scoped) → GCP STS token exchange
 *     → IAM generateAccessToken (impersonation) → Sheets REST API
 * The GCP legs are two plain `fetch` calls, no Google SDK. `@vercel/oidc` is
 * the one dependency this pulls in — it performs Vercel's own token exchange
 * to mint an OIDC token with the audience GCP requires, which isn't a public
 * endpoint we can hand-roll.
 *
 * DO NOT import this from a client component. Forms post to our own `/api/*`
 * route; the route calls this.
 *
 * Env (server-side only, set in Vercel — none of these are secret; there is
 * no private key anywhere in this flow):
 *   GCP_PROJECT_NUMBER                     — numeric GCP project number
 *   GCP_WORKLOAD_IDENTITY_POOL_ID          — WIF pool ID
 *   GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID — WIF provider ID (trusts Vercel's OIDC issuer)
 *   GCP_SERVICE_ACCOUNT_EMAIL              — keyless SA the pool may impersonate
 *   SHEETS_SPREADSHEET_ID                  — the target spreadsheet's ID
 *
 * The FIRST tab of that spreadsheet is the combined contacts tab, one row per
 * submission, header row matching SHEET_COLUMNS below. The schema is a
 * superset designed for a later AWS database migration (see the master doc's
 * "Proposed contacts data model") — `email` is the natural key throughout.
 *
 * When env is missing this throws SheetsConfigError; the route logs it and
 * acknowledges the submission without persisting (graceful, never a crash).
 */
import crypto from "node:crypto";
import { getVercelOidcToken } from "@vercel/oidc";

/** Thrown when WIF config or the spreadsheet ID is not configured. */
export class SheetsConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SheetsConfigError";
  }
}

/** Which form produced the row. Extensible — add sources, never rename. */
export type ContactSource = "pro_interest" | "newsletter" | "contact";

/** One submission, pre-mapped to the sheet's column semantics. */
export interface ContactRow {
  source: ContactSource;
  full_name?: string;
  email: string;
  is_healthcare_professional?: boolean;
  role?: string;
  country?: string;
  city_region?: string;
  notes?: string;
  /** Must be true to store — enforced by each form's field spec / mapping. */
  consent: boolean;
  locale?: string;
}

/** Column order of the contacts tab. Keep in sync with the Sheet header row. */
export const SHEET_COLUMNS = [
  "id",
  "created_at",
  "source",
  "full_name",
  "email",
  "is_healthcare_professional",
  "role",
  "country",
  "city_region",
  "notes",
  "consent",
  "locale",
  "status",
] as const;

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const CLOUD_PLATFORM_SCOPE = "https://www.googleapis.com/auth/cloud-platform";
const STS_URL = "https://sts.googleapis.com/v1/token";

interface WifConfig {
  /** Full resource name of the GCP workload identity provider. */
  audience: string;
  serviceAccountEmail: string;
  spreadsheetId: string;
}

function readConfig(): WifConfig {
  const projectNumber = process.env.GCP_PROJECT_NUMBER;
  const poolId = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID;
  const providerId = process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID;
  const serviceAccountEmail = process.env.GCP_SERVICE_ACCOUNT_EMAIL;
  const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID;
  if (
    !projectNumber ||
    !poolId ||
    !providerId ||
    !serviceAccountEmail ||
    !spreadsheetId
  ) {
    throw new SheetsConfigError(
      "GCP_PROJECT_NUMBER, GCP_WORKLOAD_IDENTITY_POOL_ID, " +
        "GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID, GCP_SERVICE_ACCOUNT_EMAIL, " +
        "and SHEETS_SPREADSHEET_ID must be set"
    );
  }
  const audience = `//iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`;
  return { audience, serviceAccountEmail, spreadsheetId };
}

/* ---------------- Workload Identity Federation (OIDC, keyless) ------------ */

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(config: WifConfig): Promise<string> {
  // Instance-local cache; a cold start just fetches a fresh token.
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  // 1. Vercel's own OIDC token, minted with the audience GCP's workload
  //    identity provider expects (GCP requires an exact `aud` match).
  const subjectToken = await getVercelOidcToken({ audience: config.audience });

  // 2. Exchange it for a short-lived *federated* GCP access token (STS).
  //    This token identifies as the WIF principal, not the service account.
  const stsRes = await fetch(STS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      audience: config.audience,
      grantType: "urn:ietf:params:oauth:grant-type:token-exchange",
      requestedTokenType: "urn:ietf:params:oauth:token-type:access_token",
      subjectToken,
      subjectTokenType: "urn:ietf:params:oauth:token-type:jwt",
      scope: CLOUD_PLATFORM_SCOPE,
    }),
  });
  if (!stsRes.ok) {
    throw new Error(`GCP STS token exchange responded ${stsRes.status}`);
  }
  const federated = (await stsRes.json()) as { access_token: string };

  // 3. Impersonate the keyless service account for a Sheets-scoped token.
  //    The pool must be granted roles/iam.workloadIdentityUser on this SA.
  const impersonateRes = await fetch(
    `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${config.serviceAccountEmail}:generateAccessToken`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${federated.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scope: [SHEETS_SCOPE] }),
    }
  );
  if (!impersonateRes.ok) {
    throw new Error(`IAM generateAccessToken responded ${impersonateRes.status}`);
  }
  const impersonated = (await impersonateRes.json()) as {
    accessToken: string;
    expireTime: string;
  };
  cachedToken = {
    token: impersonated.accessToken,
    expiresAt: new Date(impersonated.expireTime).getTime(),
  };
  return impersonated.accessToken;
}

/* ------------------------------ Sheet writes ------------------------------ */

/**
 * Append one contact row, deduplicating on (email, source): the same address
 * may register interest in Pro AND join the newsletter (two rows), but never
 * twice for the same intent. A duplicate resolves successfully without
 * writing — the person is on the list either way.
 */
export async function appendContactRow(
  row: ContactRow
): Promise<{ duplicate: boolean }> {
  const config = readConfig();
  const token = await getAccessToken(config);
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values`;
  const auth = { Authorization: `Bearer ${token}` };

  // Unqualified ranges ("C:E", "A1") resolve against the FIRST sheet tab —
  // that tab is the combined contacts tab by convention (see module doc).
  // C=source, D=full_name, E=email per SHEET_COLUMNS.
  const readRes = await fetch(`${base}/C:E?majorDimension=ROWS`, {
    headers: auth,
  });
  if (!readRes.ok) {
    throw new Error(`Sheets read responded ${readRes.status}`);
  }
  const existing: string[][] =
    ((await readRes.json()) as { values?: string[][] }).values ?? [];
  const email = row.email.trim().toLowerCase();
  const duplicate = existing.some(
    (r) => r[0] === row.source && (r[2] ?? "").trim().toLowerCase() === email
  );
  if (duplicate) return { duplicate: true };

  const values = [
    [
      crypto.randomUUID(),
      new Date().toISOString(),
      row.source,
      row.full_name ?? "",
      row.email.trim(),
      row.is_healthcare_professional === undefined
        ? ""
        : String(row.is_healthcare_professional).toUpperCase(),
      row.role ?? "",
      row.country ?? "",
      row.city_region ?? "",
      row.notes ?? "",
      String(row.consent).toUpperCase(),
      row.locale ?? "",
      "new",
    ],
  ];

  const appendRes = await fetch(
    `${base}/A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ values }),
    }
  );
  if (!appendRes.ok) {
    throw new Error(`Sheets append responded ${appendRes.status}`);
  }
  return { duplicate: false };
}

/**
 * Column order of the ASCAT tab's header row — created by hand in the
 * spreadsheet (2026-10-07), keep in sync. ASCAT sign-ups get their own tab
 * rather than folding into the contacts superset: the evaluator/organisation/
 * newsletter flags and evaluation language are per-column so the rows can be
 * filtered and worked through directly during follow-up.
 */
export const ASCAT_SHEET_TAB = "ASCAT";
export const ASCAT_TAB_COLUMNS = [
  "timestamp",
  "role",
  "name",
  "email",
  "profession",
  "organisation",
  "website",
  "evaluator",
  "evaluation_language",
  "organisation_interest",
  "newsletter",
  "message",
] as const;

/**
 * Append one ASCAT sign-up to the ASCAT tab — same spreadsheet, credentials
 * and WIF flow as appendContactRow; only the target range differs. `clean`
 * is the whitelisted, validated field map from the route handler (checkboxes
 * are "on" when ticked, "" otherwise → written as TRUE/FALSE; blanks as "").
 * Every submission appends — no dedup: a repeat submission at a conference
 * usually carries new information, and the timestamp orders them.
 */
export async function appendAscatRow(
  clean: Record<string, string>
): Promise<void> {
  const config = readConfig();
  const token = await getAccessToken(config);
  const bool = (value: string | undefined) => (value ? "TRUE" : "FALSE");

  const values = [
    [
      new Date().toISOString(),
      clean.role ?? "",
      clean.name ?? "",
      (clean.email ?? "").trim(),
      clean.profession ?? "",
      clean.organisation ?? "",
      clean.website ?? "",
      bool(clean.evaluator),
      clean.evaluation_language ?? "",
      bool(clean.organisation_interest),
      bool(clean.newsletter),
      clean.message ?? "",
    ],
  ];

  const range = encodeURIComponent(`'${ASCAT_SHEET_TAB}'!A1`);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values }),
    }
  );
  if (!res.ok) {
    throw new Error(`Sheets append (ASCAT tab) responded ${res.status}`);
  }
}

/**
 * Column order of the scdaa tab's header row — created by hand in the
 * spreadsheet (2026-10-14), keep in sync. Same rationale as the ASCAT tab
 * (one column per field, filterable during follow-up), but a different field
 * set: the SCDAA audience is mostly patients, families and community-based
 * organizations, so `city_state` and `try_product` replace ASCAT's
 * `evaluation_language`, and US spelling ("organization") is used throughout.
 *
 * NOTE the order difference from the form: the sheet puts `profession` before
 * `organization`, the form asks for `organization` first. The mapping in
 * appendScdaaRow is the single place that reconciles them.
 */
export const SCDAA_SHEET_TAB = "scdaa";
export const SCDAA_TAB_COLUMNS = [
  "timestamp",
  "role",
  "name",
  "email",
  "profession",
  "organization",
  "website",
  "city_state",
  "try_product",
  "org_interest",
  "evaluator",
  "newsletter",
  "message",
] as const;

/**
 * Has this instance already confirmed the scdaa header row? Only a SUCCESSFUL
 * check is cached, so correcting the sheet recovers without a redeploy.
 */
let scdaaHeadersVerified = false;

/**
 * Verify row 1 of the scdaa tab matches SCDAA_TAB_COLUMNS exactly before the
 * first write of an instance's life. Headers are NEVER written: the tab is
 * created by hand, and silently appending to a tab whose columns have shifted
 * would scatter contacts across the wrong fields.
 *
 * Deliberately throws a plain Error, not SheetsConfigError — the route turns
 * SheetsConfigError into `{ok:true, persisted:false}`, which would show the
 * visitor "Thank you" while dropping their details. A header mismatch must
 * surface as a 500 and the form's inline error, so the submission is retried
 * once the sheet is fixed rather than lost quietly.
 */
async function assertScdaaHeaders(
  config: WifConfig,
  token: string
): Promise<void> {
  if (scdaaHeadersVerified) return;

  const range = encodeURIComponent(`'${SCDAA_SHEET_TAB}'!1:1`);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${range}?majorDimension=ROWS`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) {
    throw new Error(
      `Sheets header read (scdaa tab) responded ${res.status} — ` +
        `does the "${SCDAA_SHEET_TAB}" tab exist?`
    );
  }
  const header =
    ((await res.json()) as { values?: string[][] }).values?.[0] ?? [];
  const actual = header.map((cell) => (cell ?? "").trim());
  const expected = [...SCDAA_TAB_COLUMNS];
  const matches =
    actual.length === expected.length &&
    expected.every((name, i) => actual[i] === name);
  if (!matches) {
    throw new Error(
      `Sheets header mismatch on the "${SCDAA_SHEET_TAB}" tab. ` +
        `Expected row 1 to be exactly [${expected.join(", ")}] ` +
        `but found [${actual.join(", ")}]. Fix the tab by hand — this code ` +
        `never writes headers.`
    );
  }
  scdaaHeadersVerified = true;
}

/**
 * Append one SCDAA sign-up to the scdaa tab — same spreadsheet, credentials
 * and WIF flow as appendContactRow and appendAscatRow; only the target range
 * and column mapping differ. `clean` is the whitelisted, validated field map
 * from the route handler (checkboxes are "on" when ticked, "" otherwise →
 * written as TRUE/FALSE; blanks as ""). Every submission appends — no dedup,
 * for the same reason as ASCAT: a repeat submission at a conference usually
 * carries new information, and the timestamp orders them.
 */
export async function appendScdaaRow(
  clean: Record<string, string>
): Promise<void> {
  const config = readConfig();
  const token = await getAccessToken(config);
  await assertScdaaHeaders(config, token);
  const bool = (value: string | undefined) => (value ? "TRUE" : "FALSE");

  // Order must match SCDAA_TAB_COLUMNS (A–M), not the form's field order.
  const values = [
    [
      new Date().toISOString(),
      clean.role ?? "",
      clean.name ?? "",
      (clean.email ?? "").trim(),
      clean.profession ?? "",
      clean.organization ?? "",
      clean.website ?? "",
      clean.city_state ?? "",
      bool(clean.try_product),
      bool(clean.org_interest),
      bool(clean.evaluator),
      bool(clean.newsletter),
      clean.message ?? "",
    ],
  ];

  const range = encodeURIComponent(`'${SCDAA_SHEET_TAB}'!A1`);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values }),
    }
  );
  if (!res.ok) {
    throw new Error(`Sheets append (scdaa tab) responded ${res.status}`);
  }
}

/**
 * Column order of the evaluations tab (/evaluations rater sign-ups) — tab and
 * header created 2026-10-27, keep in sync. Unlike the ASCAT and scdaa tabs,
 * ensureEvaluationsTab will also recreate the tab and header if they are
 * missing. The form's `institution` field lands in the `organisation` column.
 * The sheet's Apps Script notifier watches this tab's `timestamp` column.
 */
export const EVALUATIONS_SHEET_TAB = "evaluations";
export const EVALUATIONS_TAB_COLUMNS = [
  "timestamp",
  "name",
  "email",
  "stage",
  "qualification",
  "organisation",
  "evaluation_language",
  "referred_by",
  "newsletter",
  "message",
] as const;

/** Only a SUCCESSFUL check is cached, as for the scdaa header. */
let evaluationsTabVerified = false;

/**
 * Make sure the evaluations tab exists with EVALUATIONS_TAB_COLUMNS as row 1:
 * add the tab if it is missing, write the header if row 1 is empty. A row 1
 * that holds anything else is never overwritten — it throws a plain Error
 * (not SheetsConfigError, for the reason given on assertScdaaHeaders), so a
 * hand-edited tab fails loudly instead of scattering rows across the wrong
 * columns.
 */
async function ensureEvaluationsTab(
  config: WifConfig,
  token: string
): Promise<void> {
  if (evaluationsTabVerified) return;
  const spreadsheet = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}`;
  const auth = { Authorization: `Bearer ${token}` };

  const metaRes = await fetch(`${spreadsheet}?fields=sheets.properties.title`, {
    headers: auth,
  });
  if (!metaRes.ok) {
    throw new Error(`Sheets metadata read responded ${metaRes.status}`);
  }
  const meta = (await metaRes.json()) as {
    sheets?: { properties?: { title?: string } }[];
  };
  const exists = (meta.sheets ?? []).some(
    (sheet) => sheet.properties?.title === EVALUATIONS_SHEET_TAB
  );

  if (!exists) {
    const addRes = await fetch(`${spreadsheet}:batchUpdate`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [{ addSheet: { properties: { title: EVALUATIONS_SHEET_TAB } } }],
      }),
    });
    // Two cold instances can race to add the tab; the loser's "already
    // exists" 400 means the tab is there, which is all we need.
    if (!addRes.ok && !(await addRes.text()).includes("already exists")) {
      throw new Error(`Sheets addSheet (evaluations tab) responded ${addRes.status}`);
    }
  }

  const range = encodeURIComponent(`'${EVALUATIONS_SHEET_TAB}'!1:1`);
  const headerRes = await fetch(
    `${spreadsheet}/values/${range}?majorDimension=ROWS`,
    { headers: auth }
  );
  if (!headerRes.ok) {
    throw new Error(
      `Sheets header read (evaluations tab) responded ${headerRes.status}`
    );
  }
  const header =
    ((await headerRes.json()) as { values?: string[][] }).values?.[0] ?? [];
  const actual = header.map((cell) => (cell ?? "").trim());
  const expected = [...EVALUATIONS_TAB_COLUMNS];

  if (actual.every((cell) => cell === "")) {
    const writeRange = encodeURIComponent(`'${EVALUATIONS_SHEET_TAB}'!A1`);
    const writeRes = await fetch(
      `${spreadsheet}/values/${writeRange}?valueInputOption=RAW`,
      {
        method: "PUT",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({ values: [expected] }),
      }
    );
    if (!writeRes.ok) {
      throw new Error(
        `Sheets header write (evaluations tab) responded ${writeRes.status}`
      );
    }
  } else if (
    actual.length !== expected.length ||
    !expected.every((name, i) => actual[i] === name)
  ) {
    throw new Error(
      `Sheets header mismatch on the "${EVALUATIONS_SHEET_TAB}" tab. ` +
        `Expected row 1 to be exactly [${expected.join(", ")}] ` +
        `but found [${actual.join(", ")}]. Fix the tab by hand — this code ` +
        `only writes the header into an empty row 1.`
    );
  }
  evaluationsTabVerified = true;
}

/**
 * Append one rater sign-up to the evaluations tab — same spreadsheet,
 * credentials and WIF flow as the other tabs. `clean` is the whitelisted,
 * validated field map (newsletter is "on" when ticked → TRUE/FALSE). Every
 * submission appends — no dedup; the timestamp orders repeats.
 */
export async function appendEvaluationRow(
  clean: Record<string, string>
): Promise<void> {
  const config = readConfig();
  const token = await getAccessToken(config);
  await ensureEvaluationsTab(config, token);

  // Order must match EVALUATIONS_TAB_COLUMNS (A–J).
  const values = [
    [
      new Date().toISOString(),
      clean.name ?? "",
      (clean.email ?? "").trim(),
      clean.stage ?? "",
      clean.qualification ?? "",
      clean.institution ?? "",
      clean.evaluation_language ?? "",
      clean.referred_by ?? "",
      clean.newsletter ? "TRUE" : "FALSE",
      clean.message ?? "",
    ],
  ];

  const range = encodeURIComponent(`'${EVALUATIONS_SHEET_TAB}'!A1`);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values }),
    }
  );
  if (!res.ok) {
    throw new Error(`Sheets append (evaluations tab) responded ${res.status}`);
  }
}
