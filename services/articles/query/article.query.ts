import { gql } from "@apollo/client";

export default gql`query GetArticles (
  $startDate: DateTime, 
  $endDate: DateTime, 
  $search: String, 
  # $category: String,
  $limit: Int, 
  $skip: Int
) {
  articleCollection (
    where: {
      sys: {
        firstPublishedAt_gte: $startDate, 
        firstPublishedAt_lte: $endDate
      },
      title_contains: $search,
      # category_in: $categories,
    },
    limit: $limit, 
    skip: $skip,
    order: sys_firstPublishedAt_DESC
  ) {
    total
    items {
      ...ArticleFieldsNORichText
    }
  }
}`
