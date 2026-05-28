import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { editorial } from "../../theme/editorial";
import type { EditorialFonts } from "../../theme/editorial";

type Props = {
  left?: ReactNode;
  right?: ReactNode;
  title?: string;
  fonts: EditorialFonts;
};

export function TopBar({ left, right, title, fonts }: Props) {
  return (
    <View style={styles.bar}>
      <View style={styles.side}>{left}</View>
      {title ? (
        <Text style={[styles.title, { fontFamily: fonts.sansSemiBold }]} numberOfLines={1}>
          {title}
        </Text>
      ) : null}
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    minHeight: 44,
  },
  side: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 34,
  },
  right: {
    justifyContent: "flex-end",
  },
  title: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 15,
    letterSpacing: -0.15,
    color: editorial.colors.ink,
    pointerEvents: "none",
  },
});
