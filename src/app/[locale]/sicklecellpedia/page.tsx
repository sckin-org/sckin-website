import type { Metadata } from "next";
import Image from "next/image";
import { getSicklecellpedia, renderAccessBody } from "@/lib/content";
import Prose from "@/components/Prose";
import VoiceflowEmbed from "@/components/VoiceflowEmbed";

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
 * The chat renders as an always-open inline pane immediately below the intro
 * (<VoiceflowEmbed />), so visitors can start typing right away. The access
 * sections below cover the other ways in (WhatsApp with QR, Messenger),
 * followed by the EN/FR bilingual note.
 */
export default function SicklecellpediaPage() {
  const { frontmatter, html } = getSicklecellpedia();

  return (
    <article data-page="sicklecellpedia">
      <h1>{frontmatter.title}</h1>
      {frontmatter.intro ? <p>{frontmatter.intro}</p> : null}

      <VoiceflowEmbed />

      {frontmatter.access?.length ? (
        <section data-section="access">
          {frontmatter.access_heading ? (
            <h2>{frontmatter.access_heading}</h2>
          ) : null}

          {frontmatter.access.map((channel) => (
            <section key={channel.id} id={channel.id} data-access={channel.id}>
              <h3>{channel.heading}</h3>
              <p
                dangerouslySetInnerHTML={{
                  __html: renderAccessBody(channel.body),
                }}
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
        </section>
      ) : null}

      {frontmatter.note ? <p data-role="note">{frontmatter.note}</p> : null}

      <Prose html={html} />
    </article>
  );
}
