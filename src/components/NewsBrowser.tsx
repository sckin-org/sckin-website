"use client";

import { useState } from "react";
import Link from "next/link";

interface NewsItem {
  slug: string;
  title: string;
  date: string;
  summary: string;
  source_url?: string;
  topics: string[];
  geographies: string[];
}

/**
 * Client-side news browser: filters posts by topic and geography.
 * Unstyled placeholder controls — the design handoff restyles the filter UI.
 *
 * PARKED until the September 2026 News launch: the landing page renders a
 * plain card list for now (master doc v3.1 says announce the feature without
 * detailed taxonomy). Re-mount this from src/app/[locale]/news/page.tsx when
 * the topic/geography lists are fixed — getNewsFacets() already derives the
 * options dynamically.
 */
export default function NewsBrowser({
  posts,
  topics,
  geographies,
}: {
  posts: NewsItem[];
  topics: string[];
  geographies: string[];
}) {
  const [topic, setTopic] = useState<string>("");
  const [geography, setGeography] = useState<string>("");

  const filtered = posts.filter(
    (p) =>
      (topic === "" || p.topics?.includes(topic)) &&
      (geography === "" || p.geographies?.includes(geography))
  );

  return (
    <div data-component="news-browser">
      <form data-role="filters">
        <label>
          Topic{" "}
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="">All topics</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label>
          Geography{" "}
          <select
            value={geography}
            onChange={(e) => setGeography(e.target.value)}
          >
            <option value="">All geographies</option>
            {geographies.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
      </form>

      {filtered.length ? (
        <ul>
          {filtered.map((post) => (
            <li key={post.slug} data-role="post">
              <h3>
                {post.source_url ? (
                  <Link href={post.source_url}>{post.title}</Link>
                ) : (
                  post.title
                )}
              </h3>
              <p data-role="date">{post.date}</p>
              <p>{post.summary}</p>
              <p data-role="tags">
                {[...(post.topics ?? []), ...(post.geographies ?? [])].join(
                  " · "
                )}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No posts match the selected filters.</p>
      )}
    </div>
  );
}
