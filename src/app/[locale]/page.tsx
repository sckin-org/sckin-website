import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getHome } from "@/lib/content";
import Prose from "@/components/Prose";
import SubmissionForm from "@/components/SubmissionForm";

export function generateMetadata(): Metadata {
  const { frontmatter } = getHome();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/**
 * Home page. Renders the structured frontmatter from content/home.md.
 * Unstyled placeholder layout — visual design arrives from the Claude Design
 * handoff.
 */
export default function HomePage() {
  const { frontmatter, html } = getHome();
  const { hero, stats, statement, hypothesis, tools, get_involved, signup } =
    frontmatter;

  return (
    <article data-page="home">
      <section data-section="hero">
        <h1>{hero.headline}</h1>
        <p>{hero.subhead}</p>
        {/* TODO: render hero.image once home-hero.jpg lands in public/images/
            (alt text also TO ADD in content/home.md). */}
        {hero.cta ? (
          <Link href={hero.cta.href} data-role="cta">
            {hero.cta.label}
          </Link>
        ) : null}
        {hero.secondary_cta ? (
          <Link href={hero.secondary_cta.href} data-role="cta-secondary">
            {hero.secondary_cta.label}
          </Link>
        ) : null}
      </section>

      {stats?.length ? (
        <section data-section="stats">
          {stats.map((s, i) => (
            <div key={i}>
              <p data-role="figure">{s.figure}</p>
              <p data-role="caption">{s.caption}</p>
            </div>
          ))}
        </section>
      ) : null}

      {statement ? (
        <section data-section="statement">
          <p>{statement}</p>
        </section>
      ) : null}

      {hypothesis ? (
        <section data-section="hypothesis">
          <h2>{hypothesis.heading}</h2>
          <p>{hypothesis.body}</p>
        </section>
      ) : null}

      {tools?.items?.length ? (
        <section data-section="tools">
          <h2>{tools.heading}</h2>
          {tools.intro ? <p>{tools.intro}</p> : null}
          {tools.items.map((t, i) => (
            <div key={i} data-role="tool">
              <h3>{t.name}</h3>
              {t.status ? <p data-role="status">{t.status}</p> : null}
              <p>{t.description}</p>
              {/* TODO: render t.image once the home-tool-*.jpg files land in
                  public/images/ (alt text TO ADD in content/home.md). */}
              {t.cta ? <Link href={t.cta.href}>{t.cta.label}</Link> : null}
              {t.whatsapp ? (
                <a
                  href={t.whatsapp.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.whatsapp.label}
                </a>
              ) : null}
              {t.qr ? (
                <Image src={t.qr.src} alt={t.qr.alt} width={192} height={192} />
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {get_involved ? (
        <section data-section="get-involved">
          <h2>{get_involved.heading}</h2>
          {get_involved.ctas.map((cta, i) =>
            cta.external ? (
              <a
                key={i}
                href={cta.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {cta.label}
              </a>
            ) : (
              <Link key={i} href={cta.href} data-role="cta">
                {cta.label}
              </Link>
            )
          )}
        </section>
      ) : null}

      {signup ? (
        <section data-section="signup">
          <h2>{signup.heading}</h2>
          {signup.subtext ? <p>{signup.subtext}</p> : null}
          <SubmissionForm
            endpoint="/api/newsletter"
            fields={[
              {
                name: "email",
                label: signup.field_label,
                type: "email",
                required: true,
              },
            ]}
            submitLabel={signup.submit_label}
            confirmation={signup.confirmation}
            fallbackEmail="contact@sckin.org"
          />
        </section>
      ) : null}

      <Prose html={html} />
    </article>
  );
}
