import { NextRequest } from "next/server";

import { errorResponse, successResponse } from "@/lib/api_response";
import { getCurrentUserId } from "@/lib/auth";
import { HTTP_STATUS } from "@/lib/constants";
import { connectDb } from "@/lib/db";
import Workflow from "@/models/Workflow";

type CrmProvider = "hubspot" | "zoho" | "pipedrive";
type ImportType = "sales" | "operations" | "automation" | "full";

type CrmImportBody = {
  provider: CrmProvider;
  accessToken: string;
  importType: ImportType;
};

const allowedProviders: CrmProvider[] = ["hubspot", "zoho", "pipedrive"];
const allowedImportTypes: ImportType[] = [
  "sales",
  "operations",
  "automation",
  "full",
];

const crmWorkflowTemplates = {
  sales: [
    {
      title: "CRM lead follow-up review",
      description:
        "Review newly created CRM leads, check last contact activity and define the next follow-up action.",
      category: "sales",
      frequency: "weekly",
      priority: "high",
      effort: "medium",
    },
    {
      title: "Sales pipeline review",
      description:
        "Review open deals, identify stalled opportunities and update next steps in the sales pipeline.",
      category: "sales",
      frequency: "weekly",
      priority: "high",
      effort: "high",
    },
  ],
  operations: [
    {
      title: "Customer success check-in",
      description:
        "Review active customer accounts, identify missing touchpoints and prepare next-step communication.",
      category: "customer_success",
      frequency: "weekly",
      priority: "medium",
      effort: "medium",
    },
    {
      title: "Client report preparation",
      description:
        "Prepare weekly client updates with completed tasks, open risks and recommended next actions.",
      category: "operations",
      frequency: "weekly",
      priority: "medium",
      effort: "high",
    },
  ],
  automation: [
    {
      title: "Automation failure review",
      description:
        "Check CRM automation workflows, failed triggers, broken notifications and incomplete handoff steps.",
      category: "automation",
      frequency: "weekly",
      priority: "high",
      effort: "high",
    },
    {
      title: "Marketing workflow QA",
      description:
        "Review active campaign automations, email triggers, lead scoring rules and CRM field updates.",
      category: "marketing",
      frequency: "weekly",
      priority: "medium",
      effort: "medium",
    },
  ],
} as const;

const getTemplatesByImportType = (importType: ImportType) => {
  if (importType === "full") {
    return [
      ...crmWorkflowTemplates.sales,
      ...crmWorkflowTemplates.operations,
      ...crmWorkflowTemplates.automation,
    ];
  }

  return crmWorkflowTemplates[importType];
};

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return errorResponse("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const body = (await req.json()) as CrmImportBody;

    if (!allowedProviders.includes(body.provider)) {
      return errorResponse("Invalid CRM provider", HTTP_STATUS.BAD_REQUEST);
    }

    if (!allowedImportTypes.includes(body.importType)) {
      return errorResponse("Invalid import type", HTTP_STATUS.BAD_REQUEST);
    }

    if (!body.accessToken || body.accessToken.trim().length < 8) {
      return errorResponse(
        "CRM API key or access token is required",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    await connectDb();

    const templates = getTemplatesByImportType(body.importType);

    const importedWorkflows = [];

    for (const template of templates) {
      const workflow = await Workflow.findOneAndUpdate(
        {
          userId,
          title: template.title,
        },
        {
          ...template,
          userId,
          isActive: true,
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        },
      );

      importedWorkflows.push(workflow);
    }

    return successResponse(
      {
        provider: body.provider,
        importType: body.importType,
        importedCount: importedWorkflows.length,
        workflows: importedWorkflows,
        tokenStored: false,
      },
      "CRM workflows imported successfully",
    );
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to import CRM workflows",
      HTTP_STATUS.SERVER_ERROR,
    );
  }
}
