import Script from "next/script";
import { CLOUDFLARE_BEACON_TOKEN, analyticsEnabled } from "@/lib/analytics";

/**
 * Cloudflare Web Analytics beacon, rendered once from the root layout.
 *
 * Cookieless (no consent banner needed) and collects no personal profile.
 * Its job here is real-user page-speed data — Core Web Vitals from visitors'
 * actual phones and connections — which matters for an audience largely on
 * mobile networks. Visit counts from it are secondary: Vercel Web Analytics is
 * the official count the Impact page quotes, and the three tools will never
 * agree exactly.
 *
 * Returns null outside the production deployment, like GoogleAnalytics, so
 * preview and local traffic never reach the dashboard.
 */
export default function CloudflareWebAnalytics() {
  if (!analyticsEnabled) return null;

  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token: CLOUDFLARE_BEACON_TOKEN })}
      strategy="afterInteractive"
    />
  );
}
