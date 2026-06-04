"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, Card, Empty, Spin, Typography } from "antd";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const { Title, Paragraph, Text } = Typography;

type ActivityTrendItem = {
  date: string;
  completions: number;
  averageWorkloadScore: number;
};

type CategoryDistributionItem = {
  category: string;
  count: number;
};

type RiskOverviewItem = {
  name: string;
  count: number;
};

type WorkloadDistributionItem = {
  score: string;
  count: number;
};

type ChartsData = {
  activityTrend: ActivityTrendItem[];
  categoryDistribution: CategoryDistributionItem[];
  riskOverview: RiskOverviewItem[];
  workloadDistribution: WorkloadDistributionItem[];
};

const chartColors = [
  "#2563eb",
  "#16a34a",
  "#f97316",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
];

const hasAnyValue = <T extends { count?: number; completions?: number }>(
  data: T[],
) => {
  return data.some((item) => (item.count || item.completions || 0) > 0);
};

export default function DashboardCharts() {
  const [charts, setCharts] = useState<ChartsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadCharts = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/stats/charts");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load charts");
      }

      setCharts(result.data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCharts();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadCharts]);

  if (isLoading) {
    return (
      <Card className="card" style={{ borderRadius: 18, marginBottom: 24 }}>
        <div
          style={{
            minHeight: 240,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Alert type="error" message={errorMessage} style={{ marginBottom: 24 }} />
    );
  }

  if (!charts) {
    return null;
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 18 }}>
        <Title level={3} style={{ marginBottom: 6 }}>
          Visual workflow analytics
        </Title>

        <Paragraph style={{ color: "var(--text-muted)", marginBottom: 0 }}>
          Charts make workflow activity, risk signals and workload distribution
          easier to review at a glance.
        </Paragraph>
      </div>

      <div className="grid grid-2">
        <Card className="card" style={{ borderRadius: 18 }}>
          <Text
            style={{
              color: "var(--primary)",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Activity trend
          </Text>

          <Title level={4} style={{ marginTop: 10 }}>
            Last 30 days
          </Title>

          {hasAnyValue(charts.activityTrend) ? (
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.activityTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="completions"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty description="No activity data yet" />
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
            Risk overview
          </Text>

          <Title level={4} style={{ marginTop: 10 }}>
            Workflow risk signals
          </Title>

          {hasAnyValue(charts.riskOverview) ? (
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.riskOverview}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {charts.riskOverview.map((_, index) => (
                      <Cell
                        key={`risk-${index}`}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty description="No risk data yet" />
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
            Workflow categories
          </Text>

          <Title level={4} style={{ marginTop: 10 }}>
            Category distribution
          </Title>

          {hasAnyValue(charts.categoryDistribution) ? (
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.categoryDistribution}
                    dataKey="count"
                    nameKey="category"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    label
                  >
                    {charts.categoryDistribution.map((_, index) => (
                      <Cell
                        key={`category-${index}`}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty description="No workflow categories yet" />
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
            Workload scores
          </Text>

          <Title level={4} style={{ marginTop: 10 }}>
            Score distribution
          </Title>

          {hasAnyValue(charts.workloadDistribution) ? (
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.workloadDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="score" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {charts.workloadDistribution.map((_, index) => (
                      <Cell
                        key={`workload-${index}`}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty description="No workload scores yet" />
          )}
        </Card>
      </div>
    </div>
  );
}
