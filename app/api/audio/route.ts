export async function GET(req: Request) {
   const { searchParams } = new URL(req.url);
   const url = searchParams.get("url");
   const tag = searchParams.get("tag") || "";

   if (!url) {
      return new Response("Missing url", { status: 400 });
   }

   // Forward range header (CRITICAL for audio/video)
   const range = req.headers.get("range");


   const res = await fetch(url, {
      headers: range ? { Range: range } : {},
      next: { 
         revalidate: 2592000, // cache upstream fetch (1 month)
         tags: [tag]
      }, 
   });

   if (!res.ok) {
      return new Response("Failed to fetch audio", { status: res.status });
   }

   // Pass through important headers
   const headers = new Headers();

   // Content type (audio)
   headers.set(
      "Content-Type",
      res.headers.get("content-type") || "audio/mpeg"
   );

   // Range-related headers (IMPORTANT)
   const contentRange = res.headers.get("content-range");
   if (contentRange) headers.set("Content-Range", contentRange);

   const acceptRanges = res.headers.get("accept-ranges");
   if (acceptRanges) headers.set("Accept-Ranges", acceptRanges);

   const contentLength = res.headers.get("content-length");
   if (contentLength) headers.set("Content-Length", contentLength);

   // cache api response so that user does not hit vercel server
   headers.set(
      "Cache-Control",
      "public, max-age=2592000"
   );

   headers.set("X-Cache-Debug", "server-hit");


   return new Response(res.body, {
      status: res.status, // 200 or 206 (partial content)
      headers,
   });
}