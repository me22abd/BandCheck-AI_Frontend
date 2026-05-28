import { StyleSheet, Text, View } from "react-native";
import { editorial } from "../../theme/editorial";
import type { EditorialFonts } from "../../theme/editorial";

const BANDS = ["A", "B", "C", "D", "E", "F", "G", "H"];

/** Max comparable dots shown per row before we truncate with a count chip. */
const MAX_DOTS = 10;

type Props = {
  userBand: string;
  propertyBands: string[];
  fonts: EditorialFonts;
};

function normalizeBand(band: string): string {
  return band.toUpperCase().replace(/[^A-H]/g, "").charAt(0) || "D";
}

/** Evenly spread N dots across the track (0–1 range, with padding). */
function spreadDots(count: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [0.5];
  return Array.from({ length: count }, (_, i) => 0.12 + (i / (count - 1)) * 0.76);
}

export function BandLadder({ userBand, propertyBands, fonts }: Props) {
  const user = normalizeBand(userBand);
  const grouped: Record<string, number> = {};
  for (const band of propertyBands) {
    const b = normalizeBand(band);
    grouped[b] = (grouped[b] ?? 0) + 1;
  }

  return (
    <View style={styles.card}>
      {BANDS.map((band) => {
        const isYou = band === user;
        const totalComps = grouped[band] ?? 0;

        // How many comparable dots to render (excluding the user dot)
        const visibleComps = Math.min(totalComps, MAX_DOTS);
        const overflow = totalComps - visibleComps;
        const compDots = spreadDots(visibleComps);

        return (
          <View key={band} style={[styles.row, isYou && styles.rowYou]}>
            {/* Band letter */}
            <Text
              style={[
                styles.bandLabel,
                { fontFamily: fonts.sansBold },
                isYou && styles.bandLabelYou,
              ]}
            >
              {band}
            </Text>

            {/* Dot track */}
            <View style={[styles.track, isYou && styles.trackYou]}>
              <View style={styles.line} />

              {/* Comparable property dots */}
              {compDots.map((x, i) => (
                <View
                  key={`${band}-comp-${i}`}
                  style={[
                    styles.dot,
                    { left: `${x * 100}%` as unknown as number },
                  ]}
                />
              ))}

              {/* Overflow count chip */}
              {overflow > 0 && (
                <View style={styles.overflowChip}>
                  <Text style={[styles.overflowText, { fontFamily: fonts.sansBold }]}>
                    +{overflow}
                  </Text>
                </View>
              )}

              {/* User dot — always centred, drawn on top */}
              {isYou && (
                <View style={styles.userDotRing}>
                  <View style={styles.userDot} />
                </View>
              )}
            </View>

            {/* "you are here" label — separate column, never overlaps dots */}
            <View style={styles.hereLabelCol}>
              {isYou ? (
                <Text
                  style={[styles.hereLabel, { fontFamily: fonts.serifItalic }]}
                  numberOfLines={1}
                >
                  you are here
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: editorial.colors.paperCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  rowYou: {
    marginBottom: 6,
    marginTop: 2,
  },
  bandLabel: {
    width: 18,
    fontSize: 12,
    textAlign: "center",
    color: editorial.colors.ink3,
  },
  bandLabelYou: {
    color: editorial.colors.accent,
    fontSize: 14,
  },
  track: {
    flex: 1,
    height: 28,
    position: "relative",
    borderRadius: 6,
    justifyContent: "center",
  },
  trackYou: {
    backgroundColor: "rgba(200, 67, 28, 0.07)",
  },
  line: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 13,
    height: 1,
    backgroundColor: editorial.colors.hairline,
  },
  dot: {
    position: "absolute",
    top: 9,
    width: 9,
    height: 9,
    borderRadius: 5,
    marginLeft: -4.5,
    backgroundColor: editorial.colors.forest,
    borderWidth: 1.5,
    borderColor: editorial.colors.paperCard,
  },
  overflowChip: {
    position: "absolute",
    right: 4,
    top: 7,
    backgroundColor: editorial.colors.hairline,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  overflowText: {
    fontSize: 9,
    color: editorial.colors.ink3,
  },
  userDotRing: {
    position: "absolute",
    left: "50%" as unknown as number,
    top: 5,
    width: 18,
    height: 18,
    marginLeft: -9,
    borderRadius: 9,
    backgroundColor: "rgba(200, 67, 28, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  userDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: editorial.colors.accent,
    borderWidth: 2,
    borderColor: editorial.colors.paperCard,
    shadowColor: editorial.colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  hereLabelCol: {
    width: 82,
    alignItems: "flex-end",
  },
  hereLabel: {
    fontSize: 11,
    color: editorial.colors.accent,
  },
});
