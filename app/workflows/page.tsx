"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

import AppHeader from "@/components/AppHeader";

const { Title, Paragraph, Text } = Typography;

type WorkflowCategory =
  | "sales"
  | "marketing"
  | "operations"
  | "customer_success"
  | "automation";

type WorkflowFrequency = "daily" | "weekly" | "monthly";
type WorkflowPriority = "low" | "medium" | "high";
type WorkflowEffort = "low" | "medium" | "high";

type Workflow = {
  _id: string;
  title: string;
  description: string;
  category: WorkflowCategory;
  frequency: WorkflowFrequency;
  priority: WorkflowPriority;
  effort: WorkflowEffort;
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
};

type WorkflowFormValues = {
  title: string;
  description?: string;
  category: WorkflowCategory;
  frequency: WorkflowFrequency;
  priority: WorkflowPriority;
  effort: WorkflowEffort;
};

const categoryOptions = [
  { value: "sales", label: "Sales" },
  { value: "marketing", label: "Marketing" },
  { value: "operations", label: "Operations" },
  { value: "customer_success", label: "Customer Success" },
  { value: "automation", label: "Automation" },
];

const frequencyOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const effortOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const priorityColorMap = {
  low: "green",
  medium: "orange",
  high: "red",
};

const effortColorMap = {
  low: "green",
  medium: "blue",
  high: "volcano",
};

const descriptionClampStyle = {
  color: "var(--text-muted)",
  minHeight: 66,
  marginBottom: 18,
  lineHeight: 1.55,
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
} as const;

