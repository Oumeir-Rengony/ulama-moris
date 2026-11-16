// Text from the CMS ends up inside this script tag. Escaping "<" stops a value
// containing "</script>" from closing the tag early and injecting HTML.
export function JsonLdScript({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
