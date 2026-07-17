import type { Metadata } from "next";
import Image from "next/image";
import { getSicklecellpedia, renderAccessBody } from "@/lib/content";
import Prose from "@/components/Prose";
import VoiceflowAutoOpen from "@/components/VoiceflowAutoOpen";

export function generateMetadata(): Metadata {
  const { frontmatter } = getSicklecellpedia();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/**
 * SickleCellPedia — the page for trying the chat.
 *
 * The widget itself is loaded site-wide by <VoiceflowWidget /> in the root
 * layout; this page adds <VoiceflowAutoOpen /> so the chat is already open when
 * a visitor arrives, which is what the "Web" access copy promises. The access
 * sections below cover the other ways in (WhatsApp, Messenger).
 */
export default function SicklecellpediaPage() {
  const { frontmatter, html } = getSicklecellpedia();

  return (
    <article data-page="sicklecellpedia">
      <VoiceflowAutoOpen />

      <h1>{frontmatter.title}</h1>
      {frontmatter.intro ? <p>{frontmatter.intro}</p> : null}

      {frontmatter.access?.map((channel) => (
        <section key={channel.id} id={channel.id} data-access={channel.id}>
          <h2>{channel.heading}</h2>
          <p
            dangerouslySetInnerHTML={{ __html: renderAccessBody(channel.body) }}
          />

          {channel.image ? (
            <Image
              src={channel.image}
              alt={channel.image_alt ?? ""}
              width={256}
              height={256}
            />
          ) : null}
        </section>
      ))}

      <Prose html={html} />
    </article>
  );
}
