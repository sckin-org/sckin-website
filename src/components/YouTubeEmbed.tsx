/**
 * A YouTube video in a 16:9 responsive frame with a caption. Uses the
 * privacy-enhanced youtube-nocookie.com domain (no tracking cookies until the
 * visitor presses play), lazy loading, and fullscreen. Works for unlisted
 * videos — anyone with the page can watch; YouTube search will not surface
 * them, which is intended.
 */
export default function YouTubeEmbed({
  id,
  title,
  caption,
  note,
}: {
  /** The YouTube video id, e.g. "XtcWOCqYLVg". */
  id: string;
  /** Accessible name of the iframe (screen readers announce it). */
  title: string;
  caption: string;
  /** Duration / language line shown after the caption. */
  note?: string;
}) {
  return (
    <figure data-role="video">
      <div className="relative aspect-video overflow-hidden rounded-md bg-subtle">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
      <figcaption className="mt-2.5 text-[15px] leading-normal text-body text-pretty">
        {caption}
        {note ? <span className="text-muted"> — {note}</span> : null}
      </figcaption>
    </figure>
  );
}
