import { gql } from "@apollo/client";

export const  ArticleContentFields = gql`fragment ArticleContentFields on ArticleContent {
  json
  links {
    assets {
      block {
        ...AssetsFields
      }
    }
  }
}`

export const ArticleFieldsNORichText = gql`fragment ArticleFieldsNORichText on Article {
  sys {
    id
    publishedAt
    firstPublishedAt
  }
  title
  slug
  excerpt
  author
  category
  coverImage {
    ...AssetsFields
  }
}`



export const ArticleFieldsRichText = gql`fragment ArticleFieldsRichText on Article {
  sys {
    id
    publishedAt
    firstPublishedAt
  }
  title
  slug
  excerpt
  author
  content {
    ...ArticleContentFields
  }
  category
  coverImage {
    ...AssetsFields
  }
}`