import { StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

type Props = {
  score: number;
  label: string;
  labelColor: string;
};

export function CaseStrengthGauge({ score, label, labelColor }: Props) {
  const pct = Math.max(0, Math.min(100, score)) / 100;

  return (
    <View style={styles.wrap}>
      <View style={styles.ringOuter}>
        <View style={[styles.ringTrack]} />
        <View style={[styles.ringFill, { width: `${pct * 100}%` }]} />
        <View style={styles.center}>
          <Text style={styles.score}>{score}</Text>
          <Text style={styles.denominator}>/100</Text>
        </View>
      </View>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
    </View>
  );
}

const SIZE = 128;

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
  },
  ringOuter: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: theme.colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 7,
    borderColor: theme.colors.border,
  },
  ringTrack: {
    ...StyleSheet.absoluteFill,
  },
  ringFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#BBF7D0",
  },
  center: {
    width: SIZE - 28,
    height: SIZE - 28,
    borderRadius: (SIZE - 28) / 2,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  score: {
    fontSize: 32,
    fontWeight: "700",
    color: theme.colors.greenText,
  },
  denominator: {
    fontSize: 13,
    fontWeight: "500",
    color: theme.colors.green,
    marginTop: -2,
  },
  label: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
  },
});
