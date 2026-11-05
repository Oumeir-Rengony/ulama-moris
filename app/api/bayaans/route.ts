import { NextRequest, NextResponse } from "next/server";
import { getBayaansWithPagination, type Local } from "@/services/bayaans/bayaan.service";
import { parseDateParam, parsePageParam } from "@/lib/search-params";

export const revalidate = 86400

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const page = parsePageParam(searchParams.get("page") ?? undefined);
  const startDate = parseDateParam(searchParams.get("startDate") ?? undefined);
  const endDate = parseDateParam(searchParams.get("endDate") ?? undefined);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") as Local | undefined;

  try {
    const result = await getBayaansWithPagination({
      page,
      startDate,
      endDate,
      search,
      type: type || undefined,
      isMobile: false,
      isPreview: false,
    });

    // Serialize the result to remove non-JSON-serializable data
    return NextResponse.json(JSON.parse(JSON.stringify(result)));
  } catch (error) {
    console.error("Error fetching bayaans:", error);
    return NextResponse.json(
      { error: "Failed to fetch bayaans" },
      { status: 500 }
    );
  }
}
