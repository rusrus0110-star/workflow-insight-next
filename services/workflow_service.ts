import mongoose from "mongoose";

import { connectDb } from "@/lib/db";
import Workflow from "@/models/Workflow";
import Progress from "@/models/Progress";

type CreateWorkflowInput = {
  title: string;
  description?: string;
  category:
    | "sales"
    | "marketing"
    | "operations"
    | "customer_success"
    | "automation";
  frequency: "daily" | "weekly" | "monthly";
  priority: "low" | "medium" | "high";
  effort: "low" | "medium" | "high";
};

type UpdateWorkflowInput = Partial<CreateWorkflowInput> & {
  isActive?: boolean;
};

type CompleteWorkflowInput = {
  workloadScore: number;
  notes?: string;
};

export const getWorkflows = async (userId: string) => {
  await connectDb();

  return Workflow.find({ userId, isActive: true }).sort({ createdAt: -1 });
};

export const getWorkflowById = async (userId: string, workflowId: string) => {
  await connectDb();

  if (!mongoose.Types.ObjectId.isValid(workflowId)) {
    throw new Error("Invalid workflow id");
  }

  const workflow = await Workflow.findOne({
    _id: workflowId,
    userId,
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  return workflow;
};

export const createWorkflow = async (
  userId: string,
  input: CreateWorkflowInput,
) => {
  await connectDb();

  if (!input.title || !input.category || !input.frequency) {
    throw new Error("Title, category and frequency are required");
  }

  return Workflow.create({
    userId,
    title: input.title,
    description: input.description || "",
    category: input.category,
    frequency: input.frequency,
    priority: input.priority || "medium",
    effort: input.effort || "medium",
  });
};

export const updateWorkflow = async (
  userId: string,
  workflowId: string,
  input: UpdateWorkflowInput,
) => {
  await connectDb();

  if (!mongoose.Types.ObjectId.isValid(workflowId)) {
    throw new Error("Invalid workflow id");
  }

  const workflow = await Workflow.findOneAndUpdate(
    {
      _id: workflowId,
      userId,
    },
    input,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  return workflow;
};

export const deleteWorkflow = async (userId: string, workflowId: string) => {
  await connectDb();

  if (!mongoose.Types.ObjectId.isValid(workflowId)) {
    throw new Error("Invalid workflow id");
  }

  const workflow = await Workflow.findOneAndUpdate(
    {
      _id: workflowId,
      userId,
    },
    {
      isActive: false,
    },
    {
      new: true,
    },
  );

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  return workflow;
};

export const completeWorkflow = async (
  userId: string,
  workflowId: string,
  input: CompleteWorkflowInput,
) => {
  await connectDb();

  if (!mongoose.Types.ObjectId.isValid(workflowId)) {
    throw new Error("Invalid workflow id");
  }

  if (
    !input.workloadScore ||
    input.workloadScore < 1 ||
    input.workloadScore > 5
  ) {
    throw new Error("Workload score must be between 1 and 5");
  }

  const workflow = await Workflow.findOne({
    _id: workflowId,
    userId,
    isActive: true,
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  const progress = await Progress.create({
    userId,
    workflowId,
    workloadScore: input.workloadScore,
    notes: input.notes || "",
    completedAt: new Date(),
  });

  workflow.totalCompletions += 1;
  workflow.currentStreak += 1;
  workflow.bestStreak = Math.max(workflow.bestStreak, workflow.currentStreak);

  await workflow.save();

  return {
    workflow,
    progress,
  };
};
