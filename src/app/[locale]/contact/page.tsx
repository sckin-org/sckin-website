import type { Metadata } from "next";
import Link from "next/link";
import { getContact } from "@/lib/content";
import PageHeader from "@/components/PageHeader";
import Prose from "@/components/Prose";
import SubmissionForm from "@/components/SubmissionForm";

export function generateMetadata(): Metadata {
  const { frontmatter } = getContact();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/**
 * Contact page — hero → deflect → form → schedule → direct. The deflect block
 * sits ABOVE the form on purpose: most visitors want a sickle cell question
 * answered, and SickleCellPedia does that instantly, so we point them there
 * before offering a form that waits on a human.
 */
export default function ContactPage() {
  const { frontmatter, html } = getContact();
  const { hero, deflect, form, schedule, direct } = frontmatter;

  return (
    <div className="px-6 py-14 md:px-12 md:py-20">
      <article data-page="contact" className="mx-auto max-w-[720px]">
        <PageHeader title={hero.headline} subhead={hero.subhead} />

        {deflect ? (
          <section
            data-section="deflect"
            className="mt-8 rounded-lg bg-subtle p-6 md:p-7"
          >
            <h2 className="text-[19px] font-semibold text-heading">
              {deflect.heading}
            </h2>
            <p className="mt-2 text-[15px] leading-(--line-height-body) text-body text-pretty">
              {deflect.body}
            </p>
            <Link
              href={deflect.cta.href}
              className="mt-4 inline-block rounded-pill bg-cta px-5 py-2.5 text-[15px] font-semibold text-on-band transition-colors hover:bg-cta-hover hover:no-underline focus-visible:no-underline"
            >
              {deflect.cta.label}
            </Link>
          </section>
        ) : null}

        <section
          data-section="form"
          className="mt-10 border-t border-(--gray-100) pt-8"
        >
          {form.heading ? (
            <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-heading">
              {form.heading}
            </h2>
          ) : null}
          <div className="mt-6 max-w-[520px]">
            <SubmissionForm
              endpoint="/api/contact"
              fields={form.fields}
              submitLabel={form.submit_label}
              confirmation={form.confirmation}
              fallbackEmail={direct?.email ?? "contact@sckin.org"}
            />
          </div>
        </section>

        {schedule ? (
          <section
            data-section="schedule"
            className="mt-10 border-t border-(--gray-100) pt-8"
          >
            <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-heading">
              {schedule.heading}
            </h2>
            <p className="mt-2 text-[15px] leading-(--line-height-body) text-body text-pretty">
              {schedule.body}
            </p>
            <a
              href={schedule.cta.href}
              className="mt-3 inline-block text-[15px] font-semibold text-link transition-colors hover:text-link-hover"
            >
              {schedule.cta.label} →
            </a>
          </section>
        ) : null}

        {direct ? (
          <section
            data-section="direct"
            className="mt-10 border-t border-(--gray-100) pt-8"
          >
            {direct.email ? (
              <p className="text-[15px] text-body">
                <a
                  href={`mailto:${direct.email}`}
                  className="font-semibold text-link transition-colors hover:text-link-hover"
                >
                  {direct.email}
                </a>
              </p>
            ) : null}
            <ul data-role="social" className="mt-2 flex gap-4">
              {direct.facebook ? (
                <li>
                  <a
                    href={direct.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[15px] font-semibold text-link transition-colors hover:text-link-hover"
                  >
                    Facebook
                  </a>
                </li>
              ) : null}
              {direct.linkedin ? (
                <li>
                  <a
                    href={direct.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[15px] font-semibold text-link transition-colors hover:text-link-hover"
                  >
                    LinkedIn
                  </a>
                </li>
              ) : null}
            </ul>
          </section>
        ) : null}

        <Prose html={html} className="mt-8" />
      </article>
    </div>
  );
}