export default function WorkflowsPage() {
  const router = useRouter();
  const [form] = Form.useForm<WorkflowFormValues>();

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [isSavingWorkflow, setIsSavingWorkflow] = useState(false);

  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(
    null,
  );
  const [workloadScore, setWorkloadScore] = useState<number>(4);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isLoggingActivity, setIsLoggingActivity] = useState(false);

  const loadWorkflows = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/workflows");

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load workflows");
      }

      setWorkflows(result.data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadWorkflows();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadWorkflows]);

  const openCreateModal = () => {
    setEditingWorkflow(null);

    form.setFieldsValue({
      title: "",
      description: "",
      category: "sales",
      frequency: "weekly",
      priority: "medium",
      effort: "medium",
    });

    setIsWorkflowModalOpen(true);
  };

  const openEditModal = (workflow: Workflow) => {
    setEditingWorkflow(workflow);

    form.setFieldsValue({
      title: workflow.title,
      description: workflow.description,
      category: workflow.category,
      frequency: workflow.frequency,
      priority: workflow.priority,
      effort: workflow.effort,
    });

    setIsWorkflowModalOpen(true);
  };

  const handleSaveWorkflow = async () => {
    try {
      const values = await form.validateFields();

      setIsSavingWorkflow(true);

      const url = editingWorkflow
        ? `/api/workflows/${editingWorkflow._id}`
        : "/api/workflows";

      const method = editingWorkflow ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save workflow");
      }

      message.success(
        editingWorkflow
          ? "Workflow updated successfully"
          : "Workflow created successfully",
      );

      setIsWorkflowModalOpen(false);
      setEditingWorkflow(null);
      form.resetFields();

      await loadWorkflows();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setIsSavingWorkflow(false);
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete workflow");
      }

      message.success("Workflow deleted successfully");

      await loadWorkflows();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  };

  const openLogModal = (workflowId: string) => {
    setSelectedWorkflowId(workflowId);
    setWorkloadScore(4);
    setIsLogModalOpen(true);
  };

  const handleLogActivity = async () => {
    if (!selectedWorkflowId) return;

    try {
      setIsLoggingActivity(true);

      const response = await fetch(
        `/api/workflows/${selectedWorkflowId}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workloadScore,
            notes: "Activity logged from the workflow page.",
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to log activity");
      }

      message.success("Workflow activity logged");

      setIsLogModalOpen(false);
      setSelectedWorkflowId(null);

      await loadWorkflows();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsLoggingActivity(false);
    }
  };

  return (
    <main className="page-shell">
      <AppHeader />

      <section className="page-container" style={{ padding: "40px 0 72px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 24,
            alignItems: "flex-start",
            marginBottom: 28,
          }}
        >
          <div>
            <Title level={1} style={{ marginBottom: 8 }}>
              Business Workflows
            </Title>

            <Paragraph
              style={{
                color: "var(--text-muted)",
                fontSize: 16,
                maxWidth: 760,
              }}
            >
              Create, edit, delete and track recurring sales, marketing,
              operations and automation workflows.
            </Paragraph>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Button onClick={loadWorkflows}>Refresh</Button>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              Create workflow
            </Button>
          </div>
        </div>

        {errorMessage && (
          <Alert
            type="error"
            message={errorMessage}
            style={{ marginBottom: 24 }}
          />
        )}

        {isLoading ? (
          <div
            className="card"
            style={{
              minHeight: 260,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Spin size="large" />
          </div>
        ) : workflows.length === 0 ? (
          <Card
            className="card"
            style={{
              borderRadius: 18,
              textAlign: "center",
              padding: 32,
            }}
          >
            <Title level={3}>No workflows yet</Title>

            <Paragraph style={{ color: "var(--text-muted)", fontSize: 16 }}>
              Create your first workflow to start tracking recurring business
              activity.
            </Paragraph>

            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              Create first workflow
            </Button>
          </Card>
        ) : (
          <div className="grid grid-3">
            {workflows.map((workflow) => (
              <Card
                key={workflow._id}
                className="card"
                style={{
                  borderRadius: 18,
                  height: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <Tag color="blue">{workflow.category}</Tag>

                  <Tag color={priorityColorMap[workflow.priority]}>
                    {workflow.priority.toUpperCase()}
                  </Tag>
                </div>

                <Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>
                  {workflow.title}
                </Title>

                <p style={descriptionClampStyle}>
                  {workflow.description || "No description provided."}
                </p>

                <div
                  style={{
                    display: "grid",
                    gap: 8,
                    marginBottom: 20,
                    color: "var(--text-muted)",
                  }}
                >
                  <Text>
                    Frequency: <strong>{workflow.frequency}</strong>
                  </Text>

                  <Text>
                    Effort:{" "}
                    <Tag color={effortColorMap[workflow.effort]}>
                      {workflow.effort.toUpperCase()}
                    </Tag>
                  </Text>

                  <Text>
                    Current streak: <strong>{workflow.currentStreak}</strong>
                  </Text>

                  <Text>
                    Best streak: <strong>{workflow.bestStreak}</strong>
                  </Text>

                  <Text>
                    Total completions:{" "}
                    <strong>{workflow.totalCompletions}</strong>
                  </Text>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <Button onClick={() => openEditModal(workflow)}>
                    <EditOutlined /> Edit
                  </Button>

                  <Popconfirm
                    title="Delete workflow"
                    description="Are you sure you want to delete this workflow?"
                    okText="Delete"
                    cancelText="Cancel"
                    onConfirm={() => handleDeleteWorkflow(workflow._id)}
                  >
                    <Button danger>
                      <DeleteOutlined /> Delete
                    </Button>
                  </Popconfirm>
                </div>

                <Button
                  type="primary"
                  block
                  onClick={() => openLogModal(workflow._id)}
                >
                  Log activity
                </Button>
              </Card>
            ))}
          </div>
        )}

        <Modal
          title={editingWorkflow ? "Edit workflow" : "Create workflow"}
          open={isWorkflowModalOpen}
          onCancel={() => {
            setIsWorkflowModalOpen(false);
            setEditingWorkflow(null);
            form.resetFields();
          }}
          onOk={handleSaveWorkflow}
          okText={editingWorkflow ? "Save changes" : "Create workflow"}
          confirmLoading={isSavingWorkflow}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Title"
              name="title"
              rules={[
                {
                  required: true,
                  message: "Title is required",
                },
                {
                  min: 3,
                  message: "Title must be at least 3 characters",
                },
              ]}
            >
              <Input size="large" />
            </Form.Item>

            <Form.Item label="Description" name="description">
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item
              label="Category"
              name="category"
              rules={[
                {
                  required: true,
                  message: "Category is required",
                },
              ]}
            >
              <Select options={categoryOptions} />
            </Form.Item>

            <Form.Item
              label="Frequency"
              name="frequency"
              rules={[
                {
                  required: true,
                  message: "Frequency is required",
                },
              ]}
            >
              <Select options={frequencyOptions} />
            </Form.Item>

            <Form.Item
              label="Priority"
              name="priority"
              rules={[
                {
                  required: true,
                  message: "Priority is required",
                },
              ]}
            >
              <Select options={priorityOptions} />
            </Form.Item>

            <Form.Item
              label="Effort"
              name="effort"
              rules={[
                {
                  required: true,
                  message: "Effort is required",
                },
              ]}
            >
              <Select options={effortOptions} />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Log workflow activity"
          open={isLogModalOpen}
          onCancel={() => {
            setIsLogModalOpen(false);
            setSelectedWorkflowId(null);
          }}
          onOk={handleLogActivity}
          okText="Log activity"
          confirmLoading={isLoggingActivity}
        >
          <Paragraph>
            Select a workload score for this completion. Lower score means more
            workload pressure.
          </Paragraph>

          <Select
            value={workloadScore}
            onChange={setWorkloadScore}
            style={{ width: "100%" }}
            options={[
              { value: 5, label: "5 — Low pressure / good workload" },
              { value: 4, label: "4 — Stable workload" },
              { value: 3, label: "3 — Medium workload" },
              { value: 2, label: "2 — High workload pressure" },
              { value: 1, label: "1 — Critical overload" },
            ]}
          />
        </Modal>
      </section>
    </main>
  );
}
