"use client";

import { useEffect, useRef, useState } from "react";
import type { Book } from "@/lib/books";

/**
 * One book on /resources/books: cover (self-hosted, else Open Library — see
 * getAllBooks), or the designed title card on brand red when there is no
 * cover or it fails to load; then the bibliographic lines, blurb, and up to
 * three CTAs.
 *
 * CTA rules: "Read free" leads when `freeUrl` is set; otherwise "Buy on
 * Bookshop.org" is primary and "Also on Amazon" secondary. Each is hidden when
 * its URL is empty. Only the two store links are affiliate links, so only they
 * carry rel="sponsored".
 */
export default function BookCard({ book }: { book: Book }) {
  const [coverFailed, setCoverFailed] = useState(!book.cover);
  const img = useRef<HTMLImageElement>(null);

  // A cover that 404s before hydration never reaches onError — catch it here.
  useEffect(() => {
    const el = img.current;
    if (el?.complete && el.naturalWidth === 0) setCoverFailed(true);
  }, []);

  const imprint = [
    book.publisher ?? (book.selfPublished ? "Self-published" : undefined),
    book.year,
  ].filter(Boolean);

  const ctas: Array<{ label: string; href: string; affiliate: boolean }> = [];
  if (book.freeUrl) ctas.push({ label: "Read free", href: book.freeUrl, affiliate: false });
  if (book.bookshopUrl)
    ctas.push({ label: "Buy on Bookshop.org", href: book.bookshopUrl, affiliate: true });
  if (book.amazonUrl)
    ctas.push({ label: "Also on Amazon", href: book.amazonUrl, affiliate: true });

  return (
    <article
      data-role="book"
      className="flex h-full gap-4 rounded-lg border border-hairline p-4 md:gap-5 md:p-5"
    >
      <div className="relative aspect-[2/3] w-[88px] shrink-0 overflow-hidden rounded-sm bg-subtle md:w-[112px]">
        {coverFailed ? (
          <div
            aria-hidden="true"
            data-role="cover-fallback"
            className="flex h-full flex-col justify-between bg-band p-2.5 text-on-band"
          >
            <p className="line-clamp-5 text-[12px] font-semibold leading-[1.25] md:text-[13px]">
              {book.title}
            </p>
            {book.author ? (
              <p className="line-clamp-2 text-[10px] leading-[1.3] text-on-band-muted md:text-[11px]">
                {book.author}
              </p>
            ) : null}
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- the Open Library fallback may 404 by design
          <img
            ref={img}
            src={book.cover}
            alt=""
            width={112}
            height={168}
            loading="lazy"
            decoding="async"
            onError={() => setCoverFailed(true)}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {book.zachPick ? (
          <p className="mb-2">
            <span className="rounded-pill bg-chip px-2.5 py-[3px] text-[11px] font-semibold uppercase tracking-[0.04em] text-body-accent">
              Zach&rsquo;s Pick
            </span>
          </p>
        ) : null}
        <h2 className="text-[17px] font-semibold leading-[1.3] text-heading text-pretty">
          {book.title}
        </h2>
        {book.subtitle ? (
          <p className="mt-1 text-[15px] leading-[1.4] text-body text-pretty">
            {book.subtitle}
          </p>
        ) : null}
        {book.author ? (
          <p className="mt-1.5 text-[15px] text-heading">{book.author}</p>
        ) : null}
        {imprint.length ? (
          <p className="mt-0.5 text-[13px] text-body">{imprint.join(" · ")}</p>
        ) : null}
        {book.blurb ? (
          <p className="mt-2.5 text-[15px] leading-(--line-height-body) text-body text-pretty">
            {book.blurb}
          </p>
        ) : null}

        {ctas.length ? (
          <div className="mt-auto flex flex-wrap gap-2 pt-4">
            {ctas.map((cta, i) => (
              <a
                key={cta.label}
                href={cta.href}
                target="_blank"
                rel={cta.affiliate ? "noopener sponsored" : "noopener noreferrer"}
                className={
                  i === 0
                    ? "rounded-pill bg-cta px-4 py-2 text-[14px] font-semibold text-on-band transition-colors hover:bg-cta-hover hover:no-underline focus-visible:no-underline"
                    : "rounded-pill border border-hairline-strong px-4 py-2 text-[14px] font-semibold text-heading transition-colors hover:border-heading hover:no-underline focus-visible:no-underline"
                }
              >
                {cta.label}
                <span className="sr-only">
                  {`: ${book.title} (opens in a new tab)`}
                </span>
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
