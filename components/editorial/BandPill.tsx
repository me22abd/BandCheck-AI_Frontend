type Tone = "ink" | "forest" | "accent";

const bg: Record<Tone, string> = {
  ink: "bg-ink",
  forest: "bg-forest",
  accent: "bg-accent",
};

export function BandPill({
  letter,
  big = false,
  tone = "ink",
}: {
  letter: string;
  big?: boolean;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center font-sans font-bold text-paper shadow-sm ${bg[tone]} ${
        big ? "h-11 w-11 rounded-[10px] text-[22px]" : "h-7 w-7 rounded-[7px] text-sm"
      }`}
    >
      {letter}
    </span>
  );
}
