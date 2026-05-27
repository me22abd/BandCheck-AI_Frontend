import { ReactNode } from "react";

export function EditorialCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-editorial border border-hairline bg-paper-card shadow-editorial-sm ${className}`}
    >
      {children}
    </div>
  );
}
