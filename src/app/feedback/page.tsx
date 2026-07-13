import type { Metadata } from "next";

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
    <article data-page="feedback">
      <h1>Feedback</h1>
      <p>
        We&rsquo;d love to hear from you. A feedback form will be available here
        soon.
      </p>
    </article>
  );
}
