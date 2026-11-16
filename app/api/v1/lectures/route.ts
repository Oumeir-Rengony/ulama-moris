import type { NextRequest } from "next/server";
import { appApiError, appApiSuccess } from "@/lib/mobile-app/response";
import { toAppLecture, toContentfulSeries, type AppLecture } from "@/lib/mobile-app/convert";
import { parseLimitParam } from "@/lib/mobile-app/limit-param";
import { parsePageParam } from "@/lib/search-params";
import { getBayaansBase, type Local } from "@/services/bayaans/bayaan.service";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

// GET /api/v1/lectures?page=1&limit=10&type=guest&search=sahaba
// The app's Home list and lecture search, newest first.
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parsePageParam(searchParams.get("page") ?? undefined);
  const limit = parseLimitParam(searchParams.get("limit"), DEFAULT_LIMIT, MAX_LIMIT);
  const search = searchParams.get("search")?.trim() ?? "";

  let type: Local | undefined = undefined;
  const requestedType = searchParams.get("type");
  if (requestedType) {
    const contentfulSeries = toContentfulSeries(requestedType);
    if (!contentfulSeries) {
      return appApiError(request, 400, `Unknown type "${requestedType}"`);
    }
    type = contentfulSeries;
  }

  const skip = (page - 1) * limit;

  let collection;
  try {
    const result = await getBayaansBase({ limit, skip, type, search });
    collection = result?.bayaanCollection;
  } catch (error) {
    console.error("Error fetching lectures:", error);
    return appApiError(request, 500, "Failed to fetch lectures");
  }

  // ExecuteQuery reports Contentful errors as missing data rather than throwing.
  if (!collection) {
    console.error("Error fetching lectures: Contentful returned no bayaanCollection");
    return appApiError(request, 500, "Failed to fetch lectures");
  }

  const items: AppLecture[] = [];
  for (const bayaan of collection.items) {
    items.push(toAppLecture(bayaan));
  }

  // Contentful reports a total of 0 past the last page, so the app stops on hasMore.
  const hasMore = skip + items.length < collection.total;

  return appApiSuccess(request, { items, total: collection.total, page, hasMore });
}
