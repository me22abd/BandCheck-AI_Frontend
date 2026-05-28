import { StyleSheet, Text, View } from "react-native";
import { editorial } from "../../theme/editorial";
import type { EditorialFonts } from "../../theme/editorial";

type Props = {
  fonts: EditorialFonts;
  size?: number;
};

export function Wordmark({ fonts, size = 18 }: Props) {
  return (
    <View style={styles.row}>
      <Text style={[styles.bandcheck, { fontSize: size, fontFamily: fonts.sansSemiBold }]}>
        Bandcheck
      </Text>
      <Text
        style={[
          styles.ai,
          { fontSize: size * 0.92, fontFamily: fonts.serifItalic },
        ]}
      >
        ai
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  bandcheck: {
    letterSpacing: -0.45,
    color: editorial.colors.ink,
  },
  ai: {
    color: editorial.colors.accent,
    letterSpacing: 0.18,
  },
});
