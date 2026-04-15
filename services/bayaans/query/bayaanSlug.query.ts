import { gql } from "@apollo/client"

export default gql`query GetBayaanSlug($local: [String]) {
  bayaanCollection (where: { slug_exists: true, local_contains_all: $local }) {
    items {
      sys{
        publishedAt
      }
      slug
    }
  }
}`