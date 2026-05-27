import Link from "next/link";

type Props = {
  href?: string;
  className?: string;
};

export function Wordmark({ href = "/", className = "" }: Props) {
  const inner = (
    <span className={`inline-flex items-baseline gap-1 tracking-tight ${className}`}>
      <span className="font-sans text-base font-semibold text-ink">Bandcheck</span>
      <span className="font-serif text-base italic text-accent">ai</span>
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
