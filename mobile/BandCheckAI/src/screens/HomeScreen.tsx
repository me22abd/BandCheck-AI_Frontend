import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { BandPill } from "../components/editorial/BandPill";
import { EditorialPrimaryButton } from "../components/editorial/EditorialPrimaryButton";
import { IconButton } from "../components/editorial/IconButton";
import { IconCheck, IconSettings } from "../components/editorial/Icons";
import { PaperBackground } from "../components/editorial/PaperBackground";
import { SmallChip } from "../components/editorial/SmallChip";
import { TopBar } from "../components/editorial/TopBar";
import { Wordmark } from "../components/editorial/Wordmark";
import { checkPostcode, type CheckResponse } from "../lib/api";
import { normalizePostcode } from "../lib/postcode";
import { editorial } from "../theme/editorial";
import type { EditorialFonts } from "../theme/editorial";

type Props = {
  apiBaseUrl: string;
  fonts: EditorialFonts;
  onResult: (data: CheckResponse) => void;
};

const HOW_IT_WORKS = [
  {
    n: "01",
    t: "Analyse your area",
    d: "We look at council tax band patterns for postcodes near yours to estimate your likely band.",
  },
  {
    n: "02",
    t: "Compare the data",
    d: "We check whether nearby properties appear to be in lower bands, giving you grounds to investigate.",
  },
  {
    n: "03",
    t: "Build the case",
    d: "If there's a potential case, we draft an appeal pack for you to review and verify before submitting.",
  },
];

const STATS = [
  { v: "£3,124", l: "avg. refund" },
  { v: "2.4M", l: "UK homes likely overpaying" },
  { v: "89%", l: "success rate" },
];

