import { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { editorial } from "../../theme/editorial";

type Props = {
  children: ReactNode;
  style?: ViewStyle;
};

export function PaperBackground({ children, style }: Props) {
  return (
    <View style={[styles.root, style]}>
      <View style={styles.glowTop} pointerEvents="none" />
      <View style={styles.glowBottom} pointerEvents="none" />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: editorial.colors.paper,
  },
  glowTop: {
    position: "absolute",
    top: -80,
    left: -40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(217, 97, 59, 0.04)",
  },
  glowBottom: {
    position: "absolute",
    bottom: -100,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(15, 92, 62, 0.03)",
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});
