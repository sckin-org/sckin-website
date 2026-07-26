import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Share feedback with the SCKIN team.",
};

/**
 * Utility route preserved from the previous site. A feedback form or link is
 * wired in later.
 */
export default function FeedbackPage() {
  return (
    <div className="px-6 py-14 md:px-12 md:py-20">
      <article data-page="feedback" className="mx-auto max-w-[720px]">
        <PageHeader
          title="Feedback"
          subhead="We'd love to hear from you. A feedback form will be available here soon."
        />
      </article>
    </div>
  );
}
