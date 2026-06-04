import { HTTP_STATUS } from "@/lib/constants";
import { errorResponse, successResponse } from "@/lib/api_response";
import { getCurrentUserId } from "@/lib/auth";
import { getDashboardChartsData } from "@/services/chart_service";

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return errorResponse("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const charts = await getDashboardChartsData(userId);

    return successResponse(charts, "Dashboard charts loaded");
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to load charts",
      HTTP_STATUS.SERVER_ERROR,
    );
  }
}
