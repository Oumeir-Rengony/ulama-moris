import { gql} from "@apollo/client";

// A bayaan belongs to at most one event, and an event holds at most 10 bayaans.
// The event's bayaan ids are used to find related lectures from the same event.
export default gql`fragment BayaanFields on Bayaan {
         sys {
            id
         }
         title
         slug
         description
         metaTitle
         metaDescription
         local
         date
         author
         duration
         category
         masjid {
            title
            geoLink
         }
         audio {
            ...AssetsFields
         }
         linkedFrom {
            eventCollection(limit: 1) {
               items {
                  title
                  slug
                  bayaansCollection(limit: 10) {
                     items {
                        sys {
                           id
                        }
                     }
                  }
               }
            }
         }
      }`
