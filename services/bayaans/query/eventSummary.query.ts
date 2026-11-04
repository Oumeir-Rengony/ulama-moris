import { gql } from "@apollo/client";

export default gql`
  query GetEventSummary($events: [String]!, $limit: Int!, $skip: Int!) {
    bayaanCollection(
      where: { event_in: $events }
      limit: $limit
      skip: $skip
      order: sys_id_ASC
    ) {
      total
      items {
        date
        duration
        masjid {
          sys { id }
          title
        }
      }
    }
  }
`;
