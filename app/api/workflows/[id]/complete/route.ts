import { NextRequest } from "next/server";

import { HTTP_STATUS } from "@/lib/constants";
import { errorResponse, successResponse } from "@/lib/api_response";
import { getCurrentUserId } from "@/lib/auth";
import { completeWorkflow } from "@/services/workflow_service";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return errorResponse("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const { id } = await params;
    const body = await req.json();

    const result = await completeWorkflow(userId, id, body);

    return successResponse(result, "Workflow activity logged");
  } catch (error) {
    return errorResponse(
      error instanceof Error
        ? error.message
        : "Failed to log workflow activity",
      HTTP_STATUS.BAD_REQUEST,
    );
  }
}
