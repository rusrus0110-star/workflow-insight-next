import { NextRequest } from "next/server";

import { HTTP_STATUS } from "@/lib/constants";
import { errorResponse, successResponse } from "@/lib/api_response";
import { getCurrentUserId } from "@/lib/auth";
import { createWorkflow, getWorkflows } from "@/services/workflow_service";

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return errorResponse("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const workflows = await getWorkflows(userId);

    return successResponse(workflows, "Workflows loaded");
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to load workflows",
      HTTP_STATUS.SERVER_ERROR,
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return errorResponse("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const body = await req.json();
    const workflow = await createWorkflow(userId, body);

    return successResponse(workflow, "Workflow created", HTTP_STATUS.CREATED);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to create workflow",
      HTTP_STATUS.BAD_REQUEST,
    );
  }
}
