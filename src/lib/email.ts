/**
 * Server-only transactional email via Resend. Used by /api/evaluations to send
 * the rater their rating-form link and to notify the study lead of each
 * sign-up.
 *
 * Env (server-side only, set in Vercel):
 *   RESEND_API_KEY — Resend API key with sending access for sckin.org
 *
 * The sending domain (sckin.org) must be verified in Resend — DNS records in
 * docs/resend-dns.md. Emails are plain text: no template to maintain, and
 * user-entered fields can't inject markup.
 *
 * Never throws: a failed send is logged and reported as `false`, because the
 * sign-up is already saved and the page shows the form link either way.
 *
 * DO NOT import this from a client component.
 */
import { Resend } from "resend";
import { EVALUATION_FORM_LINKS, type EvaluationLanguage } from "@/lib/form-specs";

const FROM = "SCKIN <noreply@sckin.org>";
export const STUDY_CONTACT_EMAIL = "zacharie.liman.tinguiri@sckin.org";

async function send(
  label: string,
  message: { to: string; replyTo: string; subject: string; text: string }
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(`[email] RESEND_API_KEY not set — ${label} NOT sent`);
    return false;
  }
  try {
    // Built per call, not at module load: the constructor throws without a
    // key, which would turn every submission into a 500.
    const { error } = await new Resend(apiKey).emails.send({
      from: FROM,
      ...message,
    });
    if (error) {
      console.error(`[email] ${label} failed: ${error.name} — ${error.message}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[email] ${label} failed`, error);
    return false;
  }
}

/**
 * Send both /evaluations emails: the rater's form link, and the sign-up
 * notification to the study lead. Resolves to whether the RATER's email went
 * out — that is what the confirmation state's "we've also emailed it to you"
 * depends on.
 */
export async function sendEvaluationEmails(
  clean: Record<string, string>
): Promise<boolean> {
  const language = (clean.evaluation_language || "English") as EvaluationLanguage;
  const formLink = EVALUATION_FORM_LINKS[language] ?? EVALUATION_FORM_LINKS.English;
  // Header-safe: a newline in a subject line is rejected or mangled.
  const name = clean.name.replace(/\s+/g, " ");

  // No user-entered text in the rater email: it goes to whatever address was
  // submitted, so echoing the name would let anyone send their own words
  // from noreply@sckin.org.
  const raterText = [
    "Thank you for volunteering to evaluate SickleCellPedia.",
    "",
    `Here is the evaluation form (${language}):`,
    formLink,
    "",
    "It takes about 2 hours, and you can work through it at your own pace.",
    "",
    `If you have any questions, write to ${STUDY_CONTACT_EMAIL}.`,
    "",
    "With thanks,",
    "SCKIN — Sickle Cell Knowledge and Information Network",
    "https://sckin.org",
  ].join("\n");

  const field = (label: string, value: string | undefined) =>
    `${label}: ${value || "—"}`;
  const adminText = [
    "New evaluator sign-up from sckin.org/evaluations",
    "",
    field("Name", clean.name),
    field("Email", clean.email),
    field("Stage", clean.stage),
    field("Qualification", clean.qualification),
    field("Institution", clean.institution),
    field("Evaluation language", clean.evaluation_language),
    field("Referred by", clean.referred_by),
    field("Newsletter", clean.newsletter ? "Yes" : "No"),
    field("Message", clean.message),
  ].join("\n");

  const [raterSent] = await Promise.all([
    send("rater email", {
      to: clean.email,
      replyTo: STUDY_CONTACT_EMAIL,
      subject: "Your SickleCellPedia evaluation form",
      text: raterText,
    }),
    send("sign-up notification", {
      to: STUDY_CONTACT_EMAIL,
      replyTo: clean.email,
      subject: `New evaluator sign-up: ${name}`,
      text: adminText,
    }),
  ]);
  return raterSent;
}
