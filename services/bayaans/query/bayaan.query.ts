import { gql } from "@apollo/client";

export default gql`query GetBayaan (
  $startDate: DateTime, 
  $endDate: DateTime, 
  $search: String, 
  $bayaanIds: [String],
  $local: [String]
  # $categories: [String],
  $limit: Int, 
  $skip: Int
) {
  bayaanCollection (
    where: {
      date_gte: $startDate,
      date_lte: $endDate,
      title_contains: $search,
      sys: { id_in: $bayaanIds },
      local_contains_all: $local
      # category_in: $categories,
    },
    limit: $limit, 
    skip: $skip,
    order: date_DESC
  ) {
    total
    items {
      sys {
        id
      }
      ...BayaanFields
    }
  }
}`
