import { Pressable, StyleSheet, Text, type ViewStyle } from "react-native";
import { editorial } from "../../theme/editorial";
import type { EditorialFonts } from "../../theme/editorial";

type Props = {
  label: string;
  onPress?: () => void;
  fonts: EditorialFonts;
  style?: ViewStyle;
};

export function EditorialSecondaryButton({ label, onPress, fonts, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed, style]}
    >
      <Text style={[styles.label, { fontFamily: fonts.sansSemiBold }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: editorial.colors.paperCard,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
    borderRadius: editorial.radius.md,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.88,
  },
  label: {
    fontSize: 15,
    color: editorial.colors.ink,
    letterSpacing: -0.075,
  },
});
