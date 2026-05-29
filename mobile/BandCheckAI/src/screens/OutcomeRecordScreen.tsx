import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { EditorialFooter } from "../components/editorial/EditorialFooter";
import { EditorialPrimaryButton } from "../components/editorial/EditorialPrimaryButton";
import { IconBack } from "../components/editorial/Icons";
import { IconButton } from "../components/editorial/IconButton";
import { PaperBackground } from "../components/editorial/PaperBackground";
import { SmallChip } from "../components/editorial/SmallChip";
import { TopBar } from "../components/editorial/TopBar";
import type { CaseStatus, SavedCase } from "../lib/casesStore";
import { formatPostcode } from "../lib/postcode";
import { editorial } from "../theme/editorial";
import type { EditorialFonts } from "../theme/editorial";

type OutcomeOption = {
  status: CaseStatus;
  label: string;
  emoji: string;
  description: string;
  tone: "forest" | "accent" | "muted" | "blue";
};

const OUTCOME_OPTIONS: OutcomeOption[] = [
  {
    status: "under_review",
    label: "Under review",
    emoji: "⏳",
    description: "The VOA has acknowledged your appeal and is reviewing it.",
    tone: "blue",
  },
  {
    status: "successful",
    label: "Successful",
    emoji: "🏆",
    description: "Your band has been reduced. You may be owed a refund.",
    tone: "forest",
  },
  {
    status: "unsuccessful",
    label: "Unsuccessful",
    emoji: "📋",
    description: "The VOA decided not to change your band.",
    tone: "muted",
  },
];

type Props = {
  savedCase: SavedCase;
  fonts: EditorialFonts;
  onBack: () => void;
  onSave: (status: CaseStatus, refund?: number, annualReduction?: number) => void;
};

export function OutcomeRecordScreen({ savedCase, fonts, onBack, onSave }: Props) {
  const [selected, setSelected] = useState<CaseStatus | null>(null);
  const [refundInput, setRefundInput] = useState("");
  const [annualInput, setAnnualInput] = useState("");

  const showRefundFields = selected === "successful";
  const canSave = selected !== null;

  function handleSave() {
    if (!selected) return;
    const refund = refundInput ? parseFloat(refundInput.replace(/[^0-9.]/g, "")) : undefined;
    const annual = annualInput ? parseFloat(annualInput.replace(/[^0-9.]/g, "")) : undefined;
    onSave(selected, refund, annual);
  }

  const toneColors: Record<string, string> = {
    forest: editorial.colors.forest,
    accent: editorial.colors.accent,
    muted: editorial.colors.ink3,
    blue: "#2563EB",
  };

  return (
    <PaperBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TopBar
          fonts={fonts}
          left={
            <IconButton onPress={onBack}>
              <IconBack color={editorial.colors.ink} />
            </IconButton>
          }
          title="Record outcome"
        />
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.intro}>
            <SmallChip tone="accent" fonts={fonts}>
              {formatPostcode(savedCase.postcode)}
            </SmallChip>
            <Text style={[styles.headline, { fontFamily: fonts.serif }]}>
              What's the latest on your appeal?
            </Text>
            <Text style={[styles.sub, { fontFamily: fonts.sans }]}>
              Select the current status. You can update this at any time.
            </Text>
          </View>

          <View style={styles.options}>
            {OUTCOME_OPTIONS.map((opt) => {
              const active = selected === opt.status;
              const color = toneColors[opt.tone];
              return (
                <Pressable
                  key={opt.status}
                  style={[styles.optionCard, active && { borderColor: color, borderWidth: 2 }]}
                  onPress={() => setSelected(opt.status)}
                >
                  <View style={styles.optionTop}>
                    <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                    <View style={styles.optionText}>
                      <Text style={[styles.optionLabel, { fontFamily: fonts.sansSemiBold, color: active ? color : editorial.colors.ink }]}>
                        {opt.label}
                      </Text>
                      <Text style={[styles.optionDesc, { fontFamily: fonts.sans }]}>
                        {opt.description}
                      </Text>
                    </View>
                    <View style={[styles.radio, active && { backgroundColor: color, borderColor: color }]}>
                      {active ? <View style={styles.radioDot} /> : null}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {showRefundFields ? (
            <View style={styles.refundSection}>
              <Text style={[styles.refundTitle, { fontFamily: fonts.serif }]}>
                How much did you receive?
              </Text>
              <Text style={[styles.refundSub, { fontFamily: fonts.sans }]}>
                Optional — helps us build accurate refund data.
              </Text>
              <View style={styles.fieldGroup}>
                <View style={styles.field}>
                  <Text style={[styles.fieldLabel, { fontFamily: fonts.sansSemiBold }]}>
                    Refund received (£)
                  </Text>
                  <TextInput
                    value={refundInput}
                    onChangeText={setRefundInput}
                    keyboardType="decimal-pad"
                    placeholder="e.g. 1240"
                    placeholderTextColor={editorial.colors.ink3}
                    style={[styles.input, { fontFamily: fonts.mono }]}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={[styles.fieldLabel, { fontFamily: fonts.sansSemiBold }]}>
                    Annual reduction (£)
                  </Text>
                  <TextInput
                    value={annualInput}
                    onChangeText={setAnnualInput}
                    keyboardType="decimal-pad"
                    placeholder="e.g. 320"
                    placeholderTextColor={editorial.colors.ink3}
                    style={[styles.input, { fontFamily: fonts.mono }]}
                  />
                </View>
              </View>
            </View>
          ) : null}
        </ScrollView>

        <EditorialFooter>
          <EditorialPrimaryButton
            label="Save outcome"
            onPress={handleSave}
            disabled={!canSave}
            fonts={fonts}
            style={styles.footerBtn}
          />
        </EditorialFooter>
      </KeyboardAvoidingView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: 120 },
  intro: { paddingHorizontal: 24, paddingTop: 20, gap: 10 },
  headline: { fontSize: 30, lineHeight: 34, letterSpacing: -0.6, color: editorial.colors.ink },
  sub: { fontSize: 14, lineHeight: 20, color: editorial.colors.ink2 },
  options: { paddingHorizontal: 16, paddingTop: 24, gap: 10 },
  optionCard: {
    backgroundColor: editorial.colors.paperCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
    padding: 16,
  },
  optionTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  optionEmoji: { fontSize: 28 },
  optionText: { flex: 1 },
  optionLabel: { fontSize: 16, marginBottom: 2 },
  optionDesc: { fontSize: 12, lineHeight: 17, color: editorial.colors.ink3 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: editorial.colors.hairline,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: editorial.colors.paper },
  refundSection: { paddingHorizontal: 24, paddingTop: 28 },
  refundTitle: { fontSize: 22, letterSpacing: -0.22, color: editorial.colors.ink, marginBottom: 4 },
  refundSub: { fontSize: 13, color: editorial.colors.ink3, marginBottom: 16 },
  fieldGroup: { gap: 12 },
  field: { gap: 6 },
  fieldLabel: {
    fontSize: 11,
    color: editorial.colors.ink3,
    letterSpacing: 0.88,
    textTransform: "uppercase",
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: editorial.colors.inputBg,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
    fontSize: 15,
    color: editorial.colors.ink,
  },
  footerBtn: { width: "100%" },
});
