type Tone = "ink" | "forest" | "accent";

const tones: Record<Tone, string> = {
  ink: "bg-ink/5 text-ink-2",
  forest: "bg-forest/10 text-forest",
  accent: "bg-accent/10 text-accent",
};

export function SmallChip({
  children,
  tone = "ink",
  className = "",
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
