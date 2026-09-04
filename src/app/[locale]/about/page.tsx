import type { Metadata } from "next";
import Image from "next/image";
import {
  getAbout,
  getAllFriends,
  publicFileExists,
  renderSectionBody,
  type BoardMember,
  type Collaborator,
} from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import FriendCard from "@/components/FriendCard";
import PageHeader from "@/components/PageHeader";
import Prose from "@/components/Prose";
import styles from "./about.module.css";

export function generateMetadata(): Metadata {
  const { frontmatter } = getAbout();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/** "Zacharie Liman-Tinguiri" → "ZL" for the pending-photo placeholder. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function BoardCard({ member }: { member: BoardMember }) {
  const hasPhoto = member.photo ? publicFileExists(member.photo) : false;

  return (
    <li className={styles.card} data-role="board-member">
      {hasPhoto && member.photo ? (
        <Image
          src={member.photo}
          alt={`Portrait of ${member.name}`}
          width={480}
          height={480}
          className={styles.photo}
        />
      ) : (
        // TODO: real photo pending in public/images/team/ — initials until then.
        <div className={styles.photoPlaceholder} aria-hidden="true">
          {initials(member.name)}
        </div>
      )}

      <h3>{member.name}</h3>
      {member.role ? (
        <p data-role="role" className="mt-0.5 text-[15px] text-muted">
          {member.role}
        </p>
      ) : null}

      {member.linkedin ? (
        <p className="mt-2">
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[14px] font-semibold text-link transition-colors hover:text-link-hover"
          >
            LinkedIn
          </a>
        </p>
      ) : null}
      {member.links?.map((link) => (
        <p key={link.href} className="mt-1">
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[14px] font-semibold text-link transition-colors hover:text-link-hover"
          >
            {link.label}
          </a>
        </p>
      ))}

      {/* Members without a bio (Maimouna, Bill) render nothing here — the
          blank is intentional, not a "coming soon". */}
      {member.bio ? (
        <div
          data-role="bio"
          className="prose-sckin mt-3 text-[15px]"
          dangerouslySetInnerHTML={{ __html: renderSectionBody(member.bio) }}
        />
      ) : null}
      {member.founder_link ? (
        <p className="mt-3">
          <a
            href={member.founder_link.href}
            className="text-[14px] font-semibold text-link transition-colors hover:text-link-hover"
          >
            {member.founder_link.label} →
          </a>
        </p>
      ) : null}
    </li>
  );
}

function CollaboratorEntry({ collaborator }: { collaborator: Collaborator }) {
  const hasLogo = collaborator.logo
    ? publicFileExists(collaborator.logo)
    : false;

  return (
    <div className={styles.collaborator} data-role="collaborator">
      {hasLogo && collaborator.logo ? (
        <Image
          src={collaborator.logo}
          alt={`${collaborator.name} logo`}
          width={160}
          height={64}
          className={styles.logo}
        />
      ) : null /* TODO: logo pending in public/images/logos/ — name-only. */}

      <h3>
        {collaborator.url ? (
          <a
            href={collaborator.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {collaborator.name}
          </a>
        ) : (
          collaborator.name
        )}
      </h3>

      {collaborator.description ? (
        <div
          className="prose-sckin mt-2.5 text-[15px]"
          dangerouslySetInnerHTML={{
            __html: renderSectionBody(collaborator.description),
          }}
        />
      ) : null}
      {collaborator.status ? (
        <p className="mt-2.5 text-[14px] leading-normal text-body">
          <strong className="font-semibold text-heading">Status:</strong>{" "}
          {collaborator.status}
        </p>
      ) : null}
      {collaborator.collaboration ? (
        <p className="mt-1 text-[14px] leading-normal text-body">
          <strong className="font-semibold text-heading">Collaboration:</strong>{" "}
          {collaborator.collaboration}
        </p>
      ) : null}
    </div>
  );
}

/**
 * About page. Anchor sections in master-doc order — SCKIN, Our Board,
 * Our Founder, Our Collaborators, Friends of SCKIN — keyed by `id` so the nav
 * dropdown links (/about#board, …) resolve. The `friends` section lists the
 * Friends of SCKIN from content/friends/ (one card each, linking to the
 * friend's story page at /friends/<slug>).
 */
export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const activeLocale = locale as Locale;
  const { frontmatter, html } = getAbout();
  const friends = getAllFriends(activeLocale);

  return (
    <div className="px-6 py-14 md:px-12 md:py-20">
      <article data-page="about" className="container-page">
        <PageHeader title={frontmatter.title} />

        {frontmatter.sections?.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="mt-8 max-w-[720px] border-t border-(--gray-100) pt-8 [&:has([data-role=board-grid])]:max-w-none"
          >
            <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-heading md:text-[28px]">
              {section.heading}
            </h2>

            {section.body ? (
              <div
                className="prose-sckin mt-3 max-w-[720px]"
                dangerouslySetInnerHTML={{
                  __html: renderSectionBody(section.body),
                }}
              />
            ) : null}

            {section.subsections?.map((sub) => (
              <div
                key={sub.heading}
                data-role="subsection"
                className="mt-7 max-w-[720px]"
              >
                <h3 className="text-[17px] font-semibold text-heading">
                  {sub.heading}
                </h3>
                {sub.body ? (
                  <div
                    className="prose-sckin mt-2"
                    dangerouslySetInnerHTML={{
                      __html: renderSectionBody(sub.body),
                    }}
                  />
                ) : null}
              </div>
            ))}

            {section.members?.length ? (
              <ul className={styles.grid} data-role="board-grid">
                {section.members.map((member) => (
                  <BoardCard key={member.name} member={member} />
                ))}
              </ul>
            ) : null}

            {section.collaborators?.map((collaborator) => (
              <CollaboratorEntry
                key={collaborator.name}
                collaborator={collaborator}
              />
            ))}

            {section.id === "friends" && friends.length ? (
              <ul
                data-role="friends-list"
                className="mt-6 flex list-none flex-col gap-4 p-0"
              >
                {friends.map((friend) => (
                  <FriendCard
                    key={friend.slug}
                    friend={friend}
                    locale={activeLocale}
                  />
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <Prose html={html} className="mt-8" />
      </article>
    </div>
  );
}
