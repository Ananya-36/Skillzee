import Link from "next/link";

export function BrandMark() {
  return (
    <Link href="/" className="brand-mark" aria-label="Skillzee home">
      <span className="brand-mark__logo" aria-hidden="true">
        S
      </span>
      <span>
        <strong>Skillzee</strong>
        <small>Where skills create value</small>
      </span>
    </Link>
  );
}
