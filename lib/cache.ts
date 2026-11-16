// Every cached Contentful query is tagged with this, so the Contentful webhook
// can clear all of them in one call. One tag for everything is enough because
// a webhook payload does not reliably say which pages its entry appears on.
export const CONTENTFUL_CACHE_TAG = "contentful";
