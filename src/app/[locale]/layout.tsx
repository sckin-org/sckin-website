import type { Metadata } from "next";
import "../globals.css";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import VoiceflowWidget from "@/components/VoiceflowWidget";
import { LOCALES, isLocale, type Locale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: {
    default: "SCKIN — Sickle Cell Knowledge and Information Network",
    template: "%s — SCKIN",
  },
  description:
    "SCKIN is a 501(c)(3) nonprofit making useful, reliable information about sickle cell disease universally accessible.",
};

/** Prerender one tree per supported locale. Adding "fr" to LOCALES is enough. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

// Only the locales we ship exist; unknown prefixes 404 rather than rendering.
export const dynamicParams = false;

/**
 * Root layout, scoped to the `[locale]` segment. This is the top-most layout in
 * the app tree, so it owns <html>/<body>. `lang` reflects the active locale so
 * it is correct the moment a second language is added.
 */
export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const activeLocale = locale as Locale;

  return (
    <html lang={activeLocale}>
      <body>
        <SiteHeader locale={activeLocale} />
        <main>{children}</main>
        <SiteFooter locale={activeLocale} />
        {/* Collapsed chat launcher, every page. /sicklecellpedia additionally
            auto-opens it — see <VoiceflowAutoOpen />. */}
        <VoiceflowWidget />
      </body>
    </html>
  );
}
