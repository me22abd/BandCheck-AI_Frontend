import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import { editorial } from "../../theme/editorial";

type Props = {
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
};

export function IconButton({ onPress, children, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed, style]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 34,
    height: 34,
    borderRadius: editorial.radius.pill,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
    backgroundColor: editorial.colors.paperCard,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
  },
});
