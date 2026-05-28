/** Editorial cream design tokens — from bandcheck-ai-ios.html */
export const editorial = {
  colors: {
    paper: "#F4EFE5",
    paperCard: "#FBF7EC",
    paper2: "#EAE3D2",
    ink: "#14120D",
    ink2: "#4A4435",
    ink3: "#8A8472",
    accent: "#C8431C",
    accentDeep: "#9E311A",
    forest: "#0F5C3E",
    hairline: "rgba(20, 18, 13, 0.10)",
    accentGlow: "rgba(217, 97, 59, 0.5)",
    paperMuted: "rgba(244, 239, 229, 0.6)",
    paperDivider: "rgba(244, 239, 229, 0.12)",
    inputBg: "rgba(20, 18, 13, 0.04)",
    chipAccentBg: "rgba(200, 67, 28, 0.10)",
    chipForestBg: "rgba(15, 92, 62, 0.10)",
    accentLight: "rgba(200, 67, 28, 0.15)",
  },
  radius: {
    sm: 6,
    md: 12,
    lg: 18,
    pill: 999,
  },
  shadow: {
    card: {
      shadowColor: "#14120D",
      shadowOpacity: 0.1,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 12 },
      elevation: 4,
    },
    cardSoft: {
      shadowColor: "#14120D",
      shadowOpacity: 0.04,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    button: {
      shadowColor: "#C8431C",
      shadowOpacity: 0.4,
      shadowRadius: 9,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
  },
} as const;

export type EditorialFonts = {
  serif: string;
  serifItalic: string;
  sans: string;
  sansSemiBold: string;
  sansBold: string;
  mono: string;
  monoMedium: string;
};
