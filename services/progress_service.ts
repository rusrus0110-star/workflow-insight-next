import mongoose from "mongoose";

import { connectDb } from "@/lib/db";
import Progress from "@/models/Progress";
import Workflow from "@/models/Workflow";

export const getWorkflowProgress = async (
  userId: string,
  workflowId: string,
  days = 30,
) => {
  await connectDb();

  if (!mongoose.Types.ObjectId.isValid(workflowId)) {
    throw new Error("Invalid workflow id");
  }

  const workflow = await Workflow.findOne({
    _id: workflowId,
    userId,
    isActive: true,
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  fromDate.setHours(0, 0, 0, 0);

  const progress = await Progress.find({
    userId,
    workflowId,
    completedAt: {
      $gte: fromDate,
    },
  }).sort({ completedAt: 1 });

  return {
    workflow,
    progress,
  };
};
