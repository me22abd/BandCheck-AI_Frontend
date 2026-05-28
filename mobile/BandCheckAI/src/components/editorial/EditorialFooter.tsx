import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { editorial } from "../../theme/editorial";

type Props = {
  children: ReactNode;
  row?: boolean;
};

export function EditorialFooter({ children, row }: Props) {
  return (
    <View style={styles.footer}>
      <View style={[styles.inner, row && styles.innerRow]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 16,
    backgroundColor: editorial.colors.paper,
    borderTopWidth: 1,
    borderTopColor: "rgba(20, 18, 13, 0.04)",
  },
  inner: {
    gap: 10,
  },
  innerRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
});
