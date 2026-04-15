import { gql } from "@apollo/client";

export default gql`fragment AssetsFields on Asset {
  title
  description
  contentType
  fileName
  size
  url
  width
  height
}`