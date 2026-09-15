import Script from "next/script";
import { GA_CONFIG, GA_MEASUREMENT_ID, analyticsEnabled } from "@/lib/analytics";

/**
 * Google Analytics 4 (gtag.js), rendered once from the root layout.
 *
 * Returns null outside the production deployment, so the scripts are absent from
 * the HTML entirely rather than loaded and suppressed.
 *
 * Scope note: this measures every page, including /sicklecellpedia. Excluding the
 * assistant page was considered and rejected — every URL on this domain is
 * sickle-cell-specific, so a pageview on /about carries the same inference as one
 * on /sicklecellpedia, and excluding it would remove the conversion signal that
 * Google Ad Grants requires. What visitors actually ask the assistant is never
 * seen by GA; it stays in Voiceflow. Keep condition and symptom names out of URLs
 * and page titles — gtag sends both as event parameters.
 *
 * GA4 sets cookies. A consent banner (Google Consent Mode) is required before
 * driving UK/EU traffic here and is not yet implemented.
 */
export default function GoogleAnalytics() {
  if (!analyticsEnabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', ${JSON.stringify(GA_CONFIG)});`}
      </Script>
    </>
  );
}
