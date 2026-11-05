import { NextRequest } from "next/server";
import { verifyRequest } from "@contentful/node-apps-toolkit";
import { revalidatePath, revalidateTag } from "next/cache";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/webhook/revalidate/route";

vi.mock("@contentful/node-apps-toolkit", () => ({ verifyRequest: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));

const mockedVerifyRequest = vi.mocked(verifyRequest);
const mockedRevalidatePath = vi.mocked(revalidatePath);
const mockedRevalidateTag = vi.mocked(revalidateTag);

const WEBHOOK_SECRET = "test-webhook-secret";

function sendRawWebhook(rawBody: string): Promise<Response> {
  const request = new NextRequest("http://localhost/api/webhook/revalidate", {
    method: "POST",
    body: rawBody,
    headers: {
      "content-type": "application/json",
      "x-contentful-signature": "signature-from-contentful",
    },
  });
  return POST(request);
}

function sendWebhook(payload: unknown): Promise<Response> {
  return sendRawWebhook(JSON.stringify(payload));
}

beforeEach(() => {
  vi.stubEnv("CF_WEBHOOK_SECRET", WEBHOOK_SECRET);
});

// The shape Contentful sends: `sys` at the top level, next to `fields`.
const publishedBayaan = {
  sys: { id: "5DbwIghILaPkCEI5GaYhmK", type: "Entry" },
  fields: { slug: { "en-US": "mauritius-islamic-finance-hub" } },
};

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("POST /api/webhook/revalidate", () => {
  it("checks the signature against the secret and the exact request Contentful sent", async () => {
    mockedVerifyRequest.mockReturnValue(true);
    const rawBody = JSON.stringify(publishedBayaan);

    await sendRawWebhook(rawBody);

    expect(mockedVerifyRequest).toHaveBeenCalledTimes(1);
    const [secret, canonicalRequest] = mockedVerifyRequest.mock.calls[0];
    expect(secret).toBe(WEBHOOK_SECRET);
    expect(canonicalRequest).toMatchObject({
      path: "/api/webhook/revalidate",
      method: "POST",
      body: rawBody,
      headers: expect.objectContaining({ "x-contentful-signature": "signature-from-contentful" }),
    });
  });

  it("fails closed with 500 when the webhook secret is not configured", async () => {
    vi.stubEnv("CF_WEBHOOK_SECRET", "");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await sendWebhook(publishedBayaan);

    expect(response.status).toBe(500);
    expect(consoleError).toHaveBeenCalledWith("CF_WEBHOOK_SECRET is not set; refusing webhook");
    consoleError.mockRestore();
    expect(mockedVerifyRequest).not.toHaveBeenCalled();
    expect(mockedRevalidatePath).not.toHaveBeenCalled();
  });

  it("returns 400 for a signed body that is not valid JSON", async () => {
    mockedVerifyRequest.mockReturnValue(true);

    const response = await sendRawWebhook("{not json");

    expect(response.status).toBe(400);
    expect(mockedRevalidatePath).not.toHaveBeenCalled();
  });

  it("rejects a request whose signature does not verify", async () => {
    mockedVerifyRequest.mockReturnValue(false);

    const response = await sendWebhook(publishedBayaan);

    expect(response.status).toBe(401);
    expect(mockedRevalidatePath).not.toHaveBeenCalled();
    expect(mockedRevalidateTag).not.toHaveBeenCalled();
  });

  it("refreshes the listing pages, every event page and the lecture's own page", async () => {
    mockedVerifyRequest.mockReturnValue(true);

    const response = await sendWebhook(publishedBayaan);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ revalidated: true });
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/");
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/events");
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/events/[slug]", "layout");
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/audio/mauritius-islamic-finance-hub");
  });

  it("refreshes the cached audio for the id in the payload's top-level sys", async () => {
    mockedVerifyRequest.mockReturnValue(true);

    await sendWebhook(publishedBayaan);

    expect(mockedRevalidateTag).toHaveBeenCalledTimes(1);
    expect(mockedRevalidateTag).toHaveBeenCalledWith("audio:5DbwIghILaPkCEI5GaYhmK", { expire: 0 });
  });

  it("skips the audio and lecture refresh when the payload has no id or slug", async () => {
    mockedVerifyRequest.mockReturnValue(true);

    await sendWebhook({ fields: {} });

    expect(mockedRevalidateTag).not.toHaveBeenCalled();
    expect(mockedRevalidatePath).toHaveBeenCalledTimes(3);
  });

  it("returns 500 when revalidation throws", async () => {
    mockedVerifyRequest.mockReturnValue(true);
    mockedRevalidatePath.mockImplementationOnce(() => {
      throw new Error("cache unavailable");
    });

    const response = await sendWebhook(publishedBayaan);

    expect(response.status).toBe(500);
  });
});
