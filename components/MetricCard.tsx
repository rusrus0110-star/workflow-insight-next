import { Card, Typography } from "antd";

const { Text, Title } = Typography;

type MetricCardProps = {
  title: string;
  value: string | number;
  description?: string;
};

export default function MetricCard({
  title,
  value,
  description,
}: MetricCardProps) {
  return (
    <Card
      className="card"
      style={{
        height: "100%",
        borderRadius: 18,
      }}
    >
      <Text
        style={{
          color: "var(--text-muted)",
          fontWeight: 600,
        }}
      >
        {title}
      </Text>

      <Title
        level={2}
        style={{
          marginTop: 10,
          marginBottom: 6,
          color: "var(--text-main)",
        }}
      >
        {value}
      </Title>

      {description && (
        <Text
          style={{
            color: "var(--text-muted)",
          }}
        >
          {description}
        </Text>
      )}
    </Card>
  );
}
