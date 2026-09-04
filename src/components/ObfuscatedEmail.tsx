/**
 * A mailto link whose address — and the `mailto:` scheme itself — is written
 * as numeric HTML entities, so the plain address never appears in the page
 * source while browsers decode it transparently. Defeats the naive regex
 * scrapers that harvest "x@y.z" from raw HTML; works with JavaScript off.
 * Used for addresses published with their owner's permission.
 */
function entities(text: string): string {
  return Array.from(text)
    .map((char) => `&#${char.codePointAt(0)};`)
    .join("");
}

export default function ObfuscatedEmail({
  email,
  className,
}: {
  email: string;
  className?: string;
}) {
  const classAttr = className ? ` class="${className}"` : "";
  const html = `<a href="${entities(`mailto:${email}`)}"${classAttr}>${entities(email)}</a>`;
  // Our own content, rendered as raw HTML on purpose: React would re-escape
  // the entities (turning &#64; into &amp;#64;) if they were passed as props.
  return <span data-role="email" dangerouslySetInnerHTML={{ __html: html }} />;
}
