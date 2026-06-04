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

const severityColorMap = {
  low: "green",
  medium: "orange",
  high: "red",
};

const listStyle = {
  margin: 0,
  paddingLeft: 20,
  color: "var(--text-muted)",
  lineHeight: 1.7,
};

export default function AiInsightPanel({
  insight,
  selectedPeriod,
  isLoading,
  onPeriodChange,
}: AiInsightPanelProps) {
  if (!insight) {
    return (
      <Card className="card" style={{ borderRadius: 18 }}>
        <Alert
          type="info"
          message="AI insight is not available yet."
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card className="card" style={{ borderRadius: 18 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <div>
          <Text
            style={{
              color: "var(--primary)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            OpenAI Business Analysis
          </Text>

          <Title level={3} style={{ marginTop: 12, marginBottom: 8 }}>
            {insight.periodLabel} workflow diagnosis
          </Title>

          <Text type="secondary">{insight.modelLabel}</Text>
        </div>

        <Tag color={severityColorMap[insight.overallRiskLevel]}>
          {insight.overallRiskLevel.toUpperCase()} RISK
        </Tag>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <Button
          type={selectedPeriod === "weekly" ? "primary" : "default"}
          loading={isLoading && selectedPeriod === "weekly"}
          onClick={() => onPeriodChange("weekly")}
        >
          Weekly analysis
        </Button>

        <Button
          type={selectedPeriod === "monthly" ? "primary" : "default"}
          loading={isLoading && selectedPeriod === "monthly"}
          onClick={() => onPeriodChange("monthly")}
        >
          Monthly analysis
        </Button>

        <Button
          type={selectedPeriod === "quarterly" ? "primary" : "default"}
          loading={isLoading && selectedPeriod === "quarterly"}
          onClick={() => onPeriodChange("quarterly")}
        >
          Quarterly analysis
        </Button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 0.7fr",
          gap: 24,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 18,
            background: "#fff",
          }}
        >
          <Text strong>AI summary</Text>

          <Paragraph
            style={{
              marginTop: 10,
              marginBottom: 0,
              fontSize: 16,
              lineHeight: 1.7,
              color: "var(--text-muted)",
            }}
          >
            {insight.summary}
          </Paragraph>
        </div>

        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 18,
            background: "#fff",
          }}
        >
          <Text strong>Confidence score</Text>

          <Progress
            percent={insight.confidenceScore}
            status="active"
            style={{ marginTop: 12 }}
          />

          <Paragraph
            style={{
              marginBottom: 0,
              color: "var(--text-muted)",
            }}
          >
            Based on current workflow and activity data.
          </Paragraph>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 24 }}>
        <div>
          <Title level={5}>Detected data signals</Title>

          <ul style={listStyle}>
            {insight.keyFindings.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <Title level={5}>Next period priorities</Title>

          <ul style={listStyle}>
            {insight.nextPeriodPriorities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <Title level={5}>Risk signals</Title>

        <div style={{ display: "grid", gap: 12 }}>
          {insight.risks.map((risk) => (
            <div
              key={risk.title}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: 16,
                background: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <Text strong>{risk.title}</Text>

                <Tag color={severityColorMap[risk.severity]}>
                  {risk.severity.toUpperCase()}
                </Tag>
              </div>

              <Paragraph
                style={{
                  marginBottom: 0,
                  color: "var(--text-muted)",
                }}
              >
                {risk.reason}
              </Paragraph>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <Title level={5}>Recommended actions</Title>

        <ul style={listStyle}>
          {insight.recommendations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <Paragraph
        style={{
          marginTop: 24,
          marginBottom: 0,
          color: "var(--text-muted)",
          fontSize: 13,
        }}
      >
        Generated at {new Date(insight.generatedAt).toLocaleString()} from
        workflow completions, activity decline, abandoned routines and workload
        scores.
      </Paragraph>
    </Card>
  );
}
