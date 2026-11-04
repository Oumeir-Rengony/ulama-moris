import { gql } from "@apollo/client";

export default gql`
  query GetEventSitemap($limit: Int!, $skip: Int!) {
    bayaanCollection(
      where: { event_exists: true }
      limit: $limit
      skip: $skip
      order: sys_id_ASC
    ) {
      total
      items {
        event
        sys {
          publishedAt
        }
      }
    }
  }
`;
