import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { theme } from "../theme";

type Props = {
  title?: string;
  onBack?: () => void;
};

export function AppHeader({ title, onBack }: Props) {
  return (
    <View style={styles.wrap}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={8} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
      ) : (
        <View style={styles.headerRow}>
          <View style={styles.logoRow}>
            <View style={styles.shield}>
              <Text style={styles.shieldCheck}>✓</Text>
            </View>
            <Text style={styles.logo}>
              <Text style={styles.logoDark}>BandCheck</Text>
              <Text style={styles.logoBlue}> AI</Text>
            </Text>
          </View>
        </View>
      )}
      {title ? <Text style={styles.pageTitle}>{title}</Text> : null}
    </View>
  );
}

export function cardStyle(): ViewStyle {
  return {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    ...theme.shadow.card,
  };
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: theme.spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  shield: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: theme.colors.blueLight,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  shieldCheck: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  logo: {
    fontSize: 16,
  },
  logoDark: {
    fontWeight: "700",
    color: theme.colors.text,
  },
  logoBlue: {
    fontWeight: "600",
    color: theme.colors.primary,
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  backText: {
    fontSize: 15,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  pageTitle: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
});
