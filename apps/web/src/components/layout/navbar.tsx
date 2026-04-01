"use client";

import Link from "next/link";
import { Bell, LayoutDashboard, LogOut, UserCircle2 } from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";
import { useAuth } from "@/hooks/use-auth";

const navLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/chat", label: "Chat" },
  { href: "/admin", label: "Admin" }
];

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <BrandMark />
        <nav className="site-nav">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="site-actions">
          <Link href="/dashboard" className="icon-link" aria-label="Dashboard">
            <LayoutDashboard size={18} />
          </Link>
          <Link href="/dashboard" className="icon-link" aria-label="Notifications">
            <Bell size={18} />
          </Link>
          <Link href="/profile" className="button button--ghost button--sm">
            <UserCircle2 size={16} />
            {user?.name?.split(" ")[0] ?? "Profile"}
          </Link>
          <Link href="/auth" className="button button--primary button--sm">
            {user ? "Switch account" : "Get started"}
          </Link>
          {user ? (
            <button type="button" className="icon-link" aria-label="Logout" onClick={logout}>
              <LogOut size={18} />
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
