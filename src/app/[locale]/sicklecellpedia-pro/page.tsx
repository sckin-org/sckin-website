import type { Metadata } from "next";
import { getSicklecellpediaPro } from "@/lib/content";
import PageHeader from "@/components/PageHeader";
import Prose from "@/components/Prose";
import SubmissionForm from "@/components/SubmissionForm";

export function generateMetadata(): Metadata {
  const { frontmatter } = getSicklecellpediaPro();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/**
 * SickleCellPedia Pro — pre-launch page: tagline, intro, the four feature
 * blocks, then the "Register your interest" lead-capture form at #register
 * (styled per the lead-form comp, Homepage.dc.html §4c). The form posts to
 * /api/pro-lead, which appends to the contacts Google Sheet.
 */
export default function SicklecellpediaProPage() {
  const { frontmatter, html } = getSicklecellpediaPro();
  const { tagline, intro, status, features, register, form } = frontmatter;

  return (
    <div className="px-6 py-14 md:px-12 md:py-20">
      <article data-page="sicklecellpedia-pro" className="mx-auto max-w-[720px]">
        <PageHeader title={frontmatter.title} subhead={tagline} />
        {status ? (
          <p data-role="status" className="mt-4">
            <span className="rounded-pill border border-hairline-strong px-2.5 py-[3px] text-[12px] font-semibold uppercase tracking-[0.04em] text-body">
              {status}
            </span>
          </p>
        ) : null}
        {intro ? (
          <p className="mt-6 text-[17px] leading-(--line-height-body) text-body text-pretty">
            {intro}
          </p>
        ) : null}

        {features?.length ? (
          <section data-section="features" className="mt-10">
            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
              {features.map((feature, i) => (
                <div
                  key={i}
                  data-role="feature"
                  className="border-t border-(--gray-100) pt-4"
                >
                  <h3 className="text-[17px] font-semibold text-heading">
                    {feature.name}
                  </h3>
                  <p className="mt-1.5 text-[15px] leading-(--line-height-body) text-body text-pretty">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {form ? (
          <section
            id="register"
            data-section="register"
            className="mt-10 border-t border-(--gray-100) pt-10"
          >
            <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-heading">
              {register?.heading ?? "Register your interest"}
            </h2>
            {register?.subtext ? (
              <p className="mt-2 text-[15px] leading-(--line-height-body) text-body text-pretty">
                {register.subtext}
              </p>
            ) : null}
            <div className="mt-6 max-w-[520px]">
              <SubmissionForm
                endpoint="/api/pro-lead"
                fields={form.fields}
                submitLabel={form.submit_label}
                confirmation={form.confirmation}
                fallbackEmail="contact@sckin.org"
              />
            </div>
          </section>
        ) : null}

        <Prose html={html} className="mt-8" />
      </article>
    </div>
  );
}
