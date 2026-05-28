import { StyleSheet, View, type ViewStyle } from "react-native";
import { editorial } from "../../theme/editorial";

type Props = {
  vertical?: boolean;
  style?: ViewStyle;
};

export function Hairline({ vertical = false, style }: Props) {
  return (
    <View
      style={[
        vertical ? styles.vertical : styles.horizontal,
        { backgroundColor: editorial.colors.hairline },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    width: "100%",
  },
  vertical: {
    width: 1,
    alignSelf: "stretch",
  },
});
