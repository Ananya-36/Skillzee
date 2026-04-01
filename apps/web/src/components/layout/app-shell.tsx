import type { PropsWithChildren } from "react";
import { Footer } from "./footer";
import { Navbar } from "./navbar";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
