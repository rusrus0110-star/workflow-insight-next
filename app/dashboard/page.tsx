"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Button, Spin, Typography } from "antd";
import { useRouter } from "next/navigation";

import AppHeader from "@/components/AppHeader";
import AiInsightPanel from "@/components/AiInsightPanel";
import DashboardCharts from "@/components/DashboardCharts";
import MetricCard from "@/components/MetricCard";

const { Title, Paragraph } = Typography;

type InsightPeriod = "weekly" | "monthly" | "quarterly";

type DashboardStats = {
  totalWorkflows: number;
  totalActivities: number;
  averageWorkloadScore: number;
  bestPerformingWorkflow: {
    title: string;
    totalCompletions: number;
  } | null;
  abandonedCount: number;
  workloadRiskCount: number;
  atRiskCount: number;
};

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

export default function DashboardPage() {
  const router = useRouter();
  const hasAutoLoadedInsight = useRef(false);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [insight, setInsight] = useState<AiInsight | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<InsightPeriod>("weekly");

  const [isLoading, setIsLoading] = useState(true);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadInsight = useCallback(
    async (period: InsightPeriod) => {
      try {
        setSelectedPeriod(period);
        setIsInsightLoading(true);
        setErrorMessage("");

        const response = await fetch(
          `/api/ai/weekly-insight?period=${period}`,
          {
            cache: "no-store",
          },
        );

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to load AI insight");
        }

        setInsight(result.data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Something went wrong",
        );
      } finally {
        setIsInsightLoading(false);
      }
    },
    [router],
  );

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const statsResponse = await fetch("/api/stats/dashboard", {
        cache: "no-store",
      });

      if (statsResponse.status === 401) {
        router.push("/login");
        return;
      }

      const statsResult = await statsResponse.json();

      if (!statsResponse.ok) {
        throw new Error(
          statsResult.message || "Failed to load dashboard stats",
        );
      }

      setStats(statsResult.data);
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
      void loadDashboard();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadDashboard]);

  useEffect(() => {
    if (isLoading) return;
    if (!stats) return;
    if (hasAutoLoadedInsight.current) return;

    hasAutoLoadedInsight.current = true;

    const timer = window.setTimeout(() => {
      void loadInsight("weekly");
    }, 700);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isLoading, stats, loadInsight]);

  return (
    <main className="page-shell">
      <AppHeader />

      <section className="page-container page-section">
        <div className="page-heading">
          <div>
            <Title level={1} style={{ marginBottom: 8 }}>
              Operations Dashboard
            </Title>

            <Paragraph
              style={{
                color: "var(--text-muted)",
                fontSize: 16,
                maxWidth: 760,
              }}
            >
              Monitor recurring CRM-style workflows, follow-up consistency,
              workload signals and operational risks from one business-oriented
              dashboard.
            </Paragraph>
          </div>

          <div className="page-actions">
            <Button
              type="primary"
              onClick={() => {
                hasAutoLoadedInsight.current = false;
                void loadDashboard();
              }}
            >
              Refresh dashboard
            </Button>
          </div>
        </div>

        {errorMessage && (
          <Alert
            type="error"
            title={errorMessage}
            showIcon
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
          <>
            <div className="grid grid-3" style={{ marginBottom: 24 }}>
              <MetricCard
                title="Total Workflows"
                value={stats?.totalWorkflows ?? 0}
                description="Active recurring business workflows"
              />

              <MetricCard
                title="Total Activities"
                value={stats?.totalActivities ?? 0}
                description="Logged workflow completions"
              />

              <MetricCard
                title="Average Workload Score"
                value={stats?.averageWorkloadScore ?? 0}
                description="Average score from 1 to 5"
              />

              <MetricCard
                title="At-Risk Workflows"
                value={stats?.atRiskCount ?? 0}
                description="Declined compared to previous period"
              />

              <MetricCard
                title="Abandoned Workflows"
                value={stats?.abandonedCount ?? 0}
                description="No recent activity detected"
              />

              <MetricCard
                title="Workload Risk"
                value={stats?.workloadRiskCount ?? 0}
                description="High activity with low workload score"
              />
            </div>

            <div
              className="card"
              style={{
                padding: 24,
                marginBottom: 24,
              }}
            >
              <Title level={4} style={{ marginTop: 0 }}>
                Best performing workflow
              </Title>

              <Paragraph
                style={{ marginBottom: 0, color: "var(--text-muted)" }}
              >
                {stats?.bestPerformingWorkflow
                  ? `${stats.bestPerformingWorkflow.title} — ${stats.bestPerformingWorkflow.totalCompletions} logged activities.`
                  : "No workflow data available yet."}
              </Paragraph>
            </div>

            <DashboardCharts />

            <AiInsightPanel
              insight={insight}
              selectedPeriod={selectedPeriod}
              isLoading={isInsightLoading}
              onPeriodChange={loadInsight}
            />
          </>
        )}
      </section>
    </main>
  );
}
