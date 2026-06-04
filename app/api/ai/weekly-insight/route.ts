import { HTTP_STATUS } from "@/lib/constants";
import { errorResponse, successResponse } from "@/lib/api_response";
import { getCurrentUserId } from "@/lib/auth";
import { generateWeeklyInsight } from "@/services/ai_service";

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return errorResponse("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const insight = await generateWeeklyInsight(userId);

    return successResponse(insight, "AI weekly insight generated");
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to generate AI insight",
      HTTP_STATUS.SERVER_ERROR,
    );
  }
}