export function HomeScreen({ apiBaseUrl, fonts, onResult }: Props) {
  const [postcode, setPostcode] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const compact = useMemo(() => normalizePostcode(postcode), [postcode]);
  const canSubmit = compact.length >= 5 && !loading;

  async function onCheck() {
    if (!canSubmit) return;
    if (!apiBaseUrl) {
      Alert.alert(
        "API not configured",
        "Set EXPO_PUBLIC_API_BASE_URL in .env to https://www.bandcheckai.co.uk",
      );
      return;
    }

    setLoading(true);
    try {
      const data = await checkPostcode(
        apiBaseUrl,
        compact,
        houseNumber.trim() || undefined,
      );
      onResult(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      Alert.alert("Couldn't run check", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PaperBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TopBar
            fonts={fonts}
            left={<Wordmark fonts={fonts} />}
            right={
              <IconButton>
                <IconSettings color={editorial.colors.ink} />
              </IconButton>
            }
          />

          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.chipWrap}>
              <SmallChip tone="accent" fonts={fonts}>
                UK Council Tax · Beta
              </SmallChip>
            </View>
            <Text style={[styles.headline, { fontFamily: fonts.serif }]}>
              You might be in the{" "}
              <Text style={[styles.headlineEm, { fontFamily: fonts.serifItalic }]}>
                wrong
              </Text>{" "}
              council tax band.
            </Text>
            <Text style={[styles.heroSub, { fontFamily: fonts.sans }]}>
              1 in 3 UK homes are. Enter your postcode and we'll analyse area
              band data to see if your property may be worth a closer look.
            </Text>
          </View>

          {/* Postcode card */}
          <View style={styles.postcodeWrap}>
            <View style={[styles.postcodeCard, styles.postcodeCardShadow]}>
              <Text style={[styles.fieldLabel, { fontFamily: fonts.sansSemiBold }]}>
                Your postcode
              </Text>
              <View style={styles.inputRow}>
                <TextInput
                  value={postcode}
                  onChangeText={setPostcode}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  placeholder="SW11 4NX"
                  placeholderTextColor={editorial.colors.ink3}
                  returnKeyType="next"
                  onSubmitEditing={onCheck}
                  style={[styles.input, { fontFamily: fonts.monoMedium }]}
                />
                <BandPill letter="?" fonts={fonts} />
              </View>

              <Text style={[styles.fieldLabel, { fontFamily: fonts.sansSemiBold, marginTop: 12 }]}>
                House number{" "}
                <Text style={[styles.fieldLabelOpt, { fontFamily: fonts.sans }]}>(optional — for exact band)</Text>
              </Text>
              <View style={styles.houseRow}>
                <TextInput
                  value={houseNumber}
                  onChangeText={setHouseNumber}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="e.g. 14 or Flat 2"
                  placeholderTextColor={editorial.colors.ink3}
                  returnKeyType="go"
                  onSubmitEditing={onCheck}
                  style={[styles.houseInput, { fontFamily: fonts.mono }]}
                />
              </View>

              <EditorialPrimaryButton
                label="Check my band"
                loading={loading}
                disabled={!canSubmit}
                onPress={onCheck}
                fonts={fonts}
                style={styles.cta}
              />
              <View style={styles.hints}>
                <View style={styles.hintItem}>
                  <IconCheck size={11} color={editorial.colors.forest} />
                  <Text style={[styles.hintText, { fontFamily: fonts.sans }]}>Free check</Text>
                </View>
                <Text style={[styles.hintDot, { fontFamily: fonts.sans }]}>·</Text>
                <Text style={[styles.hintText, { fontFamily: fonts.sans }]}>No signup</Text>
                <Text style={[styles.hintDot, { fontFamily: fonts.sans }]}>·</Text>
                <Text style={[styles.hintText, { fontFamily: fonts.sans }]}>30s</Text>
              </View>
            </View>
          </View>

          {/* How it works */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { fontFamily: fonts.serif }]}>
                How it works
              </Text>
              <Text style={[styles.sectionAside, { fontFamily: fonts.serifItalic }]}>
                three steps
              </Text>
            </View>
            {HOW_IT_WORKS.map((step) => (
              <View key={step.n} style={styles.stepRow}>
                <Text style={[styles.stepNum, { fontFamily: fonts.serif }]}>{step.n}</Text>
                <View style={styles.stepBody}>
                  <Text style={[styles.stepTitle, { fontFamily: fonts.sansSemiBold }]}>
                    {step.t}
                  </Text>
                  <Text style={[styles.stepDesc, { fontFamily: fonts.sans }]}>{step.d}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Stat strip */}
          <View style={styles.statsWrap}>
            <View style={styles.statsBanner}>
              <View style={styles.statsGlow} pointerEvents="none" />
              {STATS.map((stat, index) => (
                <View key={stat.l} style={styles.statCol}>
                  <Text style={[styles.statValue, { fontFamily: fonts.serif }]}>
                    {stat.v}
                  </Text>
                  <Text style={[styles.statLabel, { fontFamily: fonts.sans }]}>
                    {stat.l}
                  </Text>
                  {index < STATS.length - 1 ? <View style={styles.statDivider} /> : null}
                </View>
              ))}
            </View>
          </View>

          {/* Disclaimer bar */}
          <View style={styles.trustBar}>
            <Text style={[styles.trustKicker, { fontFamily: fonts.sansSemiBold }]}>
              ⚠ Estimated data only
            </Text>
            <Text style={[styles.trustSource, { fontFamily: fonts.serif }]}>
              Always verify your band at gov.uk/council-tax-bands
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    paddingBottom: 100,
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
  },
  chipWrap: {
    marginBottom: 14,
  },
  headline: {
    margin: 0,
    fontSize: 46,
    lineHeight: 45,
    letterSpacing: -1.15,
    color: editorial.colors.ink,
  },
  headlineEm: {
    color: editorial.colors.accent,
  },
  heroSub: {
    marginTop: 18,
    fontSize: 15,
    lineHeight: 22.5,
    color: editorial.colors.ink2,
    maxWidth: 320,
  },
  postcodeWrap: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  postcodeCard: {
    backgroundColor: editorial.colors.paperCard,
    borderRadius: editorial.radius.lg,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 16,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
  },
  postcodeCardShadow: {
    shadowColor: "#14120D",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  fieldLabel: {
    fontSize: 11,
    color: editorial.colors.ink3,
    letterSpacing: 0.88,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: editorial.radius.md,
    backgroundColor: editorial.colors.inputBg,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
  },
  input: {
    flex: 1,
    fontSize: 22,
    letterSpacing: 0.88,
    color: editorial.colors.ink,
    padding: 0,
  },
  fieldLabelOpt: {
    fontSize: 10,
    color: editorial.colors.ink3,
    textTransform: "none",
    letterSpacing: 0,
  },
  houseRow: {
    marginTop: 6,
  },
  houseInput: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: editorial.radius.md,
    backgroundColor: editorial.colors.inputBg,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
    fontSize: 14,
    color: editorial.colors.ink,
    letterSpacing: 0.14,
  },
  cta: {
    marginTop: 12,
    width: "100%",
  },
  hints: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginTop: 12,
  },
  hintItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  hintText: {
    fontSize: 11.5,
    color: editorial.colors.ink3,
  },
  hintDot: {
    fontSize: 11.5,
    color: editorial.colors.ink3,
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 22,
    letterSpacing: -0.22,
    color: editorial.colors.ink,
  },
  sectionAside: {
    fontSize: 15,
    color: editorial.colors.ink3,
  },
  stepRow: {
    flexDirection: "row",
    gap: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: editorial.colors.hairline,
  },
  stepNum: {
    width: 32,
    fontSize: 26,
    lineHeight: 26,
    color: editorial.colors.accent,
    letterSpacing: -0.52,
  },
  stepBody: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    color: editorial.colors.ink,
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 13,
    lineHeight: 18.85,
    color: editorial.colors.ink2,
  },
  statsWrap: {
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  statsBanner: {
    backgroundColor: editorial.colors.ink,
    borderRadius: editorial.radius.lg,
    paddingVertical: 20,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "stretch",
    overflow: "hidden",
    position: "relative",
  },
  statsGlow: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: editorial.colors.accentGlow,
    opacity: 0.5,
  },
  statCol: {
    flex: 1,
    zIndex: 1,
    position: "relative",
    paddingRight: 14,
  },
  statDivider: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: editorial.colors.paperDivider,
  },
  statValue: {
    fontSize: 28,
    lineHeight: 28,
    letterSpacing: -0.56,
    color: editorial.colors.paper,
  },
  statLabel: {
    marginTop: 6,
    fontSize: 11,
    letterSpacing: 0.22,
    color: editorial.colors.paperMuted,
  },
  trustBar: {
    paddingHorizontal: 24,
    paddingTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  trustKicker: {
    fontSize: 10.5,
    letterSpacing: 0.84,
    textTransform: "uppercase",
    color: editorial.colors.ink3,
  },
  trustSource: {
    fontSize: 14,
    color: editorial.colors.ink2,
  },
  trustDot: {
    color: editorial.colors.ink3,
  },
});
