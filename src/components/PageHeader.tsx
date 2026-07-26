/**
 * Standard content-page header from the locked template (Homepage.dc.html §4d):
 * uppercase overline → title → optional subhead → optional meta line.
 */
export default function PageHeader({
  overline = "SCKIN",
  title,
  subhead,
  meta,
}: {
  overline?: string;
  title: string;
  subhead?: string;
  meta?: string;
}) {
  return (
    <header data-role="page-header">
      <p className="overline-label text-muted">{overline}</p>
      <h1 className="mt-4 text-(length:--font-size-h1) font-semibold leading-(--line-height-tight) tracking-(--tracking-tight) text-heading text-pretty">
        {title}
      </h1>
      {subhead ? (
        <p className="mt-3 text-[19px] leading-[1.5] text-body text-pretty">
          {subhead}
        </p>
      ) : null}
      {meta ? <p className="mt-4 text-[13px] text-muted">{meta}</p> : null}
    </header>
  );
}
