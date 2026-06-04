import { HTTP_STATUS } from "@/lib/constants";
import { errorResponse, successResponse } from "@/lib/api_response";
import { getCurrentUserId } from "@/lib/auth";
import { getAtRiskWorkflows } from "@/services/stats_service";

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return errorResponse("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const workflows = await getAtRiskWorkflows(userId);

    return successResponse(workflows, "At-risk workflows loaded");
  } catch (error) {
    return errorResponse(
      error instanceof Error
        ? error.message
        : "Failed to load at-risk workflows",
      HTTP_STATUS.SERVER_ERROR,
    );
  }
}
