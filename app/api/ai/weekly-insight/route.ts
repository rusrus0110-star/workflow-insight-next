import { NextRequest } from "next/server";

import { HTTP_STATUS } from "@/lib/constants";
import { errorResponse, successResponse } from "@/lib/api_response";
import { getCurrentUserId } from "@/lib/auth";
import { generateAiInsight, type InsightPeriod } from "@/services/ai_service";

const allowedPeriods: InsightPeriod[] = ["weekly", "monthly", "quarterly"];

export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return errorResponse("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const { searchParams } = new URL(req.url);
    const periodParam = searchParams.get("period") || "weekly";

    if (!allowedPeriods.includes(periodParam as InsightPeriod)) {
      return errorResponse("Invalid analysis period", HTTP_STATUS.BAD_REQUEST);
    }

    const insight = await generateAiInsight(
      userId,
      periodParam as InsightPeriod,
    );

    return successResponse(
      insight,
      `${insight.periodLabel} AI insight generated`,
    );
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to generate AI insight",
      HTTP_STATUS.SERVER_ERROR,
    );
  }
}
