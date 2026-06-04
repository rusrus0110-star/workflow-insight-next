import { HTTP_STATUS } from "@/lib/constants";
import { errorResponse, successResponse } from "@/lib/api_response";
import { getCurrentUserId } from "@/lib/auth";
import { getUserById } from "@/services/auth_service";

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return errorResponse("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const user = await getUserById(userId);

    if (!user) {
      return errorResponse("User not found", HTTP_STATUS.NOT_FOUND);
    }

    return successResponse(user, "Current user loaded");
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to load user",
      HTTP_STATUS.SERVER_ERROR,
    );
  }
}
