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
        BandCheck
      </Text>
      <Text style={[styles.dot, { fontSize: size * 0.92, fontFamily: fonts.sansSemiBold }]}>
        {" · "}
      </Text>
      <Text style={[styles.ai, { fontSize: size, fontFamily: fonts.sansSemiBold }]}>
        AI
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  bandcheck: {
    letterSpacing: -0.45,
    color: editorial.colors.ink,
  },
  dot: {
    color: editorial.colors.accent,
    letterSpacing: 0,
  },
  ai: {
    color: editorial.colors.accent,
    letterSpacing: 0.18,
  },
});
