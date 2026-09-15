/**
 * Google Analytics 4 wiring.
 *
 * The measurement ID lives here rather than in an environment variable for the
 * same reason the Voiceflow IDs do (see `lib/voiceflow.ts`): gtag.js ships it to
 * every visitor in the page source, so it is public by design, and it is wiring
 * no content editor should ever have to think about. Keeping it in the repo also
 * means preview deploys and local dev need no extra Vercel configuration.
 *
 * Collection runs on the production deployment only. `VERCEL_ENV` is set by
 * Vercel automatically ("production" | "preview" | "development") and is read on
 * the server, so `next dev` and preview builds never send hits and the property
 * stays free of our own testing traffic.
 */

export const GA_MEASUREMENT_ID = "G-343BSR99X0";

/** True only on the production deployment of sckin.org. */
export const analyticsEnabled = process.env.VERCEL_ENV === "production";

/**
 * Passed to gtag `config`. Both flags are deliberate for a patient-facing site:
 * they switch off Google Signals and ad-personalization signals at the tag, so
 * the behaviour does not depend on a dashboard toggle staying unchecked. Google
 * treats health as a sensitive interest category and bars advertiser-curated
 * audiences (remarketing, Customer Match, lookalikes) for it anyway, so this
 * costs us nothing we are permitted to use. Ad Grants conversion tracking does
 * not rely on either flag.
 */
export const GA_CONFIG = {
  allow_google_signals: false,
  allow_ad_personalization_signals: false,
} as const;
