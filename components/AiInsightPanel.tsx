"use client";

import { Alert, Button, Card, Progress, Tag, Typography } from "antd";

const { Title, Paragraph, Text } = Typography;

type InsightPeriod = "weekly" | "monthly" | "quarterly";

type Risk = {
  title: string;
  severity: "low" | "medium" | "high";
  reason: string;
};

type AiInsight = {
  generatedAt: string;
  modelLabel: string;
  period: InsightPeriod;
  periodLabel: string;
  overallRiskLevel: "low" | "medium" | "high";
  confidenceScore: number;
  summary: string;
  keyFindings: string[];
  risks: Risk[];
  recommendations: string[];
  nextPeriodPriorities: string[];
};

type AiInsightPanelProps = {
  insight: AiInsight | null;
  selectedPeriod: InsightPeriod;
  isLoading: boolean;
  onPeriodChange: (period: InsightPeriod) => void;
};

const riskColorMap = {
  low: "green",
  medium: "orange",
  high: "red",
} as const;

const periodButtons: {
  label: string;
  value: InsightPeriod;
}[] = [
  {
    label: "Weekly analysis",
    value: "weekly",
  },
  {
    label: "Monthly analysis",
    value: "monthly",
  },
  {
    label: "Quarterly analysis",
    value: "quarterly",
  },
];

export default function AiInsightPanel({
  insight,
  selectedPeriod,
  isLoading,
  onPeriodChange,
}: AiInsightPanelProps) {
  return (
    <Card className="card" style={{ borderRadius: 18 }}>
      <div style={{ marginBottom: 20 }}>
        <Text
          style={{
            color: "var(--primary)",
            fontWeight: 700,
            letterSpacing: 1.2,
            textTransform: "uppercase",
          }}
        >
          OpenAI Business Analysis
        </Text>

        <Title level={3} style={{ marginTop: 8, marginBottom: 8 }}>
          {insight?.periodLabel || "Workflow diagnosis"}
        </Title>

        <Paragraph style={{ color: "var(--text-muted)", marginBottom: 16 }}>
          Generate an AI-powered operational analysis based on workflow
          completions, abandoned routines, activity decline and workload scores.
        </Paragraph>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {periodButtons.map((button) => (
            <Button
              key={button.value}
              type={selectedPeriod === button.value ? "primary" : "default"}
              loading={isLoading && selectedPeriod === button.value}
              onClick={() => onPeriodChange(button.value)}
            >
              {button.label}
            </Button>
          ))}
        </div>
      </div>

      {!insight && !isLoading && (
        <Alert
          type="info"
          title="AI insight is not generated yet."
          description="Choose weekly, monthly or quarterly analysis to generate a report. This keeps the dashboard faster on initial page load."
          showIcon
        />
      )}

      {isLoading && (
        <Alert
          type="info"
          title="Generating AI analysis..."
          description="OpenAI is analyzing workflow activity, risks and workload signals."
          showIcon
        />
      )}

      {insight && !isLoading && (
        <>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Tag color={riskColorMap[insight.overallRiskLevel]}>
              {insight.overallRiskLevel.toUpperCase()} RISK
            </Tag>

            <Tag>{insight.modelLabel}</Tag>

            <Tag>{insight.periodLabel}</Tag>
          </div>

          <div className="grid grid-2" style={{ marginBottom: 24 }}>
            <div
              style={{
                padding: 18,
                border: "1px solid var(--border)",
                borderRadius: 16,
                background: "var(--surface-soft)",
              }}
            >
              <Title level={5} style={{ marginTop: 0 }}>
                AI summary
              </Title>

              <Paragraph style={{ marginBottom: 0 }}>
                {insight.summary}
              </Paragraph>
            </div>

            <div
              style={{
                padding: 18,
                border: "1px solid var(--border)",
                borderRadius: 16,
                background: "var(--surface-soft)",
              }}
            >
              <Title level={5} style={{ marginTop: 0 }}>
                Confidence score
              </Title>

              <Progress percent={insight.confidenceScore} />

              <Paragraph
                style={{ color: "var(--text-muted)", marginBottom: 0 }}
              >
                Based on available workflow data and activity patterns.
              </Paragraph>
            </div>
          </div>

          {insight.keyFindings.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <Title level={4}>Detected signals</Title>

              <div style={{ display: "grid", gap: 12 }}>
                {insight.keyFindings.map((finding) => (
                  <div
                    key={finding}
                    style={{
                      padding: 16,
                      border: "1px solid var(--border)",
                      borderRadius: 14,
                    }}
                  >
                    {finding}
                  </div>
                ))}
              </div>
            </div>
          )}

          {insight.nextPeriodPriorities.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <Title level={4}>Next period priorities</Title>

              <ul style={{ marginBottom: 0 }}>
                {insight.nextPeriodPriorities.map((priority) => (
                  <li key={priority}>{priority}</li>
                ))}
              </ul>
            </div>
          )}

          {insight.risks.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <Title level={4}>Risk signals</Title>

              <div style={{ display: "grid", gap: 12 }}>
                {insight.risks.map((risk) => (
                  <div
                    key={`${risk.title}-${risk.reason}`}
                    style={{
                      padding: 16,
                      border: "1px solid var(--border)",
                      borderRadius: 14,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <strong>{risk.title}</strong>

                      <Tag color={riskColorMap[risk.severity]}>
                        {risk.severity.toUpperCase()}
                      </Tag>
                    </div>

                    <Paragraph style={{ marginBottom: 0 }}>
                      {risk.reason}
                    </Paragraph>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insight.recommendations.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <Title level={4}>Recommended actions</Title>

              <ul style={{ marginBottom: 0 }}>
                {insight.recommendations.map((recommendation) => (
                  <li key={recommendation}>{recommendation}</li>
                ))}
              </ul>
            </div>
          )}

          <Paragraph style={{ color: "var(--text-muted)", marginBottom: 0 }}>
            Generated at{" "}
            {new Date(insight.generatedAt).toLocaleString("de-DE", {
              dateStyle: "medium",
              timeStyle: "short",
            })}{" "}
            from workflow completions, activity decline, abandoned routines and
            workload scores.
          </Paragraph>
        </>
      )}
    </Card>
  );
}
