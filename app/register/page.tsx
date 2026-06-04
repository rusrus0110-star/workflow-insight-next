"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Form, Input, Typography } from "antd";

const { Title, Paragraph, Text } = Typography;

type RegisterValues = {
  name: string;
  email: string;
  password: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async (values: RegisterValues) => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      router.push("/dashboard");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsLoading(false);
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
            Create workspace
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
            Start with an empty workflow dashboard.
          </Title>

          <Paragraph
            style={{
              maxWidth: 620,
              fontSize: 18,
              lineHeight: 1.7,
              color: "var(--text-muted)",
            }}
          >
            Register your own account and create workflows from scratch. The
            demo account remains available for the prepared business showcase.
          </Paragraph>
        </section>

        <Card
          className="card"
          style={{
            borderRadius: 24,
          }}
        >
          <Title level={3}>Create account</Title>

          <Paragraph type="secondary">
            A new account starts with an empty workspace. You can create your
            own sales, operations, marketing or automation workflows.
          </Paragraph>

          {errorMessage && (
            <Alert
              type="error"
              title={errorMessage}
              style={{ marginBottom: 16 }}
            />
          )}

          <Form layout="vertical" onFinish={handleRegister}>
            <Form.Item
              label="Name"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Name is required",
                },
              ]}
            >
              <Input size="large" />
            </Form.Item>

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
                {
                  min: 6,
                  message: "Password must be at least 6 characters",
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
              Create account
            </Button>
          </Form>

          <Paragraph style={{ marginTop: 18, marginBottom: 0 }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--primary)" }}>
              Sign in
            </Link>
          </Paragraph>
        </Card>
      </div>
    </main>
  );
}
