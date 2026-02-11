"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Search,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

// ─── Nav Items ─────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/admin/seasonal-pricing", label: "Seasonal Pricing", icon: DollarSign },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

// ─── Props ─────────────────────────────────────────────────────

interface AdminShellProps {
  children: ReactNode;
  user: {
    name: string;
    email: string;
  };
}

// ─── Component ─────────────────────────────────────────────────

export function AdminShell({ children, user }: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  function isActive(item: { href: string; exact?: boolean }) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside
        className={cn(
          "bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shrink-0",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="h-16 px-4 border-b border-gray-200 flex items-center justify-between">
          {!collapsed && (
            <span
              className="text-lg font-bold truncate"
              style={{
                color: "var(--forest-green)",
                fontFamily: "var(--font-playfair)",
              }}
            >
              Casa Brunelli
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150",
                  collapsed ? "justify-center" : "",
                  active
                    ? "bg-[#1a4a3a] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-gray-200 space-y-1">
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2",
              collapsed ? "justify-center" : ""
            )}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
              style={{ backgroundColor: "var(--terracotta)" }}
            >
              {getInitials(user.name)}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg",
              "text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors",
              collapsed ? "justify-center" : ""
            )}
            title={collapsed ? "Sign out" : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
          <h1 className="text-sm font-semibold text-gray-500 hidden md:block">
            Admin Dashboard
          </h1>

          {/* Search */}
          <div className="relative ml-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search…"
              className={cn(
                "pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg w-56",
                "focus:outline-none focus:ring-2 focus:ring-[#1a4a3a]/20 focus:border-[#1a4a3a]"
              )}
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1280px] mx-auto px-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
