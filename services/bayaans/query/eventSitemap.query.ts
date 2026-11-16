import { gql } from "@apollo/client";

// An event holds at most 10 bayaans, so one page of 10 covers every bayaan in it.
export default gql`
  query GetEventSitemap($limit: Int!, $skip: Int!) {
    eventCollection(limit: $limit, skip: $skip, order: sys_id_ASC) {
      total
      items {
        slug
        sys {
          publishedAt
        }
        bayaansCollection(limit: 10) {
          items {
            sys {
              publishedAt
            }
          }
        }
      }
    }
  }
`;
