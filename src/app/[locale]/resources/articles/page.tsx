import type { Metadata } from "next";
import { getAllArticles, getArticlesLanding } from "@/lib/content";
import { articleFacets, doiUrl, type Article } from "@/lib/articles";
import PageHeader from "@/components/PageHeader";
import ArticleBrowser from "@/components/ArticleBrowser";

const PAGE_URL = "https://sckin.org/resources/articles";

export function generateMetadata(): Metadata {
  const { frontmatter } = getArticlesLanding();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/** schema.org ItemList of ScholarlyArticle, oldest first. Only the first
 * author's surname is on record, so `author` carries just that. */
function itemList(title: string, articles: Article[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    url: PAGE_URL,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: articles.length,
    itemListElement: articles.map((article, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "ScholarlyArticle",
        "@id": `${PAGE_URL}#${article.anchor}`,
        name: article.title,
        author: { "@type": "Person", name: article.firstAuthor },
        datePublished: String(article.year),
        isPartOf: { "@type": "Periodical", name: article.journal },
        ...(article.doi ? { sameAs: doiUrl(article.doi) } : {}),
      },
    })),
  };
}

/**
 * /resources/articles — the second live Resources product: SCKIN's
 * chronological reading list of foundational sickle cell papers for
 * healthcare professionals. Copy comes from content/articles.md, records from
 * content/articles.json (see getAllArticles, which strips the internal
 * `editorNote`). Mirrors /resources/books: header, note box, then the
 * filterable list.
 */
export default function ArticlesPage() {
  const { frontmatter } = getArticlesLanding();
  const articles = getAllArticles();
  // `<` escaped so no string in the data can close the script element.
  const jsonLd = JSON.stringify(itemList(frontmatter.title, articles)).replace(
    /</g,
    "\\u003c"
  );

  return (
    <div className="px-6 py-14 md:px-12 md:py-20">
      <article data-page="articles" className="mx-auto max-w-[880px]">
        <div className="max-w-[720px]">
          <PageHeader
            overline="SCKIN Resources"
            title={frontmatter.title}
            subhead={frontmatter.intro}
          />
        </div>

        <aside
          data-role="notes"
          aria-label="About these links"
          className="mt-8 flex max-w-[720px] flex-col gap-2 rounded-md bg-subtle px-5 py-4 text-[14px] leading-[1.5] text-body"
        >
          {frontmatter.notes.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </aside>

        <div className="mt-8">
          {articles.length ? (
            <ArticleBrowser articles={articles} facets={articleFacets(articles)} />
          ) : (
            <p data-role="empty" className="text-[15px] text-body">
              {frontmatter.empty}
            </p>
          )}
        </div>
      </article>

      {articles.length ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      ) : null}
    </div>
  );
}
