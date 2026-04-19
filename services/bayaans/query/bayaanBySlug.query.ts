import { gql } from "@apollo/client"

export default gql`query GetBayaan (
  $slug: String!
) {
  bayaanCollection (where: { slug: $slug}, limit: 1) {
    items {
      ...BayaanFields
    }
  }
}`