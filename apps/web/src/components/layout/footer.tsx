import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div>
          <BrandMark />
          <p className="muted">
            Skillzee helps students learn, teach, and earn together through trusted peer-led sessions.
          </p>
        </div>
        <div>
          <h4>Product</h4>
          <Link href="/explore">Explore skills</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/how-it-works">How Skillzee Works</Link>
        </div>
        <div>
          <h4>Communication</h4>
          <span>In-app chat</span>
          <span>WhatsApp smart redirection</span>
          <span>Email fallback</span>
        </div>
        <div>
          <h4>Deploy</h4>
          <span>Frontend on Vercel</span>
          <span>Backend on Render</span>
          <span>MongoDB Atlas</span>
        </div>
      </div>
    </footer>
  );
}
