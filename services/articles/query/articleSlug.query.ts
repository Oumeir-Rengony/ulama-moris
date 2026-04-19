import { gql } from "@apollo/client";

export default gql`query GetArticleSlugs {
  articleCollection (where: { slug_exists: true }) {
    items {
      sys {
        publishedAt
      }
      slug
    }
  }
}`
