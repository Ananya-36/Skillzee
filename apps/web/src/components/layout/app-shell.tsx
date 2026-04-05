import type { PropsWithChildren } from "react";
import { AiAssistant } from "@/components/ui/ai-assistant";
import { Footer } from "./footer";
import { Navbar } from "./navbar";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <AiAssistant />
    </>
  );
}
