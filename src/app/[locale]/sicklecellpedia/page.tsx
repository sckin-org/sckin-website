import type { Metadata } from "next";
import { getSicklecellpedia } from "@/lib/content";
import Prose from "@/components/Prose";

export function generateMetadata(): Metadata {
  const { frontmatter } = getSicklecellpedia();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/**
 * SickleCellPedia — hosts the Voiceflow chat embed. The embed itself is wired
 * during the design handoff; the frontmatter carries the Voiceflow config.
 */
export default function SicklecellpediaPage() {
  const { frontmatter, html } = getSicklecellpedia();

  return (
    <article data-page="sicklecellpedia">
      <h1>{frontmatter.title}</h1>
      {frontmatter.intro ? <p>{frontmatter.intro}</p> : null}

      <div
        data-embed="voiceflow"
        data-project-id={frontmatter.voiceflow?.project_id}
        data-embed-url={frontmatter.voiceflow?.embed_url}
      >
        {/* Voiceflow chat embed mounts here. */}
        <p>SickleCellPedia chat loads here.</p>
      </div>

      <Prose html={html} />
    </article>
  );
}
