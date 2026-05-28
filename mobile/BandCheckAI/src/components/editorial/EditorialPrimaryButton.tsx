import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { editorial } from "../../theme/editorial";
import type { EditorialFonts } from "../../theme/editorial";
import { IconArrow } from "./Icons";

type Props = {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  fonts: EditorialFonts;
  style?: ViewStyle;
};

export function EditorialPrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  fonts,
  style,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.shell,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.shellPressed,
        style,
      ]}
    >
      {({ pressed }) => (
        <>
          <View style={[styles.face, pressed && !isDisabled && styles.facePressed]}>
            <View style={styles.highlight} pointerEvents="none" />
            {loading ? (
              <ActivityIndicator color={editorial.colors.paper} />
            ) : (
              <View style={styles.row}>
                <Text style={[styles.label, { fontFamily: fonts.sansSemiBold }]}>{label}</Text>
                <IconArrow size={14} color={editorial.colors.paper} />
              </View>
            )}
          </View>
          <View style={styles.base} pointerEvents="none" />
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: editorial.radius.md,
    shadowColor: editorial.colors.accentDeep,
    shadowOpacity: 0.45,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  shellPressed: {
    shadowOffset: { width: 0, height: 1 },
    transform: [{ translateY: 3 }],
  },
  face: {
    backgroundColor: editorial.colors.accent,
    borderRadius: editorial.radius.md,
    paddingVertical: 17,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.18)",
    overflow: "hidden",
  },
  facePressed: {
    backgroundColor: editorial.colors.accentDeep,
  },
  highlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "42%",
    backgroundColor: "rgba(255, 255, 255, 0.07)",
  },
  base: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -4,
    height: 4,
    backgroundColor: editorial.colors.accentDeep,
    borderBottomLeftRadius: editorial.radius.md,
    borderBottomRightRadius: editorial.radius.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    color: editorial.colors.paper,
    fontSize: 16,
    letterSpacing: -0.075,
  },
  disabled: {
    opacity: 0.5,
  },
});
