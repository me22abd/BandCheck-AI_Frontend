import { StyleSheet, Text, View } from "react-native";
import { editorial } from "../../theme/editorial";
import type { EditorialFonts } from "../../theme/editorial";

type Tone = "ink" | "forest" | "accent";

type Props = {
  children: string;
  tone?: Tone;
  fonts: EditorialFonts;
};

const toneStyles: Record<Tone, { bg: string; fg: string }> = {
  ink: { bg: "rgba(20,18,13,0.06)", fg: editorial.colors.ink2 },
  forest: { bg: editorial.colors.chipForestBg, fg: editorial.colors.forest },
  accent: { bg: editorial.colors.chipAccentBg, fg: editorial.colors.accent },
};

export function SmallChip({ children, tone = "ink", fonts }: Props) {
  const t = toneStyles[tone];
  return (
    <View style={[styles.chip, { backgroundColor: t.bg }]}>
      <Text style={[styles.text, { color: t.fg, fontFamily: fonts.sansSemiBold }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: editorial.radius.sm,
  },
  text: {
    fontSize: 11,
    letterSpacing: 0.22,
    textTransform: "uppercase",
  },
});
