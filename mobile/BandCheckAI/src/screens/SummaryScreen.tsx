import { useMemo } from "react";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BandPill } from "../components/editorial/BandPill";
import { CaseStrengthBar } from "../components/editorial/CaseStrengthBar";
import { EditorialFooter } from "../components/editorial/EditorialFooter";
import { EditorialPrimaryButton } from "../components/editorial/EditorialPrimaryButton";
import { IconBack, IconShare } from "../components/editorial/Icons";
import { IconButton } from "../components/editorial/IconButton";
import { PaperBackground } from "../components/editorial/PaperBackground";
import { SmallChip } from "../components/editorial/SmallChip";
import { TopBar } from "../components/editorial/TopBar";
import type { CheckResponse } from "../lib/api";
import { formatGbp, getAppealSummary } from "../lib/appealEstimates";
import { editorial } from "../theme/editorial";
import type { EditorialFonts } from "../theme/editorial";

type Props = {
  data: CheckResponse;
  fonts: EditorialFonts;
  onBack: () => void;
  onContinue: () => void;
};

export function SummaryScreen({ data, fonts, onBack, onContinue }: Props) {
  const { userBand, nearbyProperties } = data;
  const summary = useMemo(
    () => getAppealSummary(userBand, nearbyProperties),
    [userBand, nearbyProperties],
  );

  const chipLabel =
    summary.score >= 70
      ? `Strong case · ${summary.likelihood}% likelihood`
      : summary.score >= 40
        ? `Good case · ${summary.likelihood}% likelihood`
        : `Building case · ${summary.likelihood}% likelihood`;

  const reasons = [
    summary.lowerCount > 0
      ? `${summary.lowerCount} of ${summary.totalProperties} nearby comparable homes are in band ${summary.likelyBand}, not ${summary.userBand}.`
      : `We found ${summary.totalProperties} comparable homes near your postcode.`,
    "Properties are similar in size and value.",
    "Located in the same area.",
    "No qualifying improvements found in planning records.",
  ];

  return (
    <PaperBackground>
      <View style={styles.flex}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TopBar
            fonts={fonts}
            left={
              <IconButton onPress={onBack}>
                <IconBack color={editorial.colors.ink} />
              </IconButton>
            }
            title="Your case"
            right={
              <IconButton>
                <IconShare color={editorial.colors.ink} />
              </IconButton>
            }
          />

          {/* Estimated data disclaimer */}
          <TouchableOpacity
            style={styles.disclaimer}
            activeOpacity={0.7}
            onPress={() => Linking.openURL("https://www.gov.uk/council-tax-bands")}
          >
            <Text style={[styles.disclaimerIcon, { fontFamily: fonts.sans }]}>⚠</Text>
            <View style={styles.disclaimerBody}>
              <Text style={[styles.disclaimerTitle, { fontFamily: fonts.sansSemiBold }]}>
                Estimates only — verify before appealing
              </Text>
              <Text style={[styles.disclaimerText, { fontFamily: fonts.sans }]}>
                Band and savings figures are based on area data, not live VOA records. Confirm your band at gov.uk/council-tax-bands before submitting any appeal.
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.hero}>
            <SmallChip tone="forest" fonts={fonts}>
              {chipLabel}
            </SmallChip>
            <View style={styles.amountBlock}>
              <Text style={[styles.amountLine, { fontFamily: fonts.serif }]}>
                <Text style={[styles.currencySmall, { fontFamily: fonts.serif }]}>£</Text>
                {formatGbp(summary.totalOwed).replace("£", "")}
              </Text>
            </View>
            <Text style={[styles.heroSub, { fontFamily: fonts.serifItalic }]}>
              total you could be owed
            </Text>
          </View>

          <View style={styles.breakdownWrap}>
            <View style={styles.breakdownCard}>
              <View style={[styles.breakdownRow, styles.breakdownRowFirst]}>
                <View style={styles.breakdownLeft}>
                  <Text style={[styles.rowTitle, { fontFamily: fonts.sans }]}>Current band</Text>
                  <Text style={[styles.rowSub, { fontFamily: fonts.mono }]}>
                    {formatGbp(summary.currentAnnual)} / year
                  </Text>
                </View>
                <BandPill letter={summary.userBand} fonts={fonts} />
              </View>
              <View style={styles.breakdownRow}>
                <View style={styles.breakdownLeft}>
                  <Text style={[styles.rowTitle, { fontFamily: fonts.sans }]}>
                    Likely correct band
                  </Text>
                  <Text style={[styles.rowSub, { fontFamily: fonts.mono }]}>
                    {formatGbp(summary.reducedAnnual)} / year
                  </Text>
                </View>
                <BandPill letter={summary.likelyBand} tone="forest" fonts={fonts} />
              </View>
              <View style={[styles.breakdownRow, styles.breakdownRowEm]}>
                <View style={styles.breakdownLeft}>
                  <Text style={[styles.rowTitle, { fontFamily: fonts.sans }]}>Annual saving</Text>
                  <Text style={[styles.rowSub, { fontFamily: fonts.mono }]}>
                    every year going forward
                  </Text>
                </View>
                <Text style={[styles.summaryNum, { fontFamily: fonts.serif }]}>
                  {formatGbp(summary.annualSaving)}
                </Text>
              </View>
              <View style={[styles.breakdownRow, styles.breakdownRowEm]}>
                <View style={styles.breakdownLeft}>
                  <Text style={[styles.rowTitle, { fontFamily: fonts.sans }]}>
                    Backdated refund
                  </Text>
                  <Text style={[styles.rowSub, { fontFamily: fonts.mono }]}>
                    estimated backdated amount
                  </Text>
                </View>
                <Text style={[styles.summaryNum, { fontFamily: fonts.serif }]}>
                  {formatGbp(summary.backdatedRefund)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.strengthSection}>
            <CaseStrengthBar
              score={summary.score}
              strength={summary.strength}
              fonts={fonts}
            />
          </View>

          <View style={styles.aiSection}>
            <View style={styles.aiCard}>
              <View style={styles.aiHeader}>
                <View style={styles.aiBadge}>
                  <Text style={[styles.aiBadgeText, { fontFamily: fonts.serifItalic }]}>ai</Text>
                </View>
                <Text style={[styles.aiTitle, { fontFamily: fonts.sansSemiBold }]}>
                  Why we think this
                </Text>
              </View>
              {reasons.map((reason, i) => (
                <View key={reason} style={styles.aiRow}>
                  <Text style={[styles.aiNum, { fontFamily: fonts.serif }]}>{i + 1}.</Text>
                  <Text style={[styles.aiText, { fontFamily: fonts.sans }]}>{reason}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <EditorialFooter>
          <EditorialPrimaryButton
            label="Build my appeal"
            onPress={onContinue}
            fonts={fonts}
            style={styles.footerBtn}
          />
        </EditorialFooter>
      </View>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    paddingBottom: 120,
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "rgba(200, 67, 28, 0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(200, 67, 28, 0.25)",
    padding: 12,
  },
  disclaimerIcon: {
    fontSize: 14,
    marginTop: 1,
  },
  disclaimerBody: {
    flex: 1,
  },
  disclaimerTitle: {
    fontSize: 12,
    color: "#C8431C",
    marginBottom: 2,
  },
  disclaimerText: {
    fontSize: 11.5,
    lineHeight: 16,
    color: editorial.colors.ink2,
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: "center",
  },
  amountBlock: {
    marginTop: 16,
    alignItems: "center",
  },
  amountLine: {
    fontSize: 72,
    lineHeight: 68,
    letterSpacing: -2.16,
    color: editorial.colors.ink,
  },
  currencySmall: {
    fontSize: 38,
    color: editorial.colors.ink2,
  },
  heroSub: {
    marginTop: 2,
    fontSize: 18,
    color: editorial.colors.ink2,
  },
  breakdownWrap: {
    paddingHorizontal: 16,
    paddingTop: 28,
  },
  breakdownCard: {
    backgroundColor: editorial.colors.paperCard,
    borderRadius: editorial.radius.lg,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
    overflow: "hidden",
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: editorial.colors.hairline,
  },
  breakdownRowFirst: {
    borderTopWidth: 0,
  },
  breakdownRowEm: {
    backgroundColor: "rgba(15, 92, 62, 0.04)",
  },
  breakdownLeft: {
    flex: 1,
    paddingRight: 12,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: editorial.colors.ink,
  },
  rowSub: {
    fontSize: 10.5,
    color: editorial.colors.ink3,
    marginTop: 2,
  },
  summaryNum: {
    fontSize: 24,
    letterSpacing: -0.24,
    color: editorial.colors.forest,
  },
  strengthSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  aiSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  aiCard: {
    backgroundColor: editorial.colors.paperCard,
    borderRadius: editorial.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  aiBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: editorial.colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  aiBadgeText: {
    fontSize: 13,
    color: editorial.colors.paper,
  },
  aiTitle: {
    fontSize: 14,
    color: editorial.colors.ink,
  },
  aiRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 8,
  },
  aiNum: {
    width: 18,
    fontSize: 16,
    lineHeight: 19,
    color: editorial.colors.accent,
  },
  aiText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19.5,
    color: editorial.colors.ink2,
  },
  footerBtn: {
    width: "100%",
  },
});
