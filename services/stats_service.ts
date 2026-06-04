import mongoose from "mongoose";

import { connectDb } from "@/lib/db";
import Progress from "@/models/Progress";
import Workflow from "@/models/Workflow";

const getDateDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getDashboardStats = async (userId: string) => {
  await connectDb();

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const workflows = await Workflow.find({
    userId,
    isActive: true,
  });

  const totalWorkflows = workflows.length;

  const totalActivities = await Progress.countDocuments({
    userId,
  });

  const workloadResult = await Progress.aggregate([
    {
      $match: {
        userId: userObjectId,
      },
    },
    {
      $group: {
        _id: null,
        averageWorkloadScore: { $avg: "$workloadScore" },
      },
    },
  ]);

  const averageWorkloadScore = workloadResult[0]?.averageWorkloadScore || 0;

  const bestPerformingWorkflow =
    workflows.length > 0
      ? workflows.reduce((best, current) =>
          current.totalCompletions > best.totalCompletions ? current : best,
        )
      : null;

  const abandonedWorkflows = await getAbandonedWorkflows(userId);
  const workloadRiskWorkflows = await getWorkloadRiskWorkflows(userId);
  const atRiskWorkflows = await getAtRiskWorkflows(userId);

  return {
    totalWorkflows,
    totalActivities,
    averageWorkloadScore: Number(averageWorkloadScore.toFixed(1)),
    bestPerformingWorkflow,
    abandonedCount: abandonedWorkflows.length,
    workloadRiskCount: workloadRiskWorkflows.length,
    atRiskCount: atRiskWorkflows.length,
  };
};

export const getAbandonedWorkflows = async (userId: string) => {
  await connectDb();

  const dateLimit = getDateDaysAgo(10);

  const workflows = await Workflow.find({
    userId,
    isActive: true,
  });

  const result = [];

  for (const workflow of workflows) {
    const lastProgress = await Progress.findOne({
      userId,
      workflowId: workflow._id,
    }).sort({ completedAt: -1 });

    if (!lastProgress || lastProgress.completedAt < dateLimit) {
      result.push({
        workflow,
        lastCompletedAt: lastProgress?.completedAt || null,
        reason: "No activity in the last 10 days",
      });
    }
  }

  return result;
};

export const getAtRiskWorkflows = async (userId: string) => {
  await connectDb();

  const last14Days = getDateDaysAgo(14);
  const previous14Days = getDateDaysAgo(28);

  const workflows = await Workflow.find({
    userId,
    isActive: true,
  });

  const result = [];

  for (const workflow of workflows) {
    const recentCount = await Progress.countDocuments({
      userId,
      workflowId: workflow._id,
      completedAt: { $gte: last14Days },
    });

    const previousCount = await Progress.countDocuments({
      userId,
      workflowId: workflow._id,
      completedAt: {
        $gte: previous14Days,
        $lt: last14Days,
      },
    });

    if (previousCount > 0 && recentCount < previousCount) {
      const declinePercent = Math.round(
        ((previousCount - recentCount) / previousCount) * 100,
      );

      result.push({
        workflow,
        recentCount,
        previousCount,
        declinePercent,
        reason: `Activity declined by ${declinePercent}% compared to the previous period`,
      });
    }
  }

  return result.sort((a, b) => b.declinePercent - a.declinePercent);
};

export const getWorkloadRiskWorkflows = async (userId: string) => {
  await connectDb();

  const last14Days = getDateDaysAgo(14);

  const workflows = await Workflow.find({
    userId,
    isActive: true,
  });

  const result = [];

  for (const workflow of workflows) {
    const workloadStats = await Progress.aggregate([
      {
        $match: {
          userId: workflow.userId,
          workflowId: workflow._id,
          completedAt: { $gte: last14Days },
        },
      },
      {
        $group: {
          _id: "$workflowId",
          averageWorkloadScore: { $avg: "$workloadScore" },
          completions: { $sum: 1 },
        },
      },
    ]);

    const stats = workloadStats[0];

    if (stats && stats.completions >= 4 && stats.averageWorkloadScore <= 2.5) {
      result.push({
        workflow,
        completions: stats.completions,
        averageWorkloadScore: Number(stats.averageWorkloadScore.toFixed(1)),
        reason:
          "High activity with low workload score may indicate overload risk",
      });
    }
  }

  return result;
};
