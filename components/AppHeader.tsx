"use client";

import { useState } from "react";
import { Button } from "antd";
import { CloseOutlined, LogoutOutlined, MenuOutlined } from "@ant-design/icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
  },
  {
    href: "/workflows",
    label: "Workflows",
  },
  {
    href: "/analytics",
    label: "Analytics",
  },
];

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      await fetch("/api/auth/logout", {
        method: "POST",
      });

      closeMenu();
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="app-header-top">
          <Link href="/dashboard" className="app-logo" onClick={closeMenu}>
            Workflow Insight
          </Link>

          <button
            type="button"
            className="burger-button"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        </div>

        <nav className={`app-nav ${isMenuOpen ? "app-nav-open" : ""}`}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className={pathname === link.href ? "active" : ""}
            >
              {link.label}
            </Link>
          ))}

          <Button
            icon={<LogoutOutlined />}
            loading={isLoggingOut}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </nav>
      </div>
    </header>
  );
}
