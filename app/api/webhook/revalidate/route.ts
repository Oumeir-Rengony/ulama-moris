import { NextRequest, NextResponse } from "next/server";
import { verifyRequest } from "@contentful/node-apps-toolkit";
import { getCanonicalRequest } from '@/lib/utils';
import { revalidatePath, revalidateTag } from "next/cache";

const SECRET = process.env.CF_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
   const rawBody = await req.text();

   const canonicalReq = await getCanonicalRequest(req, rawBody);

   const isVerifiedRequest = verifyRequest(SECRET, canonicalReq);
   
   console.log({isVerifiedRequest});

  if (!isVerifiedRequest) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  
  const { searchParams } = new URL(req.url);
  
  const tag = searchParams.get("tag") || "";
  
  const body = JSON.parse(rawBody);

  try {
   
   //  Optional: only react to publish events
   //  const topic = req.headers.get("x-contentful-topic");

   //  if (topic !== "ContentManagement.Entry.publish") {
   //    return NextResponse.json({ skipped: true });
   //  }

    revalidatePath("/");
    revalidateTag(tag, { expire: 0 });

    // Extract slug safely
    const slug = body?.fields?.slug?.["en-US"];

    if (slug) {
      revalidatePath(`/audio/${slug}`);
    }

    return NextResponse.json({ revalidated: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Revalidation failed" },
      { status: 500 }
    );
  }
}