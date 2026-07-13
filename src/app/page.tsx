import type { Metadata } from "next";
import Link from "next/link";
import { getHome } from "@/lib/content";

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
  const { frontmatter } = getHome();
  const { hero, stats, statement, tools } = frontmatter;

  return (
    <article data-page="home">
      <section data-section="hero">
        <h1>{hero.headline}</h1>
        <p>{hero.subhead}</p>
        {hero.cta ? (
          <Link href={hero.cta.href} data-role="cta">
            {hero.cta.label}
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

      {tools?.length ? (
        <section data-section="tools">
          <h2>What we&rsquo;re building</h2>
          {tools.map((t, i) => (
            <div key={i} data-role="tool">
              <h3>{t.name}</h3>
              <p>{t.description}</p>
              {t.status ? <p data-role="status">{t.status}</p> : null}
              {t.cta ? <Link href={t.cta.href}>{t.cta.label}</Link> : null}
            </div>
          ))}
        </section>
      ) : null}
    </article>
  );
}
