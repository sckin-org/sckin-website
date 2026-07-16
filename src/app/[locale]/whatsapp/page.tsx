import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WhatsApp",
  description: "Reach SickleCellPedia on WhatsApp.",
};

/**
 * Utility route preserved from the previous site. Points users to the
 * SickleCellPedia WhatsApp channel; the concrete link is filled in later.
 */
export default function WhatsappPage() {
  return (
    <article data-page="whatsapp">
      <h1>SickleCellPedia on WhatsApp</h1>
      <p>Chat with SickleCellPedia on WhatsApp. Link coming soon.</p>
    </article>
  );
}
