import { StyleSheet, Text, View } from "react-native";
import { IconCheck } from "./Icons";
import { editorial } from "../../theme/editorial";
import type { EditorialFonts } from "../../theme/editorial";

const STEPS = ["Details", "Evidence", "Review", "Submit"];

type Props = {
  currentStep: number;
  fonts: EditorialFonts;
};

export function AppealStepper({ currentStep, fonts }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.bars}>
        {STEPS.map((_, i) => (
          <View
            key={STEPS[i]}
            style={[styles.bar, i <= currentStep - 1 && styles.barActive]}
          />
        ))}
      </View>
      <View style={styles.labels}>
        {STEPS.map((label, i) => {
          const done = i < currentStep - 1;
          const current = i === currentStep - 1;
          const active = i <= currentStep - 1;
          return (
            <View key={label} style={styles.step}>
              <View style={[styles.dot, active && styles.dotActive, !active && styles.dotFuture]}>
                {done ? (
                  <IconCheck size={9} color={editorial.colors.paper} />
                ) : (
                  <Text
                    style={[
                      styles.dotNum,
                      { fontFamily: fonts.sansBold, color: active ? editorial.colors.paper : editorial.colors.ink3 },
                    ]}
                  >
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  { fontFamily: current ? fonts.sansBold : fonts.sans },
                  current && styles.stepLabelCurrent,
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  bars: {
    flexDirection: "row",
    gap: 6,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(20, 18, 13, 0.10)",
  },
  barActive: {
    backgroundColor: editorial.colors.accent,
  },
  labels: {
    flexDirection: "row",
    marginTop: 8,
  },
  step: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingRight: 4,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  dotActive: {
    backgroundColor: editorial.colors.accent,
  },
  dotFuture: {
    borderWidth: 1,
    borderColor: editorial.colors.ink3,
  },
  dotNum: {
    fontSize: 9,
    color: editorial.colors.ink3,
  },
  stepLabel: {
    fontSize: 10.5,
    color: editorial.colors.ink3,
    flexShrink: 1,
  },
  stepLabelCurrent: {
    color: editorial.colors.ink,
  },
});
