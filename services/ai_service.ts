import {
  getAbandonedWorkflows,
  getAtRiskWorkflows,
  getDashboardStats,
  getWorkloadRiskWorkflows,
} from "@/services/stats_service";

export const generateWeeklyInsight = async (userId: string) => {
  const dashboardStats = await getDashboardStats(userId);
  const abandonedWorkflows = await getAbandonedWorkflows(userId);
  const atRiskWorkflows = await getAtRiskWorkflows(userId);
  const workloadRiskWorkflows = await getWorkloadRiskWorkflows(userId);

  const topAbandoned = abandonedWorkflows
    .slice(0, 2)
    .map((item) => item.workflow.title);
  const topAtRisk = atRiskWorkflows
    .slice(0, 2)
    .map((item) => item.workflow.title);
  const topWorkloadRisk = workloadRiskWorkflows
    .slice(0, 2)
    .map((item) => item.workflow.title);

  return {
    summary:
      "This week, the team shows stable execution in several sales routines, but there are clear operational risks in follow-up consistency, stalled workflow checks and workload pressure.",

    keyFindings: [
      `${dashboardStats.totalWorkflows} active workflows are currently tracked across sales, marketing, operations, customer success and automation.`,
      `${dashboardStats.abandonedCount} workflows show no recent activity and may need management attention.`,
      `${dashboardStats.atRiskCount} workflows declined compared to the previous period.`,
      `${dashboardStats.workloadRiskCount} workflows show possible workload pressure based on recent low workload scores.`,
    ],

    risks: [
      {
        title: "Follow-up consistency risk",
        severity: "high",
        reason:
          topAtRisk.length > 0
            ? `${topAtRisk.join(", ")} declined compared to the previous period. This may increase the risk of losing warm leads or delaying deal progression.`
            : "No major follow-up decline detected in the current demo data.",
      },
      {
        title: "Abandoned workflow risk",
        severity: "medium",
        reason:
          topAbandoned.length > 0
            ? `${topAbandoned.join(", ")} have not been completed recently. These routines may need ownership clarification.`
            : "No abandoned workflows detected.",
      },
      {
        title: "Workload pressure risk",
        severity: "medium",
        reason:
          topWorkloadRisk.length > 0
            ? `${topWorkloadRisk.join(", ")} show high activity combined with low workload scores. This may indicate overload or process fatigue.`
            : "No significant workload pressure detected.",
      },
    ],

    recommendations: [
      "Review stalled sales workflows and define the next action for each open opportunity.",
      "Assign clear ownership for workflows that have not been completed recently.",
      "Prioritize follow-ups for high-value leads before adding new outreach activity.",
      "Monitor customer follow-up workload to prevent overload and quality decline.",
    ],

    nextWeekPriorities: [
      "Run a stalled deal review.",
      "Check abandoned automation workflows.",
      "Reduce workload on high-effort customer follow-up routines.",
      "Keep CRM follow-up review as a stable recurring process.",
    ],
  };
};
