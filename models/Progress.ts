import mongoose, { Schema, model, models } from "mongoose";

export type ProgressDocument = {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  workflowId: mongoose.Types.ObjectId;
  completedAt: Date;
  workloadScore: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

const progressSchema = new Schema<ProgressDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    workflowId: {
      type: Schema.Types.ObjectId,
      ref: "Workflow",
      required: true,
      index: true,
    },
    completedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    workloadScore: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

progressSchema.index({ userId: 1, workflowId: 1, completedAt: -1 });

const Progress =
  models.Progress || model<ProgressDocument>("Progress", progressSchema);

export default Progress;
