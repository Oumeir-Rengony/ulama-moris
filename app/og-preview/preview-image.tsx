"use client";

import { useState } from "react";

export function PreviewImage({ title, pageUrl, imageUrl }: {
  title: string;
  pageUrl: string;
  imageUrl: string;
}) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const source = imageUrl;
  const linkClassName = "rounded-sm font-medium text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

  return (
    <section aria-label="Image preview" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">1200 × 630 PNG</p>
      </div>
      <div aria-busy={status === "loading"} className="overflow-hidden rounded-md border border-border bg-muted">
        <img
          key={source}
          src={source}
          alt={`OG image for ${title}`}
          width={1200}
          height={630}
          onLoad={() => setStatus("ready")}
          onError={() => setStatus("error")}
          className={`h-auto w-full ${status === "error" ? "hidden" : ""}`}
        />
        {status === "error" && <p role="alert" className="p-6">The image could not be loaded. Check the dev server output, then click Update preview to retry.</p>}
      </div>
      <div className="flex flex-wrap items-center gap-5 text-sm">
        <a href={source} target="_blank" rel="noreferrer" className={linkClassName}>Open full-size image</a>
        <a href={source} download="og-preview.png" className={linkClassName}>Download PNG</a>
        <a href={pageUrl} target="_blank" rel="noreferrer" className={linkClassName}>Open source page</a>
        <span role="status" className="text-muted-foreground">{status === "loading" ? "Loading image…" : status === "ready" ? "Image loaded" : "Image unavailable"}</span>
      </div>
    </section>
  );
}
