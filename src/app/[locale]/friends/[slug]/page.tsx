import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllFriends,
  getFriend,
  publicFileExists,
  renderSectionBody,
} from "@/lib/content";
import { localizedHref, type Locale } from "@/lib/i18n";
import { FriendPhoto } from "@/components/FriendCard";
import ObfuscatedEmail from "@/components/ObfuscatedEmail";
import YouTubeEmbed from "@/components/YouTubeEmbed";

/** Only slugs with a content file exist; anything else is a 404. */
export const dynamicParams = false;

type Params = Promise<{ locale: string; slug: string }>;

/** One page per friend file, per locale (the layout supplies the locales). */
export function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  return getAllFriends(params.locale).map((friend) => ({ slug: friend.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const friend = getFriend(slug, locale);
  if (!friend) return {};
  const fm = friend.frontmatter;
  const title = fm.seo_title ?? `${fm.name} — Friends of SCKIN`;
  const description = fm.intro ?? fm.quote;
  // The Open Graph image is the portrait — it switches on the moment the
  // photo file lands at `photo` (initials placeholder meanwhile, no og:image).
  const hasPhoto = fm.photo ? publicFileExists(fm.photo) : false;
  const openGraph: Metadata["openGraph"] = {
    type: "profile",
    title,
    description,
    ...(hasPhoto && fm.photo
      ? {
          images: [
            {
              url: fm.photo,
              width: 960,
              height: 960,
              alt: fm.photo_alt ?? fm.name,
            },
          ],
        }
      : {}),
  };
  return {
    // Absolute: the layout's "%s — SCKIN" template would double the suffix.
    title: { absolute: title },
    description,
    openGraph,
  };
}

/**
 * A friend's story page (/friends/[slug]) — header (portrait · name · role ·
 * place · featured quote), the story sections, the videos, contact, and a
 * link back to the Friends of SCKIN section on /about. Headings run h1 →
 * h2 only; the name is a paragraph so the outline stays in order.
 */
export default async function FriendPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const activeLocale = locale as Locale;
  const friend = getFriend(slug, activeLocale);
  if (!friend) notFound();

  const fm = friend.frontmatter;
  const affiliation = [fm.role, fm.organization].filter(Boolean).join(", ");
  const backHref = localizedHref("/about#friends", activeLocale);
  const sectionHeading =
    "text-[22px] font-semibold tracking-[-0.01em] text-heading";

  return (
    <div className="px-6 py-14 md:px-12 md:py-20">
      <article data-page="friend" className="mx-auto max-w-[720px]">
        <header
          data-role="friend-header"
          className="md:flex md:items-start md:gap-8"
        >
          <div className="w-[160px] shrink-0 md:w-[200px]">
            <FriendPhoto
              friend={fm}
              sizes="(max-width: 767px) 160px, 200px"
            />
          </div>
          <div className="mt-5 min-w-0 md:mt-0">
            <p className="overline-label text-muted">
              {fm.back_label ?? "Friends of SCKIN"}
            </p>
            <h1 className="mt-4 text-(length:--font-size-h1) font-semibold leading-(--line-height-tight) tracking-(--tracking-tight) text-heading text-pretty">
              {fm.title}
            </h1>
            <p data-role="name" className="mt-4 text-[17px] font-semibold text-heading">
              {fm.name}
            </p>
            <p data-role="role" className="mt-1 text-[15px] text-muted">
              {affiliation}
              {fm.location ? ` · ${fm.location}` : ""}
            </p>
            <blockquote className="mt-4 border-l-2 border-hairline-strong pl-4 text-[19px] leading-[1.5] text-heading text-pretty">
              “{fm.quote}”
            </blockquote>
          </div>
        </header>

        {fm.sections?.map((section) => (
          <section
            key={section.heading}
            className="mt-10 border-t border-(--gray-100) pt-8"
          >
            <h2 className={sectionHeading}>{section.heading}</h2>
            <div
              className="prose-sckin mt-3"
              dangerouslySetInnerHTML={{
                __html: renderSectionBody(section.body),
              }}
            />
          </section>
        ))}

        {fm.videos?.length ? (
          <section
            data-section="videos"
            className="mt-10 border-t border-(--gray-100) pt-8"
          >
            <h2 className={sectionHeading}>{fm.videos_heading ?? "Videos"}</h2>
            <div className="mt-5 flex flex-col gap-8">
              {fm.videos.map((video) => (
                <YouTubeEmbed
                  key={video.youtube_id}
                  id={video.youtube_id}
                  title={video.caption}
                  caption={video.caption}
                  note={video.note}
                />
              ))}
            </div>
          </section>
        ) : null}

        {fm.contacts?.length ? (
          <section
            data-section="contact"
            className="mt-10 border-t border-(--gray-100) pt-8"
          >
            <h2 className={sectionHeading}>
              {fm.contact_heading ?? "Get in touch"}
            </h2>
            <ul className="mt-3 flex flex-col gap-2 text-[15px] leading-(--line-height-body) text-body">
              {/* Keyed by label, not address: React serializes keys into the
                  page payload, which would undo the email obfuscation. */}
              {fm.contacts.map((contact) => (
                <li key={contact.label}>
                  <span className="font-semibold text-heading">
                    {contact.label}:
                  </span>{" "}
                  <ObfuscatedEmail
                    email={contact.email}
                    className="font-semibold text-link transition-colors hover:text-link-hover"
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="mt-10">
          <Link
            href={backHref}
            className="text-[15px] font-semibold text-link transition-colors hover:text-link-hover"
          >
            ← {fm.back_label ?? "Friends of SCKIN"}
          </Link>
        </p>
      </article>
    </div>
  );
}
