import OpenAI from "openai";

import {
  getAbandonedWorkflows,
  getAtRiskWorkflows,
  getDashboardStats,
  getWorkloadRiskWorkflows,
} from "@/services/stats_service";

export type InsightPeriod = "weekly" | "monthly" | "quarterly";

type AiRisk = {
  title: string;
  severity: "low" | "medium" | "high";
  reason: string;
};

export type AiInsight = {
  generatedAt: string;
  modelLabel: string;
  period: InsightPeriod;
  periodLabel: string;
  overallRiskLevel: "low" | "medium" | "high";
  confidenceScore: number;
  summary: string;
  keyFindings: string[];
  risks: AiRisk[];
  recommendations: string[];
  nextPeriodPriorities: string[];
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

const periodLabelMap: Record<InsightPeriod, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
};

const parseAiJson = (text: string): AiInsight => {
  try {
    return JSON.parse(text) as AiInsight;
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("AI response did not contain valid JSON");
    }

    return JSON.parse(jsonMatch[0]) as AiInsight;
  }
};

export const generateAiInsight = async (
  userId: string,
  period: InsightPeriod,
) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const dashboardStats = await getDashboardStats(userId);
  const abandonedWorkflows = await getAbandonedWorkflows(userId);
  const atRiskWorkflows = await getAtRiskWorkflows(userId);
  const workloadRiskWorkflows = await getWorkloadRiskWorkflows(userId);

  const aiInput = {
    period,
    periodLabel: periodLabelMap[period],
    dashboardStats,
    abandonedWorkflows: abandonedWorkflows.map((item) => ({
      title: item.workflow.title,
      category: item.workflow.category,
      priority: item.workflow.priority,
      effort: item.workflow.effort,
      reason: item.reason,
      lastCompletedAt: item.lastCompletedAt,
    })),
    atRiskWorkflows: atRiskWorkflows.map((item) => ({
      title: item.workflow.title,
      category: item.workflow.category,
      priority: item.workflow.priority,
      effort: item.workflow.effort,
      recentCount: item.recentCount,
      previousCount: item.previousCount,
      declinePercent: item.declinePercent,
      reason: item.reason,
    })),
    workloadRiskWorkflows: workloadRiskWorkflows.map((item) => ({
      title: item.workflow.title,
      category: item.workflow.category,
      priority: item.workflow.priority,
      effort: item.workflow.effort,
      completions: item.completions,
      averageWorkloadScore: item.averageWorkloadScore,
      reason: item.reason,
    })),
  };

  const response = await openai.responses.create({
    model,
    instructions: `
You are an AI business operations analyst.

Analyze workflow data for a CRM-style operational dashboard.
The product tracks recurring sales, marketing, operations, customer success and automation workflows.

Return ONLY valid JSON.
Do not use markdown.
Do not add explanations outside JSON.

The JSON must match this exact shape:
{
  "generatedAt": "ISO string",
  "modelLabel": "string",
  "period": "weekly | monthly | quarterly",
  "periodLabel": "string",
  "overallRiskLevel": "low | medium | high",
  "confidenceScore": number,
  "summary": "string",
  "keyFindings": ["string"],
  "risks": [
    {
      "title": "string",
      "severity": "low | medium | high",
      "reason": "string"
    }
  ],
  "recommendations": ["string"],
  "nextPeriodPriorities": ["string"]
}

Rules:
- Make the answer specific to the provided data.
- Mention workflow names where useful.
- If there is little data, say that confidence is limited.
- Do not invent data that is not present.
- Keep it business-oriented, not academic.
- Make it sound like a real operational review.
`,
    input: JSON.stringify(aiInput),
    max_output_tokens: 1200,
  });

  const parsed = parseAiJson(response.output_text);

  return {
    ...parsed,
    generatedAt: parsed.generatedAt || new Date().toISOString(),
    modelLabel: `${model} via OpenAI API`,
    period,
    periodLabel: periodLabelMap[period],
  };
};

export const generateWeeklyInsight = async (userId: string) => {
  return generateAiInsight(userId, "weekly");
};
