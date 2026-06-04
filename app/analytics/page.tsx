"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, Card, Spin, Tag, Typography } from "antd";
import { useRouter } from "next/navigation";

import AppHeader from "@/components/AppHeader";

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

type AtRiskItem = {
  workflow: Workflow;
  recentCount: number;
  previousCount: number;
  declinePercent: number;
  reason: string;
};

type AbandonedItem = {
  workflow: Workflow;
  lastCompletedAt: string | null;
  reason: string;
};

type WorkloadRiskItem = {
  workflow: Workflow;
  completions: number;
  averageWorkloadScore: number;
  reason: string;
};

const analyticsItemStyle = {
  borderBottom: "1px solid var(--border)",
  padding: "14px 0",
};

const analyticsItemLastStyle = {
  padding: "14px 0 0",
};

const emptyStateStyle = {
  padding: "18px 0",
  color: "var(--text-muted)",
};

export default function AnalyticsPage() {
  const router = useRouter();

  const [atRisk, setAtRisk] = useState<AtRiskItem[]>([]);
  const [abandoned, setAbandoned] = useState<AbandonedItem[]>([]);
  const [workloadRisk, setWorkloadRisk] = useState<WorkloadRiskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const [atRiskResponse, abandonedResponse, workloadRiskResponse] =
        await Promise.all([
          fetch("/api/stats/at-risk"),
          fetch("/api/stats/abandoned"),
          fetch("/api/stats/workload-risk"),
        ]);

      if (
        atRiskResponse.status === 401 ||
        abandonedResponse.status === 401 ||
        workloadRiskResponse.status === 401
      ) {
        router.push("/login");
        return;
      }

      const atRiskResult = await atRiskResponse.json();
      const abandonedResult = await abandonedResponse.json();
      const workloadRiskResult = await workloadRiskResponse.json();

      if (!atRiskResponse.ok) {
        throw new Error(atRiskResult.message || "Failed to load at-risk data");
      }

      if (!abandonedResponse.ok) {
        throw new Error(
          abandonedResult.message || "Failed to load abandoned workflows",
        );
      }

      if (!workloadRiskResponse.ok) {
        throw new Error(
          workloadRiskResult.message || "Failed to load workload risks",
        );
      }

      setAtRisk(atRiskResult.data);
      setAbandoned(abandonedResult.data);
      setWorkloadRisk(workloadRiskResult.data);
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
      void loadAnalytics();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadAnalytics]);

  return (
    <main className="page-shell">
      <AppHeader />

      <section className="page-container" style={{ padding: "40px 0 72px" }}>
        <div style={{ marginBottom: 28 }}>
          <Title level={1} style={{ marginBottom: 8 }}>
            Workflow Analytics
          </Title>

          <Paragraph
            style={{
              color: "var(--text-muted)",
              fontSize: 16,
              maxWidth: 780,
            }}
          >
            Identify declining workflows, abandoned routines and workload risk
            signals based on CRM-style operational activity.
          </Paragraph>
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
        ) : (
          <div className="grid grid-2">
            <Card className="card" style={{ borderRadius: 18 }}>
              <Text
                style={{
                  color: "var(--primary)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Declining workflows
              </Text>

              <Title level={3} style={{ marginTop: 10 }}>
                At-risk workflows
              </Title>

              <Paragraph style={{ color: "var(--text-muted)" }}>
                Workflows where recent activity declined compared to the
                previous period.
              </Paragraph>

              {atRisk.length === 0 ? (
                <div style={emptyStateStyle}>
                  No declining workflows detected.
                </div>
              ) : (
                <div>
                  {atRisk.map((item, index) => (
                    <div
                      key={item.workflow._id}
                      style={
                        index === atRisk.length - 1
                          ? analyticsItemLastStyle
                          : analyticsItemStyle
                      }
                    >
                      <div style={{ marginBottom: 6 }}>
                        <Text strong>{item.workflow.title}</Text>{" "}
                        <Tag color="red">-{item.declinePercent}%</Tag>
                      </div>

                      <Paragraph
                        style={{
                          color: "var(--text-muted)",
                          marginBottom: 4,
                        }}
                      >
                        {item.reason}
                      </Paragraph>

                      <Text type="secondary">
                        Recent: {item.recentCount} / Previous:{" "}
                        {item.previousCount}
                      </Text>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="card" style={{ borderRadius: 18 }}>
              <Text
                style={{
                  color: "var(--primary)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Abandoned routines
              </Text>

              <Title level={3} style={{ marginTop: 10 }}>
                No recent activity
              </Title>

              <Paragraph style={{ color: "var(--text-muted)" }}>
                Workflows that have not been completed recently and may require
                ownership clarification.
              </Paragraph>

              {abandoned.length === 0 ? (
                <div style={emptyStateStyle}>
                  No abandoned workflows detected.
                </div>
              ) : (
                <div>
                  {abandoned.map((item, index) => (
                    <div
                      key={item.workflow._id}
                      style={
                        index === abandoned.length - 1
                          ? analyticsItemLastStyle
                          : analyticsItemStyle
                      }
                    >
                      <div style={{ marginBottom: 6 }}>
                        <Text strong>{item.workflow.title}</Text>{" "}
                        <Tag color="orange">REVIEW</Tag>
                      </div>

                      <Paragraph
                        style={{
                          color: "var(--text-muted)",
                          marginBottom: 4,
                        }}
                      >
                        {item.reason}
                      </Paragraph>

                      <Text type="secondary">
                        Last completed:{" "}
                        {item.lastCompletedAt
                          ? new Date(item.lastCompletedAt).toLocaleDateString()
                          : "Never"}
                      </Text>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="card" style={{ borderRadius: 18 }}>
              <Text
                style={{
                  color: "var(--primary)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Workload pressure
              </Text>

              <Title level={3} style={{ marginTop: 10 }}>
                Workload risk signals
              </Title>

              <Paragraph style={{ color: "var(--text-muted)" }}>
                High activity combined with low workload score may indicate
                overload or process fatigue.
              </Paragraph>

              {workloadRisk.length === 0 ? (
                <div style={emptyStateStyle}>No workload risk detected.</div>
              ) : (
                <div>
                  {workloadRisk.map((item, index) => (
                    <div
                      key={item.workflow._id}
                      style={
                        index === workloadRisk.length - 1
                          ? analyticsItemLastStyle
                          : analyticsItemStyle
                      }
                    >
                      <div style={{ marginBottom: 6 }}>
                        <Text strong>{item.workflow.title}</Text>{" "}
                        <Tag color="volcano">RISK</Tag>
                      </div>

                      <Paragraph
                        style={{
                          color: "var(--text-muted)",
                          marginBottom: 4,
                        }}
                      >
                        {item.reason}
                      </Paragraph>

                      <Text type="secondary">
                        Completions: {item.completions} / Average workload
                        score: {item.averageWorkloadScore}
                      </Text>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="card" style={{ borderRadius: 18 }}>
              <Text
                style={{
                  color: "var(--primary)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Business interpretation
              </Text>

              <Title level={3} style={{ marginTop: 10 }}>
                What this means
              </Title>

              <Paragraph
                style={{ color: "var(--text-muted)", lineHeight: 1.7 }}
              >
                This dashboard is designed to show not only completed tasks, but
                operational signals: where follow-up discipline is declining,
                which workflows were abandoned, and where high activity may be
                creating workload pressure.
              </Paragraph>

              <ul
                style={{
                  margin: 0,
                  paddingLeft: 20,
                  color: "var(--text-muted)",
                  lineHeight: 1.7,
                }}
              >
                <li>
                  Declining workflows may indicate follow-up gaps or weaker
                  sales discipline.
                </li>
                <li>
                  Abandoned workflows may create risk in pipeline review,
                  automation checks or client reporting.
                </li>
                <li>
                  Workload pressure signals help identify processes that are
                  active but potentially overloaded.
                </li>
              </ul>
            </Card>
          </div>
        )}
      </section>
    </main>
  );
}
