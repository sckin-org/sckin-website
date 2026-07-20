import type { Metadata } from "next";
import { getTerms } from "@/lib/content";
import LegalDocument from "@/components/LegalDocument";

export function generateMetadata(): Metadata {
  const { frontmatter } = getTerms();
  return {
    title: frontmatter.title,
    description:
      "The terms that govern use of the SickleCellPedia / Drepanopedia chatbot.",
  };
}

/**
 * User Agreement, rendered from content/legal/terms.md. Meta stores this URL
 * for the WhatsApp app review, so it must stay stable and publicly viewable.
 */
export default function TermsPage() {
  return <LegalDocument doc={getTerms()} />;
}
