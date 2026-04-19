import { gql } from "@apollo/client";

export default gql`query RelatedArticles($currentSlug: String, $category: [String], $limit: Int, $skip: Int) {
  category: articleCollection(where: { slug_not: $currentSlug, category_contains_some: $category }, limit: $limit) {
    total
    items {
      ...ArticleFieldsNORichText
    }
  }

  random: articleCollection(where: { slug_not: $currentSlug }, limit: $limit, skip: $skip) {
    total
    items {
      ...ArticleFieldsNORichText
    }
  }
}`
