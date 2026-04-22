import { cache } from 'react';
import { gql } from '@apollo/client';
import { ExecuteQuery } from '@/services/apollo/apollo.service';
import Config from "@/config/config.json";
import { WithContext, Article as SchemaArticle, ItemList, Person } from 'schema-dts';

import {
  ArticleQuery,
  ArticleSlugQuery,
  ArticleBySlugQuery,
  ArticleTotalQuery,
  RelatedArticlesQuery,
  ArticleFieldsNORichText,
  ArticleFieldsRichText,
  ArticleContentFields
} from "./query";

import { AssetsFragment } from '@/services/query';

export const getArticlesBase = cache(async ({
  search = "",
  category = "",
  limit = 0,
  skip = 0,
  isPreview = false
}: {
  limit?: number;
  skip?: number;
  search?: string;
  category?: string;
  isPreview?: boolean;
}): Promise<{ articleCollection: any }> => {

  const QUERY = gql`
    ${AssetsFragment}
    ${ArticleFieldsNORichText}
    ${ArticleQuery}
  `;

  const variables: any = {
    ...(limit && { limit }),
    ...(skip && { skip }),
    ...(search && { search }),
    ...(category && { category }),
  };

  const result = await ExecuteQuery(QUERY, {
    variables,
    preview: isPreview,
  });

  return result;
});

export const getArticlesWithPagination = cache(async ({
  page = 1,
  search = "",
  category = "",
  isMobile = true,
  isPreview = false,
}: {
  page?: number;
  search?: string;
  category?: string;
  isMobile?: boolean;
  isPreview?: boolean;
}): Promise<any> => {

  const limit = isMobile
    ? Config.bayaan.pageSize.mobile
    : Config.bayaan.pageSize.desktop;

  const skipMultiplier = (page === 1) ? 0 : page - 1;
  const skip = skipMultiplier > 0 ? limit * skipMultiplier : 0;

  const result = await getArticlesBase({
    limit,
    skip,
    search,
    category,
    isPreview,
  });

  return result?.articleCollection;
});

export const getAllArticles = cache(async ({
  search = "",
  category = "",
  isPreview = false,
}: {
  search?: string;
  category?: string;
  isPreview?: boolean;
}): Promise<any> => {

  const result = await getArticlesBase({
    search,
    category,
    isPreview,
  });

  return result?.articleCollection;
});

export const getArticleSlugs = cache(async (isPreview: boolean = false): Promise<any> => {

  const QUERY = gql`
    ${ArticleSlugQuery}
  `;

  const result = await ExecuteQuery(QUERY, {
    preview: isPreview,
  });

  return result?.articleCollection;
});

export const getArticleBySlug = cache(async ({
  slug = "",
  isPreview = false
}: {
  slug: string;
  isPreview?: boolean;
}): Promise<any> => {

  const QUERY = gql`
    ${AssetsFragment}
    ${ArticleContentFields}
    ${ArticleFieldsRichText}
    ${ArticleBySlugQuery}
  `;

  const resultPromise = ExecuteQuery(QUERY, {
    variables: { slug },
    preview: isPreview,
  });

  const totalPromise = getTotalArticles();

  const [result, total] = await Promise.all([resultPromise, totalPromise]);

  return {
    data: result?.articleCollection?.items?.[0],
    total: total
  };
});

const getTotalArticles = cache(async (isPreview?: boolean): Promise<number> => {

  const QUERY = gql`
    ${ArticleTotalQuery}
  `;

  const result = await ExecuteQuery(QUERY, {
    preview: isPreview || false
  });

  return result?.articleCollection?.total;
});

const selectUniqueArticles = (data: any[], limit = 4) => {
  const seen = new Set();
  const final = [];

  for (const set of data) {
    for (const article of set) {
      const key = article.sys?.id;
      if (!seen.has(key)) {
        seen.add(key);
        final.push(article);
      }
      if (final.length === limit) return final;
    }
  }

  return final;
};

export const getRelatedArticles = cache(async ({
  currentSlug,
  category,
  totalArticles,
  limit = 4
}: {
  currentSlug: string;
  category?: string;
  totalArticles: number;
  limit?: number;
}, isPreview: boolean = false): Promise<any> => {

  const RELATED_QUERY = gql`
    ${AssetsFragment}
    ${ArticleFieldsNORichText}
    ${RelatedArticlesQuery}
  `;

  let total = totalArticles;

  if (!totalArticles) {
    total = await getTotalArticles(false);
  }

  const randomSkip = Math.max(0, Math.floor(Math.random() * (total - 4)));

  const result = await ExecuteQuery(RELATED_QUERY, {
    variables: {
      currentSlug,
      category,
      limit,
      skip: randomSkip
    },
    preview: isPreview,
  });


  const sortedResult = selectUniqueArticles([
    result?.category?.items || [],
    result?.random?.items || []
  ]);

  return sortedResult;
});

const getArticleJsonLd = (item: any): SchemaArticle => {
  return {
    "@type": "Article",
    headline: item?.metaTitle || item?.title,
    description: item?.metaDescription || item?.excerpt,
    image: item?.coverImage?.url,
    datePublished: item?.date,
    dateModified: item?.sys?.publishedAt,
    author: {
      "@type": "Person",
      name: item?.author,
    } as Person,
    publisher: {
      "@type": "Organization",
      name: "Ulama Moris",
      logo: {
        "@type": "ImageObject",
        url: "https://ulama-moris.org/logo.webp"
      }
    }
  } as SchemaArticle;
};

export const createArticleListJsonLd = (data: any) => {
  const JsonLd: WithContext<ItemList> = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Islamic Articles",
    itemListElement: data?.map((item: any, index: number) => {
      return {
        "@type": "ListItem",
        position: index + 1,
        item: getArticleJsonLd(item)
      };
    })
  };

  return JsonLd;
};

export const createArticleJsonLd = (data: any) => {
  return getArticleJsonLd(data);
};
