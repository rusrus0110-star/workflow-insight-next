import dayjs from "dayjs";
import mongoose from "mongoose";

import { connectDb } from "@/lib/db";
import Progress from "@/models/Progress";
import Workflow from "@/models/Workflow";
import {
  getAbandonedWorkflows,
  getAtRiskWorkflows,
  getWorkloadRiskWorkflows,
} from "@/services/stats_service";

const categories = [
  "sales",
  "marketing",
  "operations",
  "customer_success",
  "automation",
];

export const getDashboardChartsData = async (userId: string) => {
  await connectDb();

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const fromDate = dayjs().subtract(29, "day").startOf("day").toDate();

  const progressByDay = await Progress.aggregate([
    {
      $match: {
        userId: userObjectId,
        completedAt: {
          $gte: fromDate,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$completedAt",
          },
        },
        completions: {
          $sum: 1,
        },
        averageWorkloadScore: {
          $avg: "$workloadScore",
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  const progressMap = new Map(
    progressByDay.map((item) => [
      item._id,
      {
        completions: item.completions,
        averageWorkloadScore: Number(item.averageWorkloadScore.toFixed(1)),
      },
    ]),
  );

  const activityTrend = Array.from({ length: 30 }).map((_, index) => {
    const date = dayjs()
      .subtract(29 - index, "day")
      .format("YYYY-MM-DD");
    const data = progressMap.get(date);

    return {
      date: dayjs(date).format("DD MMM"),
      completions: data?.completions || 0,
      averageWorkloadScore: data?.averageWorkloadScore || 0,
    };
  });

  const workflows = await Workflow.find({
    userId,
    isActive: true,
  });

  const categoryDistribution = categories.map((category) => ({
    category,
    count: workflows.filter((workflow) => workflow.category === category)
      .length,
  }));

  const abandonedWorkflows = await getAbandonedWorkflows(userId);
  const atRiskWorkflows = await getAtRiskWorkflows(userId);
  const workloadRiskWorkflows = await getWorkloadRiskWorkflows(userId);

  const riskOverview = [
    {
      name: "At-risk",
      count: atRiskWorkflows.length,
    },
    {
      name: "Abandoned",
      count: abandonedWorkflows.length,
    },
    {
      name: "Workload risk",
      count: workloadRiskWorkflows.length,
    },
    {
      name: "Stable",
      count: Math.max(
        workflows.length -
          atRiskWorkflows.length -
          abandonedWorkflows.length -
          workloadRiskWorkflows.length,
        0,
      ),
    },
  ];

  const workloadDistributionRaw = await Progress.aggregate([
    {
      $match: {
        userId: userObjectId,
      },
    },
    {
      $group: {
        _id: "$workloadScore",
        count: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  const workloadMap = new Map(
    workloadDistributionRaw.map((item) => [item._id, item.count]),
  );

  const workloadDistribution = [1, 2, 3, 4, 5].map((score) => ({
    score: `Score ${score}`,
    count: workloadMap.get(score) || 0,
  }));

  return {
    activityTrend,
    categoryDistribution,
    riskOverview,
    workloadDistribution,
  };
};
