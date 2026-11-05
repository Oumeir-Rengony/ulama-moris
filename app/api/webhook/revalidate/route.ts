import { NextRequest, NextResponse } from "next/server";
import { verifyRequest } from "@contentful/node-apps-toolkit";
import { getCanonicalRequest } from '@/lib/utils';
import { revalidatePath, revalidateTag } from "next/cache";


export async function POST(req: NextRequest) {
  // Read on each request (not once at import) so a missing secret is caught here.
  const secret = process.env.CF_WEBHOOK_SECRET;
  if (!secret) {
    // Fail closed: without a secret no request can be verified.
    console.error("CF_WEBHOOK_SECRET is not set; refusing webhook");
    return NextResponse.json({ error: "Webhook secret is not configured" }, { status: 500 });
  }

  const rawBody = await req.text();

  const canonicalReq = await getCanonicalRequest(req, rawBody);

  const isVerifiedRequest = verifyRequest(secret, canonicalReq);

  if (!isVerifiedRequest) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Body is not valid JSON" }, { status: 400 });
  }

  try {
   
   //  Optional: only react to publish events
   //  const topic = req.headers.get("x-contentful-topic");

   //  if (topic !== "ContentManagement.Entry.publish") {
   //    return NextResponse.json({ skipped: true });
   //  }

   revalidatePath("/");
   revalidatePath("/events");
   // The webhook only sends a bayaan's current event, not the one it was moved from,
   // so refresh every event page (and its OG image) rather than guess which ones changed.
   revalidatePath("/events/[slug]", "layout");

    // Contentful puts `sys` at the top level of the payload, next to `fields`.
    // Audio URLs are tagged with their asset id (`audio:{assetId}`), so this
    // matches when the webhook fires for an asset.
    const id = body?.sys?.id;

    if (id) {
      revalidateTag(`audio:${id}`, { expire: 0 });
    }

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