/**
 * Renders the Markdown *body* of a content file (the prose below the `---`
 * frontmatter fence), pre-rendered to HTML by src/lib/content.ts.
 *
 * Content is authored in-repo and trusted, so dangerouslySetInnerHTML is
 * acceptable here. Renders nothing when the body is empty.
 */
export default function Prose({ html }: { html: string }) {
  if (!html || !html.trim()) return null;
  return (
    <div data-role="prose" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
