import { NextRequest } from "next/server";
import { getPostHogClient } from "@/lib/posthog-server";


export async function GET(req: NextRequest) {
   const fileUrl = req.nextUrl.searchParams.get("url");


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
      posthog.capture({
        distinctId: "anonymous",
        event: "audio_download_requested",
        properties: {
          file_name: fileName,
          file_url: fileUrl,
        },
      })
      await posthog.shutdown()

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