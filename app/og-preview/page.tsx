import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventPath, getEventSlug } from "@/lib/events";
import { getBayaansBase } from "@/services/bayaans/bayaan.service";
import { getEventNames } from "@/services/bayaans/event.service";
import { PreviewImage } from "./preview-image";

export const metadata: Metadata = {
  title: "OG preview tool | Ulama Moris",
  robots: { index: false, follow: false },
};

type PreviewOption = { slug: string; title: string };

export default async function OgPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; event?: string; audio?: string; search?: string; page?: string; title?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();

  const query = await searchParams;
  const type = query.type === "audio" ? "audio" : "event";
  const search = query.search?.trim() || "";
  const customTitle = query.title?.trim().slice(0, 2000) || "";
  const requestedPage = Number(query.page || 1);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageSize = 20;
  let options: PreviewOption[] = [];
  let totalPages = 1;

  if (type === "event") {
    const events = await getEventNames();
    events.sort((first, second) => first.localeCompare(second));
    const seenSlugs = new Set<string>();
    for (const event of events) {
      const slug = getEventSlug(event);
      if (seenSlugs.has(slug)) continue;
      seenSlugs.add(slug);
      options.push({ slug, title: event });
    }
  } else {
    const result = await getBayaansBase({ search, limit: pageSize, skip: (page - 1) * pageSize });
    const collection = result?.bayaanCollection;
    if (!collection) throw new Error("Unable to load audio previews");
    for (const audio of collection.items) {
      if (!audio?.slug) continue;
      options.push({ slug: audio.slug, title: `${audio.title} — ${audio.author || "Unknown author"}` });
    }
    totalPages = Math.ceil(collection.total / pageSize);
  }

  const requestedSlug = type === "audio" ? query.audio : query.event;
  const selected = options.find((option) => option.slug === requestedSlug) || options[0];
  let pageUrl = "";
  let imageUrl = "";
  if (selected) {
    pageUrl = type === "audio" ? `/audio/${encodeURIComponent(selected.slug)}` : getEventPath(selected.title);
    const imageQuery = new URLSearchParams({ type, slug: selected.slug, preview: String(Date.now()) });
    if (customTitle) imageQuery.set("title", customTitle);
    imageUrl = `/og-preview/image?${imageQuery}`;
  }

  const inputClassName = "min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
  const buttonClassName = "min-h-11 rounded-md bg-primary px-5 py-2 font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
  const linkClassName = "rounded-sm font-medium text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <header>
        <p className="mb-2 text-sm font-medium text-muted-foreground">Development tools</p>
        <h1 className="text-2xl font-bold">OG preview tool</h1>
        <p className="mt-2 text-muted-foreground">Preview the actual share images for events and individual audio lectures.</p>
      </header>

      <nav aria-label="Preview type" className="flex gap-2 border-b border-border pb-4">
        <Link href="/og-preview" aria-current={type === "event" ? "page" : undefined} className={`rounded-md px-4 py-2 font-medium focus-visible:outline-2 focus-visible:outline-ring ${type === "event" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>Events</Link>
        <Link href="/og-preview?type=audio" aria-current={type === "audio" ? "page" : undefined} className={`rounded-md px-4 py-2 font-medium focus-visible:outline-2 focus-visible:outline-ring ${type === "audio" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>Audio</Link>
      </nav>

      {type === "audio" && (
        <form action="/og-preview" method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <input type="hidden" name="type" value="audio" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <label htmlFor="search" className="text-sm font-medium">Search audio titles</label>
            <input id="search" name="search" type="search" defaultValue={search} placeholder="Search for a lecture…" className={inputClassName} />
          </div>
          <button type="submit" className={buttonClassName}>Search</button>
        </form>
      )}

      {selected ? (
        <>
          <form action="/og-preview" method="get" className="flex flex-col gap-4">
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="search" value={search} />
            <input type="hidden" name="page" value={page} />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <label htmlFor="selection" className="text-sm font-medium">{type === "audio" ? "Audio lecture" : "Event"}</label>
              <select key={`${type}-${page}-${search}-${selected.slug}`} id="selection" name={type} defaultValue={selected.slug} className={inputClassName}>
                {options.map((option) => <option key={option.slug} value={option.slug}>{option.title}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="custom-title" className="text-sm font-medium">Custom title (optional)</label>
              <textarea
                key={`${type}-${selected.slug}-${customTitle}`}
                id="custom-title"
                name="title"
                defaultValue={customTitle}
                maxLength={2000}
                rows={3}
                aria-describedby="custom-title-help"
                placeholder="Enter a short or long title to test the layout…"
                className={inputClassName}
              />
              <p id="custom-title-help" className="text-sm text-muted-foreground">Preview only. Leave blank to use the saved title.</p>
            </div>
            <button type="submit" className={`${buttonClassName} self-start`}>Update preview</button>
          </form>
          <PreviewImage key={imageUrl} title={customTitle || selected.title} pageUrl={pageUrl} imageUrl={imageUrl} />
        </>
      ) : (
        <p role="status" className="rounded-md border border-border p-6 text-muted-foreground">
          {type === "audio" ? "No audio lectures found. Try another search or return to the first page." : "No events are available to preview."}
        </p>
      )}

      {type === "audio" && totalPages > 1 && (
        <nav aria-label="Audio result pages" className="flex flex-wrap items-center gap-5 text-sm">
          {page > 1 && <Link href={`/og-preview?${new URLSearchParams({ type, search, page: String(page - 1) })}`} className={linkClassName}>Previous</Link>}
          <span className="text-muted-foreground">Page {page} of {totalPages}</span>
          {page < totalPages && <Link href={`/og-preview?${new URLSearchParams({ type, search, page: String(page + 1) })}`} className={linkClassName}>Next</Link>}
        </nav>
      )}
    </main>
  );
}
