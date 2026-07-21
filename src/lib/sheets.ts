/**
 * Server-only Google Sheets bridge: appends form submissions as rows to the
 * combined "contacts" Sheet using a Google **service account** (JWT → OAuth2
 * access token → Sheets REST API). No SDK dependency — the token exchange is
 * ~30 lines of node:crypto, keeping the stack vanilla and portable.
 *
 * DO NOT import this from a client component. It reads process.env and signs
 * with the service-account private key, which must never reach client JS.
 * Forms post to our own `/api/*` route; the route calls this.
 *
 * Env (server-side only, set in Vercel):
 *   GOOGLE_SERVICE_ACCOUNT_KEY   — the service account's JSON key, verbatim
 *                                  (GOOGLE_SERVICE_ACCOUNT_KEY_JSON also read)
 *   SHEETS_SPREADSHEET_ID        — the target spreadsheet's ID
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

/** Thrown when the service-account key or spreadsheet ID is not configured. */
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
const TOKEN_URL = "https://oauth2.googleapis.com/token";

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

function readConfig(): { account: ServiceAccount; spreadsheetId: string } {
  const rawKey =
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY ??
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON;
  const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID;
  if (!rawKey || !spreadsheetId) {
    throw new SheetsConfigError(
      "GOOGLE_SERVICE_ACCOUNT_KEY and SHEETS_SPREADSHEET_ID must be set"
    );
  }

  let parsed: Partial<ServiceAccount>;
  try {
    parsed = JSON.parse(rawKey);
  } catch {
    throw new SheetsConfigError("GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON");
  }
  if (!parsed.client_email || !parsed.private_key) {
    throw new SheetsConfigError(
      "service-account key JSON must include client_email and private_key"
    );
  }
  return {
    account: { client_email: parsed.client_email, private_key: parsed.private_key },
    spreadsheetId,
  };
}

/* ----------------------- OAuth2 (JWT bearer grant) ------------------------ */

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(account: ServiceAccount): Promise<string> {
  // Instance-local cache; a cold start just fetches a fresh token.
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(
    JSON.stringify({ alg: "RS256", typ: "JWT" })
  ).toString("base64url");
  const claims = Buffer.from(
    JSON.stringify({
      iss: account.client_email,
      scope: SHEETS_SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  ).toString("base64url");
  const unsigned = `${header}.${claims}`;
  // Env vars often store the PEM with literal "\n" — restore real newlines.
  const privateKey = account.private_key.replace(/\\n/g, "\n");
  const signature = crypto
    .createSign("RSA-SHA256")
    .update(unsigned)
    .sign(privateKey)
    .toString("base64url");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token endpoint responded ${res.status}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
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
  const { account, spreadsheetId } = readConfig();
  const token = await getAccessToken(account);
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values`;
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
