import type { Metadata } from "next";
import { getAllNews, getNewsFacets } from "@/lib/content";
import NewsBrowser from "@/components/NewsBrowser";

export const metadata: Metadata = {
  title: "Sickle Cell News",
  description:
    "AI-assisted summaries of reliable sickle cell disease coverage, linked to the source and filterable by topic and geography.",
};

export default function NewsPage() {
  const posts = getAllNews();
  const { topics, geographies } = getNewsFacets();

  return (
    <article data-page="news">
      <h1>Sickle Cell News</h1>
      <NewsBrowser
        posts={posts.map((p) => ({
          slug: p.slug,
          title: p.frontmatter.title,
          date: p.frontmatter.date,
          summary: p.frontmatter.summary,
          source_url: p.frontmatter.source_url,
          topics: p.frontmatter.topics ?? [],
          geographies: p.frontmatter.geographies ?? [],
        }))}
        topics={topics}
        geographies={geographies}
      />
    </article>
  );
}
