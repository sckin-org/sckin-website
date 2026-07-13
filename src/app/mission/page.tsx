import type { Metadata } from "next";
import { getMission } from "@/lib/content";

export function generateMetadata(): Metadata {
  const { frontmatter } = getMission();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

export default function MissionPage() {
  const { frontmatter } = getMission();
  const { mission, vision, hypothesis, use_cases } = frontmatter;

  return (
    <article data-page="mission">
      <h1>{frontmatter.title}</h1>

      {mission ? (
        <section id="mission">
          <h2>Mission</h2>
          <p>{mission}</p>
        </section>
      ) : null}

      {vision ? (
        <section id="vision">
          <h2>Vision</h2>
          <p>{vision}</p>
        </section>
      ) : null}

      {hypothesis ? (
        <section id="hypothesis">
          <h2>Hypothesis</h2>
          <p>{hypothesis}</p>
        </section>
      ) : null}

      {use_cases?.length ? (
        <section id="use-cases">
          <h2>Use cases</h2>
          {use_cases.map((u, i) => (
            <div key={i}>
              <h3>{u.title}</h3>
              <p>{u.description}</p>
            </div>
          ))}
        </section>
      ) : null}
    </article>
  );
}
