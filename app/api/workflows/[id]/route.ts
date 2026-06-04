import { NextRequest } from "next/server";

import { HTTP_STATUS } from "@/lib/constants";
import { errorResponse, successResponse } from "@/lib/api_response";
import { getCurrentUserId } from "@/lib/auth";
import {
  deleteWorkflow,
  getWorkflowById,
  updateWorkflow,
} from "@/services/workflow_service";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return errorResponse("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const { id } = await params;
    const workflow = await getWorkflowById(userId, id);

    return successResponse(workflow, "Workflow loaded");
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to load workflow",
      HTTP_STATUS.BAD_REQUEST,
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return errorResponse("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const { id } = await params;
    const body = await req.json();

    const workflow = await updateWorkflow(userId, id, body);

    return successResponse(workflow, "Workflow updated");
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to update workflow",
      HTTP_STATUS.BAD_REQUEST,
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return errorResponse("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const { id } = await params;
    const workflow = await deleteWorkflow(userId, id);

    return successResponse(workflow, "Workflow deleted");
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to delete workflow",
      HTTP_STATUS.BAD_REQUEST,
    );
  }
}
