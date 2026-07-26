import type { Metadata } from "next";
import Link from "next/link";
import { getHome } from "@/lib/content";
import DonateWidget from "@/components/DonateWidget";
import Reveal from "@/components/Reveal";

export function generateMetadata(): Metadata {
  const { frontmatter } = getHome();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/**
 * Home — the locked 2026-07-22 design (comps: docs/design/comps/Homepage.dc.html).
 * White → white → white → RED → white → RED rhythm; type is the imagery.
 * Copy lives in content/home.md. The hero paints immediately (no Reveal) so
 * LCP is not gated on hydration; below-fold sections fade in on scroll.
 */
export default function HomePage() {
  const { frontmatter } = getHome();
  const { hero, mission, products, impact, news, donate } = frontmatter;

  return (
    <article data-page="home">
      <section
        data-section="hero"
        className="bg-page px-6 pb-[88px] pt-[72px] md:px-12 md:py-32"
      >
        <div className="container-page">
          <p className="overline-label text-muted">{hero.overline}</p>
          <h1 className="mt-5 text-(length:--font-size-display) font-semibold leading-[1.02] tracking-[-0.03em] text-heading text-pretty md:mt-6">
            {hero.headline}
            <br />
            <span className="text-heading-accent">{hero.headline_accent}</span>
          </h1>
          <p className="mt-6 max-w-[560px] text-[17px] leading-(--line-height-body) text-body text-pretty md:mt-8 md:text-[19px]">
            {hero.subhead}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-6 md:mt-12 md:gap-7">
            <Link
              href={hero.cta.href}
              data-role="cta"
              className="rounded-pill bg-cta px-[30px] py-4 text-[19px] font-semibold text-on-band transition-colors hover:bg-cta-hover md:px-8"
            >
              {hero.cta.label}
            </Link>
            <Link
              href={hero.secondary_cta.href}
              data-role="cta-secondary"
              className="text-[17px] font-semibold text-link transition-colors hover:text-link-hover"
            >
              {hero.secondary_cta.label} →
            </Link>
          </div>
        </div>
      </section>

      <section
        data-section="mission"
        className="bg-page px-6 pb-[88px] md:px-12 md:pb-32"
      >
        <Reveal className="container-page md:grid md:grid-cols-[200px_1fr] md:gap-12">
          <p className="overline-label text-muted md:pt-2">{mission.eyebrow}</p>
          <div>
            <h2 className="mt-3 text-(length:--font-size-h2) font-semibold leading-[1.25] tracking-(--tracking-tight) text-heading text-pretty md:mt-0 md:leading-[1.2]">
              {mission.statement}
            </h2>
            <p className="mt-4 max-w-[640px] text-[17px] leading-(--line-height-body) text-body text-pretty md:mt-6 md:text-[19px]">
              {mission.body}
            </p>
            <p className="mt-5 max-w-[640px] text-[17px] font-semibold leading-[1.5] text-heading text-pretty md:text-[19px]">
              {mission.hypothesis}
            </p>
            <div className="mt-7 flex flex-col gap-4 md:mt-12 md:grid md:grid-cols-3 md:gap-8">
              {mission.pillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="border-t border-(--gray-100) pt-4"
                >
                  <p className="text-[17px] font-semibold text-heading">
                    {pillar.title}
                  </p>
                  <p className="mt-1 text-[15px] leading-normal text-body">
                    {pillar.body}
                  </p>
                </div>
              ))}
            </div>
            <Link
              href={mission.cta.href}
              className="mt-8 inline-block text-[17px] font-semibold text-link transition-colors hover:text-link-hover"
            >
              {mission.cta.label} →
            </Link>
          </div>
        </Reveal>
      </section>

      <section
        data-section="products"
        className="bg-page px-6 pb-[88px] md:px-12 md:pb-32"
      >
        <Reveal className="container-page">
          <p className="overline-label text-muted">{products.eyebrow}</p>
          <div className="mt-4 flex flex-col gap-4 md:mt-6 md:grid md:grid-cols-2 md:gap-6">
            {products.items.map((product) => (
              <div
                key={product.name}
                data-role="product"
                className="flex flex-col items-start rounded-lg bg-subtle px-6 py-7 md:px-9 md:py-10"
              >
                <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
                  <h3 className="text-(length:--font-size-h3) font-semibold tracking-[-0.01em] text-heading">
                    {product.name}
                  </h3>
                  {product.tag ? (
                    <span className="rounded-pill border border-hairline-strong px-2.5 py-[3px] text-[12px] font-semibold uppercase tracking-[0.04em] text-body">
                      {product.tag}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2.5 text-[17px] leading-(--line-height-body) text-body text-pretty md:mt-3.5">
                  {product.description}
                </p>
                <Link
                  href={product.cta.href}
                  className="mt-4 text-[17px] font-semibold text-link transition-colors hover:text-link-hover md:mt-auto md:pt-6"
                >
                  {product.cta.label} →
                </Link>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section
        data-section="impact"
        className="bg-band px-6 py-[72px] md:px-12 md:py-24"
      >
        <Reveal className="container-page">
          <p className="overline-label text-on-band-muted">{impact.eyebrow}</p>
          <div className="mt-8 flex flex-col gap-8 md:mt-12 md:grid md:grid-cols-3 md:gap-12">
            {impact.stats.map((stat) => (
              <div key={stat.figure}>
                <p className="text-(length:--font-size-stat) font-semibold leading-none tracking-(--tracking-tight) text-on-band">
                  {stat.figure}
                </p>
                <p className="mt-2 text-[15px] leading-normal text-on-band-muted md:mt-3">
                  {stat.caption}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 border-t border-white/28 pt-9 md:mt-16 md:grid md:grid-cols-[auto_1fr] md:items-center md:gap-12 md:pt-14">
            <div>
              <span className="inline-block rounded-pill bg-white/16 px-3 py-[5px] text-[11px] font-semibold uppercase tracking-[0.1em] text-on-band">
                {impact.goal.tag}
              </span>
              <p className="mt-4 whitespace-nowrap text-(length:--font-size-stat-goal) font-semibold leading-none tracking-[-0.03em] text-on-band">
                {impact.goal.figure}
              </p>
            </div>
            <p className="mt-3 max-w-[520px] text-[17px] leading-[1.45] text-on-band text-pretty md:mt-0 md:text-[22px]">
              {impact.goal.caption}
            </p>
          </div>
          <p className="mt-9 text-[12px] leading-normal text-white/60 md:mt-12">
            {impact.source}
          </p>
        </Reveal>
      </section>

      <section
        data-section="news"
        className="bg-page px-6 pb-[88px] pt-20 md:px-12 md:pb-32 md:pt-28"
      >
        <Reveal className="container-page">
          <div className="flex items-baseline justify-between">
            <p className="overline-label text-muted">{news.eyebrow}</p>
            <Link
              href={news.all.href}
              className="hidden text-[17px] font-semibold text-link transition-colors hover:text-link-hover md:block"
            >
              {news.all.label} →
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2.5 md:gap-4">
            <p className="text-[17px] leading-normal text-body text-pretty md:text-[19px]">
              <span className="font-semibold text-heading">{news.name}</span> —{" "}
              {news.intro}
            </p>
            {news.badge ? (
              <span className="rounded-pill border border-hairline-strong px-2.5 py-[3px] text-[12px] font-semibold uppercase tracking-[0.04em] text-body">
                {news.badge}
              </span>
            ) : null}
          </div>
          <div className="mt-4 md:mt-8 md:grid md:grid-cols-3 md:gap-8">
            {news.items.map((item) => (
              <div
                key={item.headline}
                className="border-b border-(--gray-100) py-5 last:border-b-0 md:border-b-0 md:border-t md:py-0 md:pt-5"
              >
                <p className="text-[13px] text-muted">{item.date}</p>
                <p className="mt-1.5 text-[19px] font-semibold leading-[1.35] text-heading text-pretty md:mt-2">
                  {item.headline}
                </p>
              </div>
            ))}
          </div>
          <Link
            href={news.all.href}
            className="mt-2 inline-block text-[17px] font-semibold text-link transition-colors hover:text-link-hover md:hidden"
          >
            {news.all.label} →
          </Link>
        </Reveal>
      </section>

      <section
        data-section="donate"
        className="bg-band px-6 py-[72px] pb-20 md:px-12 md:py-24"
      >
        <Reveal className="container-page md:grid md:grid-cols-[1fr_400px] md:items-start md:gap-24">
          <div>
            <h2 className="text-(length:--font-size-h2) font-semibold leading-[1.25] tracking-(--tracking-tight) text-on-band text-pretty md:leading-[1.2]">
              {donate.headline}
            </h2>
            <p className="mt-4 text-[17px] leading-(--line-height-body) text-white/85 text-pretty md:mt-6 md:text-[19px]">
              {donate.body}
            </p>
            <p className="mt-4 text-[17px] leading-(--line-height-body) text-on-band text-pretty md:mt-5 md:text-[19px]">
              {donate.closing}
            </p>
          </div>
          <div className="mt-8 md:mt-0">
            <DonateWidget />
          </div>
        </Reveal>
      </section>
    </article>
  );
}
