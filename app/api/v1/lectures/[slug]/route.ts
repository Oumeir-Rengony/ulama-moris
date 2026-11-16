import type { NextRequest } from "next/server";
import { appApiError, appApiSuccess } from "@/lib/mobile-app/response";
import { toAppLecture } from "@/lib/mobile-app/convert";
import { getBayaanBySlug } from "@/services/bayaans/bayaan.service";

type LectureRouteContext = {
  params: Promise<{ slug: string }>;
};

// GET /api/v1/lectures/[slug]
// One lecture, for Now Playing, deep links and reminder taps.
export async function GET(request: NextRequest, { params }: LectureRouteContext) {
  const { slug } = await params;

  let bayaan;
  try {
    const result = await getBayaanBySlug({ slug });
    bayaan = result.data;
  } catch (error) {
    console.error("Error fetching lecture:", error);
    return appApiError(request, 500, "Failed to fetch lecture");
  }

  // getBayaanBySlug can't tell "no such lecture" from a Contentful error, so a brief
  // Contentful failure also shows up as this 404.
  if (!bayaan) {
    return appApiError(request, 404, "Lecture not found");
  }

  return appApiSuccess(request, toAppLecture(bayaan));
}
