import Image from "next/image";
import Link from "next/link";
import {
  publicFileExists,
  type Doc,
  type FriendFrontmatter,
} from "@/lib/content";
import { localizedHref, type Locale } from "@/lib/i18n";

/** "Leyla Aïssa Hamidou" → "LH" — first and last name, for the placeholder. */
export function friendInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  const picks = words.length > 1 ? [words[0], words[words.length - 1]] : words;
  return picks
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

/**
 * A friend's portrait — square, 480px source like the board photos — or, while
 * the file is still pending at `photo`, an initials block of the same size so
 * the layout does not move when the real photo lands (see publicFileExists).
 */
export function FriendPhoto({
  friend,
  sizes,
}: {
  friend: FriendFrontmatter;
  sizes: string;
}) {
  const hasPhoto = friend.photo ? publicFileExists(friend.photo) : false;
  if (hasPhoto && friend.photo) {
    return (
      <Image
        src={friend.photo}
        alt={friend.photo_alt ?? `Portrait of ${friend.name}`}
        width={480}
        height={480}
        sizes={sizes}
        className="aspect-square h-auto w-full rounded-md object-cover"
      />
    );
  }
  // TODO: real photo pending at friend.photo — initials until then.
  return (
    <div
      data-role="photo-placeholder"
      aria-hidden="true"
      className="flex aspect-square w-full items-center justify-center rounded-md border border-hairline bg-page text-[40px] font-semibold text-muted"
    >
      {friendInitials(friend.name)}
    </div>
  );
}

/**
 * Friends of SCKIN card (on /about#friends): portrait, name, role · org ·
 * place, the featured quote, the two-sentence intro, and the link to the
 * friend's story page. Card pattern from the locked design's product/news
 * cards; side-by-side from md up, stacked on phones.
 */
export default function FriendCard({
  friend,
  locale,
}: {
  friend: Doc<FriendFrontmatter>;
  locale: Locale;
}) {
  const fm = friend.frontmatter;
  const href = localizedHref(`/friends/${friend.slug}`, locale);
  const affiliation = [fm.role, fm.organization].filter(Boolean).join(", ");

  return (
    <li
      data-role="friend"
      className="rounded-lg bg-subtle p-6 md:flex md:items-start md:gap-6 md:p-7"
    >
      <div className="w-[120px] shrink-0 md:w-[160px]">
        <FriendPhoto friend={fm} sizes="(max-width: 767px) 120px, 160px" />
      </div>
      <div className="mt-4 min-w-0 md:mt-0">
        <h3 className="text-[19px] font-semibold leading-[1.35] text-heading">
          {fm.name}
        </h3>
        <p data-role="role" className="mt-1 text-[15px] text-muted">
          {affiliation}
          {fm.location ? ` · ${fm.location}` : ""}
        </p>
        <blockquote className="mt-3 text-[17px] leading-(--line-height-body) text-heading text-pretty">
          “{fm.quote}”
        </blockquote>
        {fm.intro ? (
          <p className="mt-3 text-[15px] leading-(--line-height-body) text-body text-pretty">
            {fm.intro}
          </p>
        ) : null}
        <p className="mt-4">
          <Link
            href={href}
            className="text-[15px] font-semibold text-link transition-colors hover:text-link-hover"
          >
            {fm.story_link_label ?? `Read ${fm.name}'s story`} →
          </Link>
        </p>
      </div>
    </li>
  );
}
