import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import { DEMO_USER } from "@/lib/constants";
import User from "@/models/User";
import Workflow from "@/models/Workflow";
import Progress from "@/models/Progress";

dotenv.config({ path: ".env.local" });

type WorkflowSeed = {
  title: string;
  description: string;
  category:
    | "sales"
    | "marketing"
    | "operations"
    | "customer_success"
    | "automation";
  frequency: "daily" | "weekly" | "monthly";
  priority: "low" | "medium" | "high";
  effort: "low" | "medium" | "high";
  pattern:
    | "stable"
    | "declining"
    | "abandoned"
    | "workload_risk"
    | "recent_recovery"
    | "low_activity";
};

const demoWorkflows: WorkflowSeed[] = [
  {
    title: "CRM follow-up review",
    description:
      "Review open leads, check last contact dates and define the next follow-up action for warm prospects.",
    category: "sales",
    frequency: "weekly",
    priority: "high",
    effort: "medium",
    pattern: "stable",
  },
  {
    title: "New lead qualification",
    description:
      "Qualify new inbound leads, check source quality, business fit and next-step readiness.",
    category: "sales",
    frequency: "daily",
    priority: "high",
    effort: "medium",
    pattern: "stable",
  },
  {
    title: "Stalled deal check",
    description:
      "Identify deals without recent activity and define recovery actions for each stalled opportunity.",
    category: "sales",
    frequency: "weekly",
    priority: "high",
    effort: "high",
    pattern: "declining",
  },
  {
    title: "Weekly pipeline update",
    description:
      "Update pipeline stages, review expected close dates and check high-value opportunities.",
    category: "sales",
    frequency: "weekly",
    priority: "high",
    effort: "medium",
    pattern: "stable",
  },
  {
    title: "LinkedIn outreach tracking",
    description:
      "Track outreach activities, follow-up messages and response quality from LinkedIn prospecting.",
    category: "marketing",
    frequency: "weekly",
    priority: "medium",
    effort: "medium",
    pattern: "declining",
  },
  {
    title: "Customer follow-up emails",
    description:
      "Review customer follow-up emails, open replies and pending next actions for active accounts.",
    category: "customer_success",
    frequency: "weekly",
    priority: "high",
    effort: "high",
    pattern: "workload_risk",
  },
  {
    title: "Marketing campaign QA",
    description:
      "Check campaign links, email copy, tracking parameters, forms and CRM field mappings.",
    category: "marketing",
    frequency: "weekly",
    priority: "medium",
    effort: "medium",
    pattern: "stable",
  },
  {
    title: "Automation workflow check",
    description:
      "Check active automation flows, identify failed steps, broken triggers and missing notifications.",
    category: "automation",
    frequency: "weekly",
    priority: "high",
    effort: "high",
    pattern: "workload_risk",
  },
  {
    title: "Client report preparation",
    description:
      "Prepare weekly client performance updates with completed tasks, open risks and next-step recommendations.",
    category: "customer_success",
    frequency: "weekly",
    priority: "high",
    effort: "high",
    pattern: "stable",
  },
  {
    title: "Sales meeting preparation",
    description:
      "Prepare agenda, pipeline numbers, open blockers and next actions for weekly sales meetings.",
    category: "operations",
    frequency: "weekly",
    priority: "medium",
    effort: "medium",
    pattern: "recent_recovery",
  },
  {
    title: "CRM data quality review",
    description:
      "Review duplicate contacts, missing fields, outdated lifecycle stages and inconsistent deal records.",
    category: "operations",
    frequency: "weekly",
    priority: "medium",
    effort: "medium",
    pattern: "abandoned",
  },
  {
    title: "Lead scoring rule review",
    description:
      "Check lead scoring rules, scoring thresholds, source quality and handoff logic to sales.",
    category: "automation",
    frequency: "monthly",
    priority: "medium",
    effort: "high",
    pattern: "low_activity",
  },
  {
    title: "Email nurture performance review",
    description:
      "Review nurture sequence performance, email engagement, drop-off points and next optimization ideas.",
    category: "marketing",
    frequency: "weekly",
    priority: "medium",
    effort: "medium",
    pattern: "declining",
  },
  {
    title: "Customer onboarding checkpoint",
    description:
      "Check onboarding status, open customer questions, missing setup steps and first-value progress.",
    category: "customer_success",
    frequency: "weekly",
    priority: "high",
    effort: "medium",
    pattern: "recent_recovery",
  },
  {
    title: "Internal automation documentation",
    description:
      "Update internal documentation for CRM automations, ownership, trigger logic and failure handling.",
    category: "automation",
    frequency: "monthly",
    priority: "low",
    effort: "medium",
    pattern: "abandoned",
  },
];

