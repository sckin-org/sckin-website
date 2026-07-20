import type { Metadata } from "next";
import { getPrivacy } from "@/lib/content";
import LegalDocument from "@/components/LegalDocument";

export function generateMetadata(): Metadata {
  const { frontmatter } = getPrivacy();
  return {
    title: frontmatter.title,
    description:
      "How SCKIN collects, uses, and protects information from people using SickleCellPedia / Drepanopedia.",
  };
}

/**
 * Privacy Policy, rendered from content/legal/privacy.md. Meta stores this URL
 * for the WhatsApp app review, so it must stay stable and publicly viewable.
 */
export default function PrivacyPage() {
  return <LegalDocument doc={getPrivacy()} />;
}
