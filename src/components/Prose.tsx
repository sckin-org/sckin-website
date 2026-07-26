/**
 * Renders the Markdown *body* of a content file (the prose below the `---`
 * frontmatter fence), pre-rendered to HTML by src/lib/content.ts, with the
 * design system's prose styles (.prose-sckin in globals.css).
 *
 * Content is authored in-repo and trusted, so dangerouslySetInnerHTML is
 * acceptable here. Renders nothing when the body is empty.
 */
export default function Prose({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  if (!html || !html.trim()) return null;
  return (
    <div
      data-role="prose"
      className={className ? `prose-sckin ${className}` : "prose-sckin"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
