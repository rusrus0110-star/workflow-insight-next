import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import User from "@/models/User";
import Workflow from "@/models/Workflow";
import Progress from "@/models/Progress";
import { DEMO_USER } from "@/lib/constants";

dotenv.config({ path: ".env.local" });

const connectDb = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in .env.local");
  }

  await mongoose.connect(process.env.MONGODB_URI);
};

const getDateDaysAgo = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(10, 0, 0, 0);
  return date;
};

const demoWorkflows = [
  {
    title: "CRM follow-up review",
    description:
      "Review open CRM follow-ups and make sure warm leads are not forgotten.",
    category: "sales",
    frequency: "daily",
    priority: "high",
    effort: "medium",
  },
  {
    title: "New lead qualification",
    description:
      "Check new incoming leads and qualify them before they become cold.",
    category: "sales",
    frequency: "daily",
    priority: "high",
    effort: "medium",
  },
  {
    title: "Stalled deal check",
    description:
      "Review deals without recent activity and identify next actions.",
    category: "sales",
    frequency: "weekly",
    priority: "high",
    effort: "high",
  },
  {
    title: "Weekly pipeline update",
    description: "Update pipeline stages and prepare a weekly sales overview.",
    category: "sales",
    frequency: "weekly",
    priority: "high",
    effort: "medium",
  },
  {
    title: "LinkedIn outreach tracking",
    description: "Track outbound LinkedIn activity and follow-up consistency.",
    category: "marketing",
    frequency: "daily",
    priority: "medium",
    effort: "medium",
  },
  {
    title: "Customer follow-up emails",
    description:
      "Send follow-up emails to active customers and open opportunities.",
    category: "customer_success",
    frequency: "daily",
    priority: "high",
    effort: "high",
  },
  {
    title: "Marketing campaign QA",
    description: "Check active campaigns, landing pages and tracking links.",
    category: "marketing",
    frequency: "weekly",
    priority: "medium",
    effort: "medium",
  },
  {
    title: "Automation workflow check",
    description: "Review critical automations and check for broken workflows.",
    category: "automation",
    frequency: "weekly",
    priority: "high",
    effort: "high",
  },
  {
    title: "Client report preparation",
    description: "Prepare recurring client reports and summarize key results.",
    category: "operations",
    frequency: "weekly",
    priority: "medium",
    effort: "medium",
  },
  {
    title: "Sales meeting preparation",
    description: "Prepare agenda and CRM notes before weekly sales meetings.",
    category: "operations",
    frequency: "weekly",
    priority: "medium",
    effort: "low",
  },
] as const;

const completionPatterns: Record<string, number[]> = {
  // stable
  "CRM follow-up review": [
    1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 22, 23, 24, 25, 26, 29,
    30, 31, 32, 33, 36, 37, 38, 39, 40,
  ],
  "Weekly pipeline update": [2, 9, 16, 23, 30, 37, 44],

  // declining in last 14 days
  "LinkedIn outreach tracking": [
    1, 2, 3, 8, 9, 15, 16, 17, 22, 23, 24, 29, 30, 31, 36, 37, 38, 39, 40, 41,
  ],
  "Marketing campaign QA": [4, 18, 25, 32, 39, 46],

  // abandoned
  "Automation workflow check": [12, 19, 26, 33, 40],
  "Stalled deal check": [10, 17, 24, 31, 38, 45],

  // workload risk: active but low workload score recently
  "Customer follow-up emails": [
    1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 22, 23, 24, 25, 26, 29,
    30, 31, 32, 33,
  ],

  // medium
  "New lead qualification": [
    1, 2, 4, 8, 9, 11, 15, 16, 18, 22, 23, 25, 29, 30, 32, 36, 37, 39,
  ],
  "Client report preparation": [3, 10, 17, 24, 31, 38, 45],
  "Sales meeting preparation": [2, 9, 16, 23, 30, 37],
};

const getWorkloadScore = (workflowTitle: string, daysAgo: number) => {
  if (workflowTitle === "Customer follow-up emails" && daysAgo <= 12) {
    return 2;
  }

  if (workflowTitle === "Automation workflow check") {
    return 3;
  }

  if (workflowTitle === "CRM follow-up review") {
    return 4;
  }

  if (workflowTitle === "Weekly pipeline update") {
    return 4;
  }

  if (daysAgo <= 14) {
    return 3;
  }

  return 4;
};

const getProgressNote = (workflowTitle: string, daysAgo: number) => {
  if (workflowTitle === "Customer follow-up emails" && daysAgo <= 12) {
    return "High follow-up volume. Workload feels heavy this week.";
  }

  if (workflowTitle === "Automation workflow check") {
    return "Automation review completed, but ownership should be clarified.";
  }

  if (workflowTitle === "Stalled deal check") {
    return "Several deals require next-step clarification.";
  }

  if (workflowTitle === "LinkedIn outreach tracking" && daysAgo <= 14) {
    return "Outreach activity is lower than expected.";
  }

  return "Workflow completed successfully.";
};

const calculateCurrentStreak = (daysAgoList: number[]) => {
  let streak = 0;

  for (let day = 1; day <= 45; day += 1) {
    if (daysAgoList.includes(day)) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
};

const calculateBestStreak = (daysAgoList: number[]) => {
  const sorted = [...daysAgoList].sort((a, b) => a - b);

  let bestStreak = 0;
  let currentStreak = 0;
  let previousDay: number | null = null;

  for (const day of sorted) {
    if (previousDay === null || day === previousDay + 1) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }

    bestStreak = Math.max(bestStreak, currentStreak);
    previousDay = day;
  }

  return bestStreak;
};

const seedDemoData = async () => {
  await connectDb();

  const existingDemoUser = await User.findOne({ email: DEMO_USER.email });

  if (existingDemoUser) {
    await Progress.deleteMany({ userId: existingDemoUser._id });
    await Workflow.deleteMany({ userId: existingDemoUser._id });
    await User.deleteOne({ _id: existingDemoUser._id });
  }

  const hashedPassword = await bcrypt.hash(DEMO_USER.password, 10);

  const demoUser = await User.create({
    name: DEMO_USER.name,
    email: DEMO_USER.email,
    password: hashedPassword,
  });

  for (const workflowData of demoWorkflows) {
    const daysAgoList = completionPatterns[workflowData.title] || [];

    const workflow = await Workflow.create({
      ...workflowData,
      userId: demoUser._id,
      currentStreak: calculateCurrentStreak(daysAgoList),
      bestStreak: calculateBestStreak(daysAgoList),
      totalCompletions: daysAgoList.length,
      isActive: true,
    });

    const progressRecords = daysAgoList.map((daysAgo) => ({
      userId: demoUser._id,
      workflowId: workflow._id,
      completedAt: getDateDaysAgo(daysAgo),
      workloadScore: getWorkloadScore(workflow.title, daysAgo),
      notes: getProgressNote(workflow.title, daysAgo),
    }));

    await Progress.insertMany(progressRecords);
  }

  console.log("Demo data created successfully.");
  console.log(`Demo email: ${DEMO_USER.email}`);
  console.log(`Demo password: ${DEMO_USER.password}`);
  console.log(`Workflows created: ${demoWorkflows.length}`);

  await mongoose.disconnect();
};

seedDemoData().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
