import { HTTP_STATUS } from "@/lib/constants";
import { errorResponse, successResponse } from "@/lib/api_response";
import { getCurrentUserId } from "@/lib/auth";
import { getDashboardStats } from "@/services/stats_service";

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return errorResponse("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const stats = await getDashboardStats(userId);

    return successResponse(stats, "Dashboard stats loaded");
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to load dashboard stats",
      HTTP_STATUS.SERVER_ERROR,
    );
  }
}