const getDateDaysAgo = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(10 + (daysAgo % 6), 15, 0, 0);
  return date;
};

const getWorkloadScoreByPattern = (
  pattern: WorkflowSeed["pattern"],
  index: number,
) => {
  if (pattern === "workload_risk") {
    return index % 3 === 0 ? 1 : 2;
  }

  if (pattern === "declining") {
    return index % 3 === 0 ? 2 : 3;
  }

  if (pattern === "stable") {
    return index % 5 === 0 ? 3 : 4;
  }

  if (pattern === "recent_recovery") {
    return index % 4 === 0 ? 3 : 4;
  }

  if (pattern === "abandoned") {
    return index % 2 === 0 ? 3 : 4;
  }

  return 3;
};

const getCompletionDaysByPattern = (pattern: WorkflowSeed["pattern"]) => {
  switch (pattern) {
    case "stable":
      return [88, 82, 76, 70, 64, 58, 52, 46, 40, 34, 28, 22, 16, 10, 4];

    case "declining":
      return [88, 82, 76, 70, 64, 58, 52, 46, 40, 34, 27, 23, 19, 9];

    case "abandoned":
      return [89, 78, 67, 56, 45, 34, 31];

    case "workload_risk":
      return [
        89, 84, 79, 74, 69, 64, 59, 54, 49, 44, 39, 34, 29, 24, 19, 14, 9, 4,
      ];

    case "recent_recovery":
      return [88, 76, 64, 52, 40, 28, 18, 12, 8, 4, 2];

    case "low_activity":
      return [83, 61, 39, 17];

    default:
      return [];
  }
};

const getCurrentStreak = (pattern: WorkflowSeed["pattern"]) => {
  switch (pattern) {
    case "stable":
      return 6;
    case "workload_risk":
      return 5;
    case "recent_recovery":
      return 3;
    case "declining":
      return 1;
    case "low_activity":
      return 1;
    case "abandoned":
      return 0;
    default:
      return 0;
  }
};

const seedDemoData = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in .env.local");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  console.log("Connected to MongoDB");

  const existingDemoUser = await User.findOne({
    email: DEMO_USER.email,
  });

  if (existingDemoUser) {
    await Progress.deleteMany({
      userId: existingDemoUser._id,
    });

    await Workflow.deleteMany({
      userId: existingDemoUser._id,
    });

    await User.deleteOne({
      _id: existingDemoUser._id,
    });
  }

  console.log("Old demo user data cleared");

  const hashedPassword = await bcrypt.hash(DEMO_USER.password, 10);

  const demoUser = await User.create({
    name: DEMO_USER.name,
    email: DEMO_USER.email,
    password: hashedPassword,
  });

  console.log("Demo user created");

  let totalProgressRecords = 0;

  for (const workflowSeed of demoWorkflows) {
    const completionDays = getCompletionDaysByPattern(workflowSeed.pattern);

    const workflow = await Workflow.create({
      userId: demoUser._id,
      title: workflowSeed.title,
      description: workflowSeed.description,
      category: workflowSeed.category,
      frequency: workflowSeed.frequency,
      priority: workflowSeed.priority,
      effort: workflowSeed.effort,
      currentStreak: getCurrentStreak(workflowSeed.pattern),
      bestStreak: Math.max(
        getCurrentStreak(workflowSeed.pattern),
        completionDays.length,
      ),
      totalCompletions: completionDays.length,
      isActive: true,
    });

    const progressRecords = completionDays.map((daysAgo, index) => ({
      userId: demoUser._id,
      workflowId: workflow._id,
      completedAt: getDateDaysAgo(daysAgo),
      workloadScore: getWorkloadScoreByPattern(workflowSeed.pattern, index),
      notes: `Demo activity record for ${workflowSeed.title}`,
    }));

    await Progress.insertMany(progressRecords);

    totalProgressRecords += progressRecords.length;
  }

  console.log(`Created workflows: ${demoWorkflows.length}`);
  console.log(`Created progress records: ${totalProgressRecords}`);
  console.log("");
  console.log("Demo login:");
  console.log(`Email: ${DEMO_USER.email}`);
  console.log(`Password: ${DEMO_USER.password}`);

  await mongoose.disconnect();

  console.log("MongoDB disconnected");
};

seedDemoData().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
