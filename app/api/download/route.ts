import { NextRequest } from "next/server";
import { getPostHogClient } from "@/lib/posthog-server";


export async function GET(req: NextRequest) {
   const fileUrl = req.nextUrl.searchParams.get("url");
   const audioId = req.nextUrl.searchParams.get("audioId");
   const audioTitle = req.nextUrl.searchParams.get("audioTitle");
   const audioAuthor = req.nextUrl.searchParams.get("audioAuthor");
   const audioSlug = req.nextUrl.searchParams.get("audioSlug");
   const audioCategory = req.nextUrl.searchParams.get("audioCategory");
   const downloadSource = req.nextUrl.searchParams.get("source");
   const distinctId =
      req.nextUrl.searchParams.get("distinct_id") ||
      req.headers.get("x-forwarded-for") ||
      "anonymous";


   if (!fileUrl) {
      return new Response("Missing file URL", { status: 400 });
   }

   const urlObj = new URL(fileUrl);

   
   if ( urlObj.hostname !== "ctfassets.net" && !urlObj.hostname.endsWith(".ctfassets.net")) {
      return new Response("Unauthorized", { status: 403 });
   }

   try {
      const response = await fetch(fileUrl);

      if (!response.ok) {
         return new Response("Failed to fetch file", { status: 500 });
      }

      const contentType =
         response.headers.get("content-type") || "application/octet-stream";

      // Extract filename from URL
      const fileName = fileUrl.split("/").pop() || "download";

      const posthog = getPostHogClient()

      if (posthog) {
         posthog.capture({
            distinctId,
            event: "audio_download_requested",
            properties: {
               audio_id: audioId,
               audio_title: audioTitle,
               audio_author: audioAuthor,
               audio_slug: audioSlug,
               audio_category: audioCategory,
               download_source: downloadSource,
               file_url: fileUrl,
               file_name: fileName,
               content_type: contentType,
               referer: req.headers.get("referer"),
               user_agent: req.headers.get("user-agent"),
            },
         })

         await posthog.flush()
      }

      return new Response(response.body, {
         headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${fileName}"`,
         },
      });

   } catch (error) {
      return new Response("Error downloading file", { status: 500 });
   }

}
