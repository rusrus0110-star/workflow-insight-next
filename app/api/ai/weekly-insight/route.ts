import { NextRequest } from "next/server";

import { HTTP_STATUS } from "@/lib/constants";
import { errorResponse, successResponse } from "@/lib/api_response";
import { getCurrentUserId } from "@/lib/auth";
import { generateAiInsight } from "@/services/ai_service";

type InsightPeriod = "weekly" | "monthly" | "quarterly";

const allowedPeriods: InsightPeriod[] = ["weekly", "monthly", "quarterly"];

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return errorResponse("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const periodParam = request.nextUrl.searchParams.get("period") || "weekly";

    if (!allowedPeriods.includes(periodParam as InsightPeriod)) {
      return errorResponse("Invalid insight period", HTTP_STATUS.BAD_REQUEST);
    }

    const insight = await generateAiInsight(
      userId,
      periodParam as InsightPeriod,
    );

    return successResponse(
      {
        ...insight,
        generatedAt: new Date().toISOString(),
      },
      "AI insight generated successfully",
    );
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to generate AI insight",
      HTTP_STATUS.SERVER_ERROR,
    );
  }
}
