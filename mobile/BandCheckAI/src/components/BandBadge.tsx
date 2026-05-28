import { StyleSheet, Text, View } from "react-native";
import { councilTaxBandIndex } from "../lib/scoring";
import { theme } from "../theme";

type Props = {
  band: string;
  userBand?: string;
  variant?: "default" | "user";
};

export function BandBadge({ band, userBand, variant = "default" }: Props) {
  const style =
    variant === "user"
      ? styles.user
      : userBand
        ? getBandStyle(band, userBand)
        : styles.neutral;

  return (
    <View style={[styles.badge, style]}>
      <Text style={[styles.text, variant === "user" ? styles.userText : getTextStyle(band, userBand)]}>
        {band}
      </Text>
    </View>
  );
}

function getBandStyle(band: string, userBand: string) {
  const d = councilTaxBandIndex(band) - councilTaxBandIndex(userBand);
  if (d < 0) return styles.lower;
  if (d === 0) return styles.same;
  return styles.higher;
}

function getTextStyle(band: string, userBand?: string) {
  if (!userBand) return styles.neutralText;
  const d = councilTaxBandIndex(band) - councilTaxBandIndex(userBand);
  if (d < 0) return styles.lowerText;
  if (d === 0) return styles.sameText;
  return styles.higherText;
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
  user: {
    backgroundColor: theme.colors.grayBadge,
  },
  userText: {
    color: theme.colors.grayBadgeText,
  },
  lower: {
    backgroundColor: theme.colors.greenLight,
  },
  lowerText: {
    color: theme.colors.greenText,
  },
  same: {
    backgroundColor: theme.colors.grayBadge,
  },
  sameText: {
    color: theme.colors.grayBadgeText,
  },
  higher: {
    backgroundColor: theme.colors.redLight,
  },
  higherText: {
    color: theme.colors.redText,
  },
  neutral: {
    backgroundColor: theme.colors.grayBadge,
  },
  neutralText: {
    color: theme.colors.grayBadgeText,
  },
});
