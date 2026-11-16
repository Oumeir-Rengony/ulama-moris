import { gql } from "@apollo/client";

// An event holds at most 10 bayaans, so one page of 10 covers every bayaan in it.
export default gql`
  query GetEventBySlug($slug: String!) {
    eventCollection(where: { slug: $slug }, limit: 1) {
      items {
        title
        slug
        bayaansCollection(limit: 10) {
          items {
            sys { id }
            date
            duration
            masjid {
              sys { id }
              title
            }
          }
        }
      }
    }
  }
`;
