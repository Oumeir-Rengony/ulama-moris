import { gql } from "@apollo/client";

export default gql`query GetArticleBySlug (
  $slug: String!
) {
  articleCollection (where: { slug: $slug }, limit: 1) {
    total
    items {
      ...ArticleFieldsRichText
    }
  }
}`
