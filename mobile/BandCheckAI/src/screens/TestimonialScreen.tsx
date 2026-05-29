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
import { editorial } from "../theme/editorial";
import type { EditorialFonts } from "../theme/editorial";

export type TestimonialData = {
  firstName: string;
  area: string;
  feedback: string;
};

type Props = {
  postcode: string;
  refundAmount?: number;
  fonts: EditorialFonts;
  apiBaseUrl: string;
  onBack: () => void;
  onSubmit: (data: TestimonialData) => void;
  onSkip: () => void;
};

export function TestimonialScreen({ postcode, refundAmount, fonts, apiBaseUrl, onBack, onSubmit, onSkip }: Props) {
  const [firstName, setFirstName] = useState("");
  const [area, setArea] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = firstName.trim().length > 0 && feedback.trim().length > 10;

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await fetch(`${apiBaseUrl}/api/testimonial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postcode,
          first_name: firstName.trim(),
          area: area.trim(),
          feedback: feedback.trim(),
          refund_amount: refundAmount ?? null,
        }),
      });
    } catch {
      // Fail silently — testimonial is optional
    }
    setLoading(false);
    onSubmit({ firstName: firstName.trim(), area: area.trim(), feedback: feedback.trim() });
  }

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
          title="Share your story"
        />
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.intro}>
            <SmallChip tone="forest" fonts={fonts}>Completely optional</SmallChip>
            <Text style={[styles.headline, { fontFamily: fonts.serif }]}>
              Help others take action
            </Text>
            <Text style={[styles.sub, { fontFamily: fonts.sans }]}>
              Your experience could encourage someone else to check their band. Your details will only be used as anonymous social proof — never sold or shared.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldRow}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={[styles.fieldLabel, { fontFamily: fonts.sansSemiBold }]}>First name</Text>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="e.g. Sarah"
                  placeholderTextColor={editorial.colors.ink3}
                  style={[styles.input, { fontFamily: fonts.sans }]}
                  autoCapitalize="words"
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={[styles.fieldLabel, { fontFamily: fonts.sansSemiBold }]}>Area</Text>
                <TextInput
                  value={area}
                  onChangeText={setArea}
                  placeholder="e.g. Bristol"
                  placeholderTextColor={editorial.colors.ink3}
                  style={[styles.input, { fontFamily: fonts.sans }]}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { fontFamily: fonts.sansSemiBold }]}>
                Your experience
              </Text>
              <TextInput
                value={feedback}
                onChangeText={setFeedback}
                placeholder="e.g. I couldn't believe I'd been overpaying for 5 years. The process was easier than I expected..."
                placeholderTextColor={editorial.colors.ink3}
                style={[styles.input, styles.inputMulti, { fontFamily: fonts.sans }]}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={280}
              />
              <Text style={[styles.charCount, { fontFamily: fonts.mono }]}>
                {feedback.length}/280
              </Text>
            </View>
          </View>

          <View style={styles.preview}>
            {firstName.trim() && feedback.trim().length > 10 ? (
              <View style={styles.previewCard}>
                <Text style={[styles.previewQuote, { fontFamily: fonts.serifItalic }]}>
                  "{feedback.trim()}"
                </Text>
                <Text style={[styles.previewAttrib, { fontFamily: fonts.sans }]}>
                  — {firstName.trim()}{area.trim() ? `, ${area.trim()}` : ""}
                  {refundAmount ? `  ·  £${refundAmount.toLocaleString()} refund` : ""}
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>

        <EditorialFooter>
          <EditorialPrimaryButton
            label="Submit story"
            onPress={handleSubmit}
            loading={loading}
            disabled={!canSubmit}
            fonts={fonts}
            style={styles.footerBtn}
          />
          <Pressable style={styles.skipBtn} onPress={onSkip}>
            <Text style={[styles.skipText, { fontFamily: fonts.sans }]}>
              Skip for now →
            </Text>
          </Pressable>
        </EditorialFooter>
      </KeyboardAvoidingView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: 140 },
  intro: { paddingHorizontal: 24, paddingTop: 20, gap: 10 },
  headline: { fontSize: 30, lineHeight: 34, letterSpacing: -0.6, color: editorial.colors.ink },
  sub: { fontSize: 13, lineHeight: 19, color: editorial.colors.ink2 },
  form: { paddingHorizontal: 16, paddingTop: 24, gap: 14 },
  fieldRow: { flexDirection: "row", gap: 12 },
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
    fontSize: 14,
    color: editorial.colors.ink,
  },
  inputMulti: { minHeight: 100, paddingTop: 12 },
  charCount: { fontSize: 10, color: editorial.colors.ink3, textAlign: "right", marginTop: 4 },
  preview: { paddingHorizontal: 16, paddingTop: 16 },
  previewCard: {
    backgroundColor: editorial.colors.ink,
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  previewQuote: { fontSize: 15, lineHeight: 22, color: editorial.colors.paper },
  previewAttrib: { fontSize: 12, color: "rgba(244,239,229,0.55)" },
  footerBtn: { width: "100%" },
  skipBtn: { paddingVertical: 10, alignItems: "center" },
  skipText: { fontSize: 14, color: editorial.colors.ink2, textDecorationLine: "underline" },
});
