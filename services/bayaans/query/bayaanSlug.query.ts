import { gql } from "@apollo/client"

export default gql`query GetBayaanSlug($local: [String], $limit: Int = 100, $skip: Int = 0) {
  bayaanCollection (
    where: { slug_exists: true, local_contains_all: $local }
    limit: $limit
    skip: $skip
    order: sys_id_ASC
  ) {
    total
    items {
      sys{
        publishedAt
      }
      slug
    }
  }
}`
