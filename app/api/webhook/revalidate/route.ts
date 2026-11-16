import { NextRequest, NextResponse } from "next/server";
import { verifyRequest } from "@contentful/node-apps-toolkit";
import { getCanonicalRequest } from '@/lib/utils';
import { revalidateTag } from "next/cache";
import { CONTENTFUL_CACHE_TAG } from "@/lib/cache";


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

    // A payload does not say every page its entry appears on (a bayaan does not
    // list its event, an event only lists its current bayaans), so clear every
    // cached Contentful query rather than guess which ones changed.
    // `expire: 0` makes the next visitor get fresh content straight away, so an
    // editor sees their change as soon as they publish.
    revalidateTag(CONTENTFUL_CACHE_TAG, { expire: 0 });

    // Contentful puts `sys` at the top level of the payload, next to `fields`.
    // Audio URLs are tagged with their asset id (`audio:{assetId}`), so this
    // matches when the webhook fires for an asset.
    const id = body?.sys?.id;

    if (id) {
      revalidateTag(`audio:${id}`, { expire: 0 });
    }

    return NextResponse.json({ revalidated: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Revalidation failed" },
      { status: 500 }
    );
  }
}