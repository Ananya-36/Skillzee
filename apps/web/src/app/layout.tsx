import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { ClientBoot } from "@/components/layout/client-boot";
import { AuthProvider } from "@/hooks/use-auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillSwap",
  description: "Peer-to-peer student marketplace for learning, teaching, booking, chat, and payouts.",
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <ClientBoot />
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
