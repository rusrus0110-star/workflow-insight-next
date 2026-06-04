import mongoose, { Schema, model, models } from "mongoose";

export type WorkflowCategory =
  | "sales"
  | "marketing"
  | "operations"
  | "customer_success"
  | "automation";

export type WorkflowFrequency = "daily" | "weekly" | "monthly";
export type WorkflowPriority = "low" | "medium" | "high";
export type WorkflowEffort = "low" | "medium" | "high";

export type WorkflowDocument = {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: WorkflowCategory;
  frequency: WorkflowFrequency;
  priority: WorkflowPriority;
  effort: WorkflowEffort;
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const workflowSchema = new Schema<WorkflowDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Workflow title is required"],
      trim: true,
      minlength: 3,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "sales",
        "marketing",
        "operations",
        "customer_success",
        "automation",
      ],
      required: true,
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true,
      default: "weekly",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
      default: "medium",
    },
    effort: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
      default: "medium",
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    bestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCompletions: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Workflow =
  models.Workflow || model<WorkflowDocument>("Workflow", workflowSchema);

export default Workflow;
