"use client"

import { documentToReactComponents, Options } from "@contentful/rich-text-react-renderer"
import { BLOCKS, INLINES, MARKS, Document } from "@contentful/rich-text-types"
import Image from "next/image"
import Link from "next/link"

interface RichTextRendererProps {
  content: {
    json: Document;
    links?: {
      assets?: {
        block?: Array<{
          sys: { id: string };
          url: string;
          title: string;
          description?: string;
          width?: number;
          height?: number;
        }>;
      };
    };
  };
}

export function RichTextRenderer({ content }: RichTextRendererProps) {
  const assetMap = new Map<string, any>()

  // Build asset map from links
  if (content.links?.assets?.block) {
    for (const asset of content.links.assets.block) {
      assetMap.set(asset.sys.id, asset)
    }
  }

  const options: Options = {
    renderMark: {
      [MARKS.BOLD]: (text) => <strong className="font-semibold">{text}</strong>,
      [MARKS.ITALIC]: (text) => <em>{text}</em>,
      [MARKS.UNDERLINE]: (text) => <u>{text}</u>,
      [MARKS.CODE]: (text) => (
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{text}</code>
      ),
    },
    renderNode: {
      [BLOCKS.PARAGRAPH]: (node, children) => (
        <p className="mb-4 leading-relaxed text-foreground">{children}</p>
      ),
      [BLOCKS.HEADING_1]: (node, children) => (
        <h1 className="mb-4 mt-8 text-3xl font-bold text-foreground">{children}</h1>
      ),
      [BLOCKS.HEADING_2]: (node, children) => (
        <h2 className="mb-4 mt-6 text-2xl font-semibold text-foreground">{children}</h2>
      ),
      [BLOCKS.HEADING_3]: (node, children) => (
        <h3 className="mb-3 mt-5 text-xl font-semibold text-foreground">{children}</h3>
      ),
      [BLOCKS.HEADING_4]: (node, children) => (
        <h4 className="mb-3 mt-4 text-lg font-semibold text-foreground">{children}</h4>
      ),
      [BLOCKS.HEADING_5]: (node, children) => (
        <h5 className="mb-2 mt-4 text-base font-semibold text-foreground">{children}</h5>
      ),
      [BLOCKS.HEADING_6]: (node, children) => (
        <h6 className="mb-2 mt-4 text-sm font-semibold text-foreground">{children}</h6>
      ),
      [BLOCKS.UL_LIST]: (node, children) => (
        <ul className="mb-4 ml-6 list-disc space-y-2 text-foreground">{children}</ul>
      ),
      [BLOCKS.OL_LIST]: (node, children) => (
        <ol className="mb-4 ml-6 list-decimal space-y-2 text-foreground">{children}</ol>
      ),
      [BLOCKS.LIST_ITEM]: (node, children) => (
        <li className="leading-relaxed">{children}</li>
      ),
      [BLOCKS.QUOTE]: (node, children) => (
        <blockquote className="mb-4 border-l-4 border-primary pl-4 italic text-muted-foreground">
          {children}
        </blockquote>
      ),
      [BLOCKS.HR]: () => <hr className="my-8 border-border" />,
      [BLOCKS.EMBEDDED_ASSET]: (node) => {
        const assetId = node.data.target.sys.id
        const asset = assetMap.get(assetId)

        if (!asset) return null

        return (
          <figure className="my-6">
            <Image
              src={asset.url}
              alt={asset.title || "Article image"}
              width={asset.width || 800}
              height={asset.height || 450}
              className="rounded-lg"
            />
            {asset.description && (
              <figcaption className="mt-2 text-center text-sm text-muted-foreground">
                {asset.description}
              </figcaption>
            )}
          </figure>
        )
      },
      [INLINES.HYPERLINK]: (node, children) => {
        const href = node.data.uri
        const isExternal = href.startsWith("http")

        if (isExternal) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline transition-colors hover:text-primary/80"
            >
              {children}
            </a>
          )
        }

        return (
          <Link href={href} className="text-primary underline transition-colors hover:text-primary/80">
            {children}
          </Link>
        )
      },
    },
  }

  console.log(content.json);

  return (
    <div className="prose prose-lg max-w-none">
      {documentToReactComponents(content.json, options)}
    </div>
  )
}
