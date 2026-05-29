import Link from "next/link";

type Props = {
  href?: string;
  className?: string;
};

export function Wordmark({ href = "/", className = "" }: Props) {
  const inner = (
    <span className={`inline-flex items-baseline tracking-tight ${className}`}>
      <span className="font-sans text-base font-semibold text-ink">BandCheck</span>
      <span className="font-sans text-base font-semibold text-accent"> · AI</span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-80">
        {inner}
      </Link>
    );
  }
  return inner;
}
