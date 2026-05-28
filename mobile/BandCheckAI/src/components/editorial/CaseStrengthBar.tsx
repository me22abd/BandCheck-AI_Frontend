import { StyleSheet, Text, View } from "react-native";
import { editorial } from "../../theme/editorial";
import type { EditorialFonts } from "../../theme/editorial";

type Props = {
  score: number;
  strength: string;
  fonts: EditorialFonts;
};

export function CaseStrengthBar({ score, strength, fonts }: Props) {
  const pct = Math.max(0.08, Math.min(0.92, score / 100));

  return (
    <View>
      <View style={styles.header}>
        <Text style={[styles.title, { fontFamily: fonts.serif }]}>Case strength</Text>
        <Text style={[styles.strength, { fontFamily: fonts.serifItalic }]}>{strength}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%` }]} />
        <View style={[styles.thumb, { left: `${pct * 100}%` }]} />
      </View>
      <View style={styles.labels}>
        <Text style={[styles.label, { fontFamily: fonts.sans }]}>weak</Text>
        <Text style={[styles.label, { fontFamily: fonts.sans }]}>moderate</Text>
        <Text style={[styles.label, { fontFamily: fonts.sans }]}>strong</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    letterSpacing: -0.22,
    color: editorial.colors.ink,
  },
  strength: {
    fontSize: 15,
    color: editorial.colors.forest,
  },
  track: {
    height: 8,
    backgroundColor: "rgba(20, 18, 13, 0.06)",
    borderRadius: 4,
    position: "relative",
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: editorial.colors.forest,
    borderRadius: 4,
  },
  thumb: {
    position: "absolute",
    top: -3,
    width: 14,
    height: 14,
    marginLeft: -7,
    borderRadius: 7,
    backgroundColor: editorial.colors.paper,
    borderWidth: 2,
    borderColor: editorial.colors.forest,
    shadowColor: "#14120D",
    shadowOpacity: 0.18,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  label: {
    fontSize: 10.5,
    letterSpacing: 0.42,
    color: editorial.colors.ink3,
  },
});
