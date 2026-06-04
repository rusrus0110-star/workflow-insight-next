import { NextRequest } from "next/server";

import { HTTP_STATUS } from "@/lib/constants";
import { errorResponse, successResponse } from "@/lib/api_response";
import { getCurrentUserId } from "@/lib/auth";
import { getWorkflowProgress } from "@/services/progress_service";

type RouteParams = {
  params: Promise<{
    workflowId: string;
  }>;
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return errorResponse("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const { workflowId } = await params;

    const { searchParams } = new URL(req.url);
    const days = Number(searchParams.get("days")) || 30;

    const result = await getWorkflowProgress(userId, workflowId, days);

    return successResponse(result, "Workflow progress loaded");
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to load progress",
      HTTP_STATUS.BAD_REQUEST,
    );
  }
}
