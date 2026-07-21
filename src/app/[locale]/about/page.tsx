import type { Metadata } from "next";
import Image from "next/image";
import {
  getAbout,
  publicFileExists,
  renderSectionBody,
  type BoardMember,
  type Collaborator,
} from "@/lib/content";
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
      {member.role ? <p data-role="role">{member.role}</p> : null}

      {member.linkedin ? (
        <p>
          <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </p>
      ) : null}
      {member.links?.map((link) => (
        <p key={link.href}>
          <a href={link.href} target="_blank" rel="noopener noreferrer">
            {link.label}
          </a>
        </p>
      ))}

      {/* Members without a bio (Maimouna, Bill) render nothing here — the
          blank is intentional, not a "coming soon". */}
      {member.bio ? (
        <div
          data-role="bio"
          dangerouslySetInnerHTML={{ __html: renderSectionBody(member.bio) }}
        />
      ) : null}
      {member.founder_link ? (
        <p>
          <a href={member.founder_link.href}>{member.founder_link.label}</a>
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
          dangerouslySetInnerHTML={{
            __html: renderSectionBody(collaborator.description),
          }}
        />
      ) : null}
      {collaborator.status ? (
        <p>
          <strong>Status:</strong> {collaborator.status}
        </p>
      ) : null}
      {collaborator.collaboration ? (
        <p>
          <strong>Collaboration:</strong> {collaborator.collaboration}
        </p>
      ) : null}
    </div>
  );
}

/**
 * About page. Anchor sections in master-doc order — SCKIN, Our Board,
 * Our Founder, Our Collaborators, Friends of SCKIN — keyed by `id` so the nav
 * dropdown links (/about#board, …) resolve. Friends of SCKIN renders heading
 * + anchor only (body reserved).
 */
export default function AboutPage() {
  const { frontmatter, html } = getAbout();

  return (
    <article data-page="about">
      <h1>{frontmatter.title}</h1>

      {frontmatter.sections?.map((section) => (
        <section key={section.id} id={section.id}>
          <h2>{section.heading}</h2>

          {section.body ? (
            <div
              dangerouslySetInnerHTML={{
                __html: renderSectionBody(section.body),
              }}
            />
          ) : null}

          {section.subsections?.map((sub) => (
            <div key={sub.heading} data-role="subsection">
              <h3>{sub.heading}</h3>
              {sub.body ? (
                <div
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
        </section>
      ))}

      <Prose html={html} />
    </article>
  );
}
