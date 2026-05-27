import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type BaseProps = {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
};

type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type LinkProps = BaseProps & { href: string };

export function EditorialButton({
  children,
  className = "",
  variant = "primary",
  href,
  ...rest
}: ButtonProps | LinkProps) {
  const base =
    variant === "primary"
      ? "inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-[18px] py-3.5 text-[15px] font-semibold text-paper shadow-btn-accent transition-all hover:bg-accent-deep active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
      : "inline-flex items-center justify-center gap-2 rounded-xl border border-hairline bg-paper-card px-[18px] py-3.5 text-[15px] font-semibold text-ink transition-all hover:opacity-90";

  const classes = `${base} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
