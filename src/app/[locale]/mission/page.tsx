import type { Metadata } from "next";
import Link from "next/link";
import { getMission } from "@/lib/content";
import Prose from "@/components/Prose";

export function generateMetadata(): Metadata {
  const { frontmatter } = getMission();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/**
 * Mission page. Renders the structured frontmatter from content/mission.md:
 * vision, mission, hypothesis, the "what this looks like in practice" scenarios,
 * and a closing statement with CTAs. Unstyled placeholder layout — visual design
 * arrives from the Claude Design handoff.
 */
export default function MissionPage() {
  const { frontmatter, html } = getMission();
  const { vision, mission, hypothesis, practice, closing } = frontmatter;

  return (
    <article data-page="mission">
      <h1>{frontmatter.title}</h1>

      {vision ? (
        <section id="vision">
          <h2>Our vision</h2>
          <p>{vision}</p>
        </section>
      ) : null}

      {mission ? (
        <section id="mission">
          <h2>Our mission</h2>
          <p>{mission}</p>
        </section>
      ) : null}

      {hypothesis ? (
        <section id="hypothesis">
          <h2>Our hypothesis</h2>
          <p>{hypothesis}</p>
        </section>
      ) : null}

      {practice?.cases?.length ? (
        <section id="practice">
          <h2>{practice.heading}</h2>
          {practice.intro ? <p>{practice.intro}</p> : null}
          {practice.cases.map((c, i) => (
            <div key={i} data-role="scenario">
              <h3>{c.title}</h3>
              <p>{c.description}</p>
            </div>
          ))}
          {practice.note ? (
            <p data-role="note">
              <em>{practice.note}</em>
            </p>
          ) : null}
        </section>
      ) : null}

      {closing ? (
        <section id="closing">
          <h2>{closing.statement}</h2>
          {closing.ctas?.length ? (
            <p data-role="ctas">
              {closing.ctas.map((cta, i) => (
                <Link key={i} href={cta.href} data-role="cta">
                  {cta.label}
                </Link>
              ))}
            </p>
          ) : null}
        </section>
      ) : null}

      <Prose html={html} />
    </article>
  );
}
