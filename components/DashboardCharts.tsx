"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, Card, Empty, Spin, Typography } from "antd";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const { Title, Paragraph } = Typography;

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

type ApiResponse = {
  success: boolean;
  message: string;
  data: ChartsData;
};

const CHART_WIDTH = 520;
const CHART_HEIGHT = 300;

const chartColors = [
  "#2563eb",
  "#16a34a",
  "#f97316",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
];

const chartWrapperStyle = {
  width: "100%",
  overflowX: "auto",
  overflowY: "hidden",
  paddingBottom: 4,
} as const;

const hasCountValue = <T extends { count: number }>(data: T[]) => {
  return data.some((item) => item.count > 0);
};

const hasActivityValue = (data: ActivityTrendItem[]) => {
  return data.some(
    (item) => item.completions > 0 || item.averageWorkloadScore > 0,
  );
};

export default function DashboardCharts() {
  const [chartsData, setChartsData] = useState<ChartsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadCharts = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/stats/charts", {
        cache: "no-store",
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load dashboard charts");
      }

      setChartsData(result.data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load charts",
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
            minHeight: 280,
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
      <Alert
        type="error"
        title={errorMessage}
        showIcon
        style={{ marginBottom: 24 }}
      />
    );
  }

  if (!chartsData) {
    return null;
  }

  return (
    <section style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 18 }}>
        <Title level={3} style={{ marginBottom: 6 }}>
          Workflow Analytics Charts
        </Title>

        <Paragraph style={{ color: "var(--text-muted)", marginBottom: 0 }}>
          Visual overview of workflow activity, risk distribution, categories
          and workload signals.
        </Paragraph>
      </div>

      <div className="grid grid-2">
        <Card className="card" style={{ borderRadius: 18, overflow: "hidden" }}>
          <Title level={4} style={{ marginTop: 0 }}>
            Activity trend — last 30 days
          </Title>

          {hasActivityValue(chartsData.activityTrend) ? (
            <div style={chartWrapperStyle}>
              <LineChart
                width={CHART_WIDTH}
                height={CHART_HEIGHT}
                data={chartsData.activityTrend}
                margin={{
                  top: 16,
                  right: 20,
                  left: -8,
                  bottom: 8,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completions"
                  name="Completions"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="averageWorkloadScore"
                  name="Avg workload score"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </div>
          ) : (
            <Empty description="No activity data yet" />
          )}
        </Card>

        <Card className="card" style={{ borderRadius: 18, overflow: "hidden" }}>
          <Title level={4} style={{ marginTop: 0 }}>
            Risk overview
          </Title>

          {hasCountValue(chartsData.riskOverview) ? (
            <div style={chartWrapperStyle}>
              <BarChart
                width={CHART_WIDTH}
                height={CHART_HEIGHT}
                data={chartsData.riskOverview}
                margin={{
                  top: 16,
                  right: 20,
                  left: -8,
                  bottom: 8,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Workflows">
                  {chartsData.riskOverview.map((_, index) => (
                    <Cell
                      key={`risk-${index}`}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </div>
          ) : (
            <Empty description="No risk data yet" />
          )}
        </Card>

        <Card className="card" style={{ borderRadius: 18, overflow: "hidden" }}>
          <Title level={4} style={{ marginTop: 0 }}>
            Workflow categories
          </Title>

          {hasCountValue(chartsData.categoryDistribution) ? (
            <div style={chartWrapperStyle}>
              <PieChart width={CHART_WIDTH} height={CHART_HEIGHT}>
                <Tooltip />
                <Legend />
                <Pie
                  data={chartsData.categoryDistribution}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="45%"
                  outerRadius={90}
                  label
                >
                  {chartsData.categoryDistribution.map((_, index) => (
                    <Cell
                      key={`category-${index}`}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </div>
          ) : (
            <Empty description="No category data yet" />
          )}
        </Card>

        <Card className="card" style={{ borderRadius: 18, overflow: "hidden" }}>
          <Title level={4} style={{ marginTop: 0 }}>
            Workload score distribution
          </Title>

          {hasCountValue(chartsData.workloadDistribution) ? (
            <div style={chartWrapperStyle}>
              <BarChart
                width={CHART_WIDTH}
                height={CHART_HEIGHT}
                data={chartsData.workloadDistribution}
                margin={{
                  top: 16,
                  right: 20,
                  left: -8,
                  bottom: 8,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="score" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Activity records">
                  {chartsData.workloadDistribution.map((_, index) => (
                    <Cell
                      key={`workload-${index}`}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </div>
          ) : (
            <Empty description="No workload data yet" />
          )}
        </Card>
      </div>
    </section>
  );
}
