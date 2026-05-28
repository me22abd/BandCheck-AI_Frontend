import { useMemo, useState } from "react";
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
import { EditorialPrimaryButton } from "../components/editorial/EditorialPrimaryButton";
import { IconBack, IconCheck } from "../components/editorial/Icons";
import { IconButton } from "../components/editorial/IconButton";
import { PaperBackground } from "../components/editorial/PaperBackground";
import { SmallChip } from "../components/editorial/SmallChip";
import { TopBar } from "../components/editorial/TopBar";
import { submitLead, type LeadPayload, type SubmitLeadResult } from "../lib/api";
import { formatPostcode } from "../lib/postcode";
import { getAppealSummary } from "../lib/appealEstimates";
import { editorial } from "../theme/editorial";
import type { EditorialFonts } from "../theme/editorial";

type Props = {
  apiBaseUrl: string;
  postcode: string;
  userBand: string;
  nearbyProperties: Array<{ address: string; band: string }>;
  fonts: EditorialFonts;
  onBack: () => void;
  onContinue: (email: string) => void;
};

const PACK_ITEMS = [
  { t: "Comparable evidence table", d: "6 nearby homes · band, sale price, source" },
  { t: "Land Registry citations", d: "Direct links to public records" },
  { t: "Draft appeal letter", d: "Pre-filled · ready to submit to the VOA" },
  { t: "Backdating calculation", d: "Refund estimate since 2019" },
];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function EmailCaptureScreen({
  apiBaseUrl,
  postcode,
  userBand,
  nearbyProperties,
  fonts,
  onBack,
  onContinue,
}: Props) {
  const [email, setEmail] = useState("");
  const [draftAppeal, setDraftAppeal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitLeadResult | null>(null);

  const formatted = useMemo(() => formatPostcode(postcode), [postcode]);
  const canSubmit = isValidEmail(email) && !loading;
  const submitted = submitResult?.ok === true;
  const emailSent = submitResult?.ok === true && submitResult.emailSent;
  const emailSkipped = submitResult?.ok === true && !submitResult.emailSent;
  const failed = submitResult?.ok === false;

  async function onSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    setSubmitResult(null);

    // Compute scoring so the server can build a fully-populated PDF
    const summary = getAppealSummary(userBand, nearbyProperties);

    const payload: LeadPayload = {
      email: email.trim(),
      postcode,
      userBand,
      draftAppeal,
      comparables: nearbyProperties.slice(0, 8),
      likelyBand: summary.likelyBand,
      score: summary.score,
      strength: summary.strength,
      lowerCount: summary.lowerCount,
      totalProperties: summary.totalProperties,
      currentAnnual: summary.currentAnnual,
      reducedAnnual: summary.reducedAnnual,
      annualSaving: summary.annualSaving,
      backdatedRefund: summary.backdatedRefund,
      totalOwed: summary.totalOwed,
    };
    const result = await submitLead(apiBaseUrl, payload);
    setLoading(false);
    setSubmitResult(result);
  }

  function onRetry() {
    setSubmitResult(null);
  }

  return (
    <PaperBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView style={styles.flex} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TopBar
            fonts={fonts}
            left={
              <IconButton onPress={onBack}>
                <IconBack color={editorial.colors.ink} />
              </IconButton>
            }
            title="Evidence pack"
          />

          {!submitted && !failed ? (
            <>
              <View style={styles.intro}>
                <SmallChip tone="accent" fonts={fonts}>
                  Step 1 of 2
                </SmallChip>
                <Text style={[styles.headline, { fontFamily: fonts.serif }]}>
                  Where shall we send your{" "}
                  <Text style={[styles.headlineEm, { fontFamily: fonts.serifItalic }]}>
                    evidence pack
                  </Text>
                  ?
                </Text>
                <Text style={[styles.introSub, { fontFamily: fonts.sans }]}>
                  A PDF with the 6 comparables, Land Registry citations, and the appeal
                  letter — drafted and ready to submit.
                </Text>
              </View>

              <View style={styles.formWrap}>
                <View style={styles.formCard}>
                  <Text style={[styles.fieldLabel, { fontFamily: fonts.sansSemiBold }]}>
                    Email address
                  </Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder="amelia.holt@gmail.com"
                    placeholderTextColor={editorial.colors.ink3}
                    style={[styles.input, { fontFamily: fonts.mono }]}
                    returnKeyType="done"
                    onSubmitEditing={onSubmit}
                  />
                  <Pressable
                    onPress={() => setDraftAppeal((v) => !v)}
                    style={styles.checkboxRow}
                  >
                    <View style={[styles.checkbox, draftAppeal && styles.checkboxOn]}>
                      {draftAppeal ? (
                        <IconCheck size={11} color={editorial.colors.paper} />
                      ) : null}
                    </View>
                    <Text style={[styles.checkboxLabel, { fontFamily: fonts.sans }]}>
                      Yes — also draft my appeal automatically. I'll review before submission.
                    </Text>
                  </Pressable>
                  <EditorialPrimaryButton
                    label="Send pack"
                    loading={loading}
                    disabled={!isValidEmail(email)}
                    onPress={onSubmit}
                    fonts={fonts}
                    style={styles.cta}
                  />
                </View>
              </View>
            </>
          ) : null}

          {emailSent ? (
            <View style={styles.sentWrap}>
              <View style={styles.sentCard}>
                <View style={styles.sentGlow} pointerEvents="none" />
                <View style={styles.sentHeader}>
                  <View style={styles.sentIcon}>
                    <IconCheck size={14} color={editorial.colors.paper} />
                  </View>
                  <View style={styles.sentText}>
                    <Text style={[styles.sentTitle, { fontFamily: fonts.serif }]}>
                      Sent to your inbox
                    </Text>
                    <Text style={[styles.sentEmail, { fontFamily: fonts.mono }]}>
                      {email.trim()} · just now
                    </Text>
                  </View>
                </View>
                <View style={styles.sentQuote}>
                  <Text style={[styles.sentQuoteText, { fontFamily: fonts.serifItalic }]}>
                    "Your BandCheck evidence pack — {formatted}"
                  </Text>
                </View>
              </View>
              <EditorialPrimaryButton
                label="Continue to Appeal Builder"
                onPress={() => onContinue(email.trim())}
                fonts={fonts}
                style={styles.continueBtn}
              />
            </View>
          ) : null}

          {emailSkipped ? (
            <View style={styles.sentWrap}>
              <View style={styles.sentCard}>
                <View style={styles.sentGlow} pointerEvents="none" />
                <View style={styles.sentHeader}>
                  <View style={styles.sentIcon}>
                    <IconCheck size={14} color={editorial.colors.paper} />
                  </View>
                  <View style={styles.sentText}>
                    <Text style={[styles.sentTitle, { fontFamily: fonts.serif }]}>
                      Details saved
                    </Text>
                    <Text style={[styles.sentEmail, { fontFamily: fonts.mono }]}>
                      {email.trim()}
                    </Text>
                  </View>
                </View>
                <View style={styles.sentQuote}>
                  <Text style={[styles.sentQuoteText, { fontFamily: fonts.serifItalic }]}>
                    Email service is being set up — we'll send your pack shortly.
                  </Text>
                </View>
              </View>
              <EditorialPrimaryButton
                label="Continue to Appeal Builder"
                onPress={() => onContinue(email.trim())}
                fonts={fonts}
                style={styles.continueBtn}
              />
            </View>
          ) : null}

          {failed && submitResult ? (
            <View style={styles.sentWrap}>
              <View style={styles.errorCard}>
                <Text style={[styles.errorTitle, { fontFamily: fonts.serif }]}>
                  Couldn't connect
                </Text>
                <Text style={[styles.errorMessage, { fontFamily: fonts.sans }]}>
                  {submitResult.error}
                </Text>
                <Text style={[styles.errorHint, { fontFamily: fonts.sans }]}>
                  Check your connection and try again, or continue to build your appeal now.
                </Text>
              </View>
              <EditorialPrimaryButton
                label="Try again"
                onPress={onRetry}
                fonts={fonts}
                style={styles.continueBtn}
              />
              <Pressable
                onPress={() => onContinue(email.trim())}
                style={styles.skipLink}
              >
                <Text style={[styles.skipLinkText, { fontFamily: fonts.sans }]}>
                  Continue without sending →
                </Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.packSection}>
            <Text style={[styles.packTitle, { fontFamily: fonts.serif }]}>
              What's in your pack
            </Text>
            {PACK_ITEMS.map((item, i) => (
              <View key={item.t} style={[styles.packRow, i > 0 && styles.packRowBorder]}>
                <View style={styles.packCheck}>
                  <IconCheck size={12} color={editorial.colors.forest} />
                </View>
                <View style={styles.packBody}>
                  <Text style={[styles.packItemTitle, { fontFamily: fonts.sans }]}>
                    {item.t}
                  </Text>
                  <Text style={[styles.packItemSub, { fontFamily: fonts.sans }]}>{item.d}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    paddingBottom: 40,
  },
  intro: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  headline: {
    marginTop: 12,
    fontSize: 36,
    lineHeight: 37,
    letterSpacing: -0.72,
    color: editorial.colors.ink,
  },
  headlineEm: {
    color: editorial.colors.accent,
  },
  introSub: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: editorial.colors.ink2,
  },
  formWrap: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  formCard: {
    backgroundColor: editorial.colors.paperCard,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
    shadowColor: "#14120D",
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  fieldLabel: {
    fontSize: 11,
    color: editorial.colors.ink3,
    letterSpacing: 0.88,
    textTransform: "uppercase",
    marginBottom: 6,
    paddingLeft: 4,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: editorial.radius.md,
    backgroundColor: editorial.colors.inputBg,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
    fontSize: 14,
    color: editorial.colors.ink,
    letterSpacing: 0.14,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 14,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxOn: {
    backgroundColor: editorial.colors.accent,
    borderColor: editorial.colors.accent,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16.8,
    color: editorial.colors.ink2,
  },
  cta: {
    marginTop: 14,
    width: "100%",
  },
  sentWrap: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sentCard: {
    backgroundColor: editorial.colors.ink,
    borderRadius: 16,
    padding: 16,
    overflow: "hidden",
    position: "relative",
  },
  sentGlow: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(15, 92, 62, 0.4)",
  },
  sentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    zIndex: 1,
  },
  sentIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: editorial.colors.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  sentText: {
    flex: 1,
  },
  sentTitle: {
    fontSize: 18,
    lineHeight: 21.6,
    color: editorial.colors.paper,
  },
  sentEmail: {
    fontSize: 11,
    color: editorial.colors.paperMuted,
    marginTop: 2,
  },
  sentQuote: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(244, 239, 229, 0.06)",
    borderRadius: 10,
    zIndex: 1,
  },
  sentQuoteText: {
    fontSize: 14,
    color: "rgba(244, 239, 229, 0.8)",
  },
  continueBtn: {
    marginTop: 16,
    width: "100%",
  },
  errorCard: {
    backgroundColor: editorial.colors.paperCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(200, 67, 28, 0.35)",
  },
  errorTitle: {
    fontSize: 20,
    color: editorial.colors.accent,
  },
  errorMessage: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: editorial.colors.ink,
  },
  errorHint: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: editorial.colors.ink2,
  },
  skipLink: {
    marginTop: 14,
    paddingVertical: 8,
    alignItems: "center",
  },
  skipLinkText: {
    fontSize: 14,
    color: editorial.colors.ink2,
    textDecorationLine: "underline",
  },
  packSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  packTitle: {
    fontSize: 22,
    letterSpacing: -0.22,
    color: editorial.colors.ink,
  },
  packRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
  },
  packRowBorder: {
    borderTopWidth: 1,
    borderTopColor: editorial.colors.hairline,
  },
  packCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: editorial.colors.chipForestBg,
    alignItems: "center",
    justifyContent: "center",
  },
  packBody: {
    flex: 1,
  },
  packItemTitle: {
    fontSize: 13.5,
    fontWeight: "500",
    color: editorial.colors.ink,
  },
  packItemSub: {
    fontSize: 12,
    color: editorial.colors.ink3,
    marginTop: 1,
  },
});
