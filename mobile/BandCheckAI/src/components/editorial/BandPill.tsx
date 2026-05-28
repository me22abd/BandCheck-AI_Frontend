import { StyleSheet, Text, View } from "react-native";
import { editorial } from "../../theme/editorial";
import type { EditorialFonts } from "../../theme/editorial";

type Tone = "ink" | "forest" | "accent";

type Props = {
  letter: string;
  big?: boolean;
  tone?: Tone;
  fonts: EditorialFonts;
};

export function BandPill({ letter, big = false, tone = "ink", fonts }: Props) {
  const bg =
    tone === "accent"
      ? editorial.colors.accent
      : tone === "forest"
        ? editorial.colors.forest
        : editorial.colors.ink;

  return (
    <View
      style={[
        styles.pill,
        big ? styles.big : styles.small,
        { backgroundColor: bg },
      ]}
    >
      <Text
        style={[
          styles.text,
          big ? styles.textBig : styles.textSmall,
          { fontFamily: fonts.sansBold },
        ]}
      >
        {letter}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: "center",
    justifyContent: "center",
  },
  small: {
    width: 28,
    height: 28,
    borderRadius: 7,
  },
  big: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  text: {
    color: editorial.colors.paper,
    letterSpacing: -0.28,
  },
  textSmall: {
    fontSize: 14,
  },
  textBig: {
    fontSize: 22,
  },
});
