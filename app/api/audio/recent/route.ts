import { getBayaansBase } from "@services/bayaans/bayaan.service";
import crypto from "crypto";


export async function GET(request: Request) {
  try {

    // 1️⃣ Extract Bearer token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ message: "Missing or invalid Authorization header" }, { status: 401 });
    }

    const expectedHash = process.env.API_MUFTI_MU_ULAMA_MORIS_TOKEN || "";
    const clientHash = authHeader.replace("Bearer ", "").trim();

    // Convert both to Uint8Array to satisfy timingSafeEqual types
    const clientBytes = new Uint8Array(Buffer.from(clientHash, "utf8"));
    const expectedBytes = new Uint8Array(Buffer.from(expectedHash, "utf8"));

    const valid =
      clientBytes.length === expectedBytes.length &&
      crypto.timingSafeEqual(clientBytes, expectedBytes);

    if (!valid) {
      return Response.json({ message: "Invalid or unauthorized" }, { status: 403 });
    }

    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 4; // default 4


    const bayaans = await getBayaansBase({ limit });

    return Response.json({ status: 'success', data: bayaans?.bayaanCollection?.items });
  } catch (error) {
    console.error("Error in POST /api/bayaans:", error);
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
