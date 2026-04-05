import Link from "next/link";

export function BrandMark() {
  return (
    <Link href="/" className="brand-mark" aria-label="SkillSwap home">
      <span className="brand-mark__logo" aria-hidden="true">
        S
      </span>
      <span>
        <strong>SkillSwap</strong>
        <small>Teach. Learn. Earn.</small>
      </span>
    </Link>
  );
}
