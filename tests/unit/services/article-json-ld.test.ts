import { describe, expect, it, vi } from "vitest";
import { createArticleJsonLd, createArticleListJsonLd } from "@/services/articles/article.service";

// The JSON-LD builders make no requests; the Contentful client is mocked only so
// importing the service does not set one up.
vi.mock("@/services/apollo/apollo.service", () => ({ ExecuteQuery: vi.fn() }));

const article = {
  title: "The Beautiful Names of Allah",
  metaTitle: "The Beautiful Names of Allah (Asma ul Husna)",
  author: "Mufti Ibrahim ",
  date: "2026-04-19T10:00:00.000Z",
};

describe("createArticleJsonLd", () => {
  it("can be read on its own and names the author without honorifics", () => {
    const jsonLd = createArticleJsonLd(article);

    expect(jsonLd).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "The Beautiful Names of Allah (Asma ul Husna)",
      author: { "@type": "Person", name: "Ibrahim" },
    });
  });

  it("leaves out the author when the article has none", () => {
    const jsonLd = createArticleJsonLd({ ...article, author: "" });

    expect(jsonLd).not.toHaveProperty("author");
  });
});

describe("createArticleListJsonLd", () => {
  it("cleans the author name in every listed article", () => {
    const jsonLd = createArticleListJsonLd([article]);

    expect(jsonLd).toMatchObject({
      itemListElement: [{ position: 1, item: { author: { "@type": "Person", name: "Ibrahim" } } }],
    });
  });
});
