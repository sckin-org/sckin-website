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
