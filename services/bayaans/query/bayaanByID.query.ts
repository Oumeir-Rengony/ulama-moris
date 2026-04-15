import { gql } from "@apollo/client"

export default gql`query GetBayaan (
  $id: String!
) {
  bayaan (id: $id) {
    ...BayaanFields
  }
}`