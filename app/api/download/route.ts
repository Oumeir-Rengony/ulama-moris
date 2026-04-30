import { NextRequest } from "next/server";


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

      return new Response(response.body, {
         headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, s-maxage=2592000",
            "Content-Disposition": `attachment; filename="${fileName}"`,
         },
      });

   } catch (error) {
      return new Response("Error downloading file", { status: 500 });
   }

}