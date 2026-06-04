"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Divider, Form, Input, Typography } from "antd";

const { Title, Paragraph, Text } = Typography;

type LoginValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const login = async (values: LoginValues) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Login failed");
    }

    router.push("/dashboard");
  };

  const handleLogin = async (values: LoginValues) => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      await login(values);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setIsDemoLoading(true);
      setErrorMessage("");

      await login({
        email: "demo@workflowinsight.dev",
        password: "Demo123456",
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Demo login failed",
      );
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <div
        className="page-container"
        style={{
          minHeight: "100vh",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 48,
          alignItems: "center",
          padding: "48px 0",
        }}
      >
        <section>
          <Text
            style={{
              color: "var(--primary)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            AI Operations Review Layer
          </Text>

          <Title
            level={1}
            style={{
              marginTop: 16,
              marginBottom: 18,
              fontSize: 56,
              lineHeight: 1.05,
              color: "var(--text-main)",
            }}
          >
            Turn recurring workflow data into weekly business insights.
          </Title>

          <Paragraph
            style={{
              maxWidth: 620,
              fontSize: 18,
              lineHeight: 1.7,
              color: "var(--text-muted)",
            }}
          >
            Workflow Insight helps teams detect follow-up gaps, stalled
            processes, abandoned routines and workload risks across recurring
            business workflows.
          </Paragraph>

          <Button
            type="primary"
            size="large"
            onClick={handleDemoLogin}
            loading={isDemoLoading}
            style={{
              marginTop: 24,
              height: 52,
              paddingInline: 32,
              fontWeight: 700,
              boxShadow: "0 12px 30px rgba(37, 87, 214, 0.28)",
            }}
          >
            Try demo account
          </Button>

          <Paragraph
            style={{
              marginTop: 12,
              color: "var(--text-muted)",
            }}
          >
            Open a prepared business demo with CRM-style workflows, risk signals
            and AI recommendations.
          </Paragraph>
        </section>

        <Card
          className="card"
          style={{
            borderRadius: 24,
          }}
        >
          <Title level={3}>Sign in</Title>

          <Paragraph type="secondary">
            Sign in with your own account, or use the demo button to open the
            prepared showcase dataset.
          </Paragraph>

          {errorMessage && (
            <Alert
              type="error"
              message={errorMessage}
              style={{ marginBottom: 16 }}
            />
          )}

          <Form layout="vertical" onFinish={handleLogin}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Email is required",
                },
                {
                  type: "email",
                  message: "Enter a valid email",
                },
              ]}
            >
              <Input size="large" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Password is required",
                },
              ]}
            >
              <Input.Password size="large" />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={isLoading}
            >
              Login
            </Button>
          </Form>

          <Divider />

          <Button
            size="large"
            block
            onClick={handleDemoLogin}
            loading={isDemoLoading}
            style={{
              fontWeight: 700,
              borderColor: "var(--primary)",
              color: "var(--primary)",
            }}
          >
            Try prepared demo
          </Button>

          <Paragraph style={{ marginTop: 18, marginBottom: 0 }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ color: "var(--primary)" }}>
              Create account
            </Link>
          </Paragraph>
        </Card>
      </div>
    </main>
  );
}
