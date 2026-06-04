"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button, Space } from "antd";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Workflows",
    href: "/workflows",
  },
  {
    label: "Analytics",
    href: "/analytics",
  },
];

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/login");
  };

  return (
    <header
      style={{
        padding: "20px 0",
        borderBottom: "1px solid var(--border)",
        background: "rgba(255, 255, 255, 0.82)",
        backdropFilter: "blur(14px)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div
        className="page-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <Link
          href="/dashboard"
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "var(--primary)",
          }}
        >
          Workflow Insight
        </Link>

        <Space size="middle">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  fontWeight: 600,
                  color: isActive ? "var(--primary)" : "var(--text-muted)",
                }}
              >
                {item.label}
              </Link>
            );
          })}

          <Button onClick={handleLogout}>Logout</Button>
        </Space>
      </div>
    </header>
  );
}
