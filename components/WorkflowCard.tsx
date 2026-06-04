"use client";

import { Button, Card, Space, Tag, Typography } from "antd";

const { Title, Paragraph, Text } = Typography;

type Workflow = {
  _id: string;
  title: string;
  description: string;
  category: string;
  frequency: string;
  priority: "low" | "medium" | "high";
  effort: "low" | "medium" | "high";
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
};

type WorkflowCardProps = {
  workflow: Workflow;
  onLogActivity: (workflowId: string) => void;
};

const priorityColorMap = {
  low: "green",
  medium: "orange",
  high: "red",
};

export default function WorkflowCard({
  workflow,
  onLogActivity,
}: WorkflowCardProps) {
  return (
    <Card
      className="card"
      style={{
        borderRadius: 18,
        height: "100%",
      }}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <div>
          <Space wrap style={{ marginBottom: 12 }}>
            <Tag color="blue">{workflow.category.replace("_", " ")}</Tag>
            <Tag color={priorityColorMap[workflow.priority]}>
              {workflow.priority.toUpperCase()} PRIORITY
            </Tag>
            <Tag>{workflow.frequency}</Tag>
          </Space>

          <Title level={4} style={{ margin: 0 }}>
            {workflow.title}
          </Title>

          <Paragraph
            style={{
              marginTop: 10,
              color: "var(--text-muted)",
              minHeight: 48,
            }}
          >
            {workflow.description}
          </Paragraph>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}
        >
          <div>
            <Text type="secondary">Current streak</Text>
            <div style={{ fontWeight: 700 }}>{workflow.currentStreak}</div>
          </div>

          <div>
            <Text type="secondary">Best streak</Text>
            <div style={{ fontWeight: 700 }}>{workflow.bestStreak}</div>
          </div>

          <div>
            <Text type="secondary">Activities</Text>
            <div style={{ fontWeight: 700 }}>{workflow.totalCompletions}</div>
          </div>
        </div>

        <Button
          type="primary"
          block
          onClick={() => onLogActivity(workflow._id)}
        >
          Log activity
        </Button>
      </Space>
    </Card>
  );
}
