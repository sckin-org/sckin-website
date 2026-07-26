import type { Metadata } from "next";
import Image from "next/image";
import { getSicklecellpedia, renderAccessBody } from "@/lib/content";
import PageHeader from "@/components/PageHeader";
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
 * cards below cover the other ways in (WhatsApp with QR, Messenger),
 * followed by the EN/FR bilingual note.
 */
export default function SicklecellpediaPage() {
  const { frontmatter, html } = getSicklecellpedia();

  return (
    <div className="px-6 py-14 md:px-12 md:py-20">
      <article data-page="sicklecellpedia" className="mx-auto max-w-[720px]">
        <PageHeader title={frontmatter.title} subhead={frontmatter.intro} />

        <div className="mt-8 overflow-hidden rounded-lg border border-hairline">
          <VoiceflowEmbed />
        </div>

        {frontmatter.access?.length ? (
          <section data-section="access" className="mt-10">
            {frontmatter.access_heading ? (
              <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-heading">
                {frontmatter.access_heading}
              </h2>
            ) : null}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {frontmatter.access.map((channel) => (
                <section
                  key={channel.id}
                  id={channel.id}
                  data-access={channel.id}
                  className="rounded-lg bg-subtle p-6"
                >
                  <h3 className="text-[17px] font-semibold text-heading">
                    {channel.heading}
                  </h3>
                  <p
                    className="prose-sckin mt-2.5 text-[15px]"
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
                      className="mt-4 rounded-md"
                    />
                  ) : null}
                </section>
              ))}
            </div>
          </section>
        ) : null}

        {frontmatter.note ? (
          <p data-role="note" className="mt-6 text-[13px] leading-normal text-muted">
            {frontmatter.note}
          </p>
        ) : null}

        <Prose html={html} className="mt-8" />
      </article>
    </div>
  );
}
