import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { BandPill } from "../components/editorial/BandPill";
import { EditorialFooter } from "../components/editorial/EditorialFooter";
import { EditorialPrimaryButton } from "../components/editorial/EditorialPrimaryButton";
import { IconBack } from "../components/editorial/Icons";
import { IconButton } from "../components/editorial/IconButton";
import { PaperBackground } from "../components/editorial/PaperBackground";
import { SmallChip } from "../components/editorial/SmallChip";
import { TopBar } from "../components/editorial/TopBar";
import type { CheckResponse } from "../lib/api";
import { bandKey, formatGbp, getAppealSummary } from "../lib/appealEstimates";
import { formatPostcode } from "../lib/postcode";
import { councilTaxBandIndex, formatDistanceMiles } from "../lib/scoring";
import { editorial } from "../theme/editorial";
import type { EditorialFonts } from "../theme/editorial";

type Props = {
  data: CheckResponse;
  fonts: EditorialFonts;
  onBack: () => void;
  onContinue: () => void;
};

function SectionHeader({ label, fonts }: { label: string; fonts: EditorialFonts }) {
  return (
    <View style={sectionStyles.wrap}>
      <View style={sectionStyles.line} />
      <Text style={[sectionStyles.label, { fontFamily: fonts.sansSemiBold }]}>{label}</Text>
      <View style={sectionStyles.line} />
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: editorial.colors.hairline },
  label: { fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: editorial.colors.ink3 },
});

export function EvidencePackPreviewScreen({ data, fonts, onBack, onContinue }: Props) {
  const { userBand, nearbyProperties } = data;
  const formatted = formatPostcode(data.postcode);
  const summary = useMemo(
    () => getAppealSummary(userBand, nearbyProperties),
    [userBand, nearbyProperties],
  );

  const comparables = nearbyProperties.slice(0, 6);
  const lowerCount = useMemo(() => {
    const userIdx = councilTaxBandIndex(userBand);
    return nearbyProperties.filter((p) => councilTaxBandIndex(p.band) < userIdx).length;
  }, [nearbyProperties, userBand]);

  const appealLetter = `Dear Valuation Officer,

I am writing to formally challenge the council tax band assigned to my property at ${formatted}.

Having reviewed the banding of comparable properties in my immediate area, I believe my property has been placed in an incorrect band.

${lowerCount} of ${nearbyProperties.length} nearby comparable properties — of similar size, age, and character — are banded ${summary.likelyBand}, which is lower than my current band ${summary.userBand}. This discrepancy suggests my property was assessed incorrectly relative to its neighbours at the 1 April 1991 valuation date.

I respectfully request a review and, if appropriate, a reduction to Band ${summary.likelyBand}. I am happy to provide further evidence if required.

Yours faithfully,
[Your name]`;

  return (
    <PaperBackground>
      <View style={styles.flex}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <TopBar
            fonts={fonts}
            left={
              <IconButton onPress={onBack}>
                <IconBack color={editorial.colors.ink} />
              </IconButton>
            }
            title="Pack preview"
          />

          {/* Cover */}
          <View style={styles.cover}>
            <View style={styles.coverInner}>
              <SmallChip tone="accent" fonts={fonts}>Evidence Pack · Preview</SmallChip>
              <Text style={[styles.coverTitle, { fontFamily: fonts.serif }]}>
                Council Tax Appeal
              </Text>
              <Text style={[styles.coverPostcode, { fontFamily: fonts.mono }]}>
                {formatted}
              </Text>
              <View style={styles.coverMeta}>
                <View style={styles.coverMetaItem}>
                  <Text style={[styles.coverMetaLabel, { fontFamily: fonts.sans }]}>Current band</Text>
                  <BandPill letter={bandKey(userBand)} tone="accent" fonts={fonts} />
                </View>
                <View style={styles.coverMetaDivider} />
                <View style={styles.coverMetaItem}>
                  <Text style={[styles.coverMetaLabel, { fontFamily: fonts.sans }]}>Likely band</Text>
                  <BandPill letter={summary.likelyBand} tone="forest" fonts={fonts} />
                </View>
                <View style={styles.coverMetaDivider} />
                <View style={styles.coverMetaItem}>
                  <Text style={[styles.coverMetaLabel, { fontFamily: fonts.sans }]}>Potential saving</Text>
                  <Text style={[styles.coverMetaValue, { fontFamily: fonts.serif }]}>
                    {formatGbp(summary.annualSaving)}/yr
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.body}>

            {/* Section 1: Comparables */}
            <SectionHeader label="Section 1 — Comparable Evidence" fonts={fonts} />
            <View style={styles.tableCard}>
              <View style={styles.tableHead}>
                <Text style={[styles.tableHeadCell, { fontFamily: fonts.sansSemiBold, flex: 3 }]}>Address</Text>
                <Text style={[styles.tableHeadCell, { fontFamily: fonts.sansSemiBold, flex: 1, textAlign: "center" }]}>Band</Text>
                <Text style={[styles.tableHeadCell, { fontFamily: fonts.sansSemiBold, flex: 1, textAlign: "right" }]}>Distance</Text>
              </View>
              {comparables.map((row, i) => {
                const isMatch = councilTaxBandIndex(row.band) < councilTaxBandIndex(userBand);
                return (
                  <View
                    key={`${row.address}-${i}`}
                    style={[styles.tableRow, i > 0 && styles.tableRowBorder, isMatch && styles.tableRowMatch]}
                  >
                    <Text
                      style={[styles.tableCell, { fontFamily: fonts.sans, flex: 3 }, isMatch && styles.tableCellMatch]}
                      numberOfLines={1}
                    >
                      {row.address}
                    </Text>
                    <View style={{ flex: 1, alignItems: "center" }}>
                      <BandPill letter={bandKey(row.band)} tone={isMatch ? "forest" : "ink"} fonts={fonts} />
                    </View>
                    <Text style={[styles.tableCell, { fontFamily: fonts.mono, flex: 1, textAlign: "right" }]}>
                      {formatDistanceMiles(row.distanceMiles)}
                    </Text>
                  </View>
                );
              })}
              <View style={styles.tableFoot}>
                <Text style={[styles.tableFootText, { fontFamily: fonts.sans }]}>
                  <Text style={styles.tableFootEm}>{lowerCount}</Text> of {nearbyProperties.length} comparable properties are in a lower band
                </Text>
              </View>
            </View>

            {/* Section 2: Financial breakdown */}
            <SectionHeader label="Section 2 — Financial Breakdown" fonts={fonts} />
            <View style={styles.finCard}>
              {[
                { label: "Current band annual charge", value: formatGbp(summary.currentAnnual), em: false },
                { label: `Reduced charge (band ${summary.likelyBand})`, value: formatGbp(summary.reducedAnnual), em: false },
                { label: "Annual saving", value: formatGbp(summary.annualSaving), em: true },
                { label: "Backdated refund (est. since 2019)", value: formatGbp(summary.backdatedRefund), em: true },
                { label: "Total potential owed", value: formatGbp(summary.totalOwed), em: true },
              ].map((row, i) => (
                <View key={row.label} style={[styles.finRow, i > 0 && styles.finRowBorder, row.em && styles.finRowEm]}>
                  <Text style={[styles.finLabel, { fontFamily: fonts.sans }, row.em && styles.finLabelEm]}>
                    {row.label}
                  </Text>
                  <Text style={[styles.finValue, { fontFamily: fonts.serif }, row.em && styles.finValueEm]}>
                    {row.value}
                  </Text>
                </View>
              ))}
            </View>

            {/* Section 3: Draft appeal letter */}
            <SectionHeader label="Section 3 — Draft Appeal Letter" fonts={fonts} />
            <View style={styles.letterCard}>
              <View style={styles.letterHeader}>
                <Text style={[styles.letterHeaderLabel, { fontFamily: fonts.sansSemiBold }]}>
                  To: Valuation Office Agency
                </Text>
                <SmallChip tone="forest" fonts={fonts}>Pre-filled</SmallChip>
              </View>
              <Text style={[styles.letterBody, { fontFamily: fonts.mono }]}>
                {appealLetter}
              </Text>
              <Text style={[styles.letterHint, { fontFamily: fonts.sans }]}>
                Review and personalise before submission.
              </Text>
            </View>

            {/* Section 4: Land Registry note */}
            <SectionHeader label="Section 4 — Land Registry Citations" fonts={fonts} />
            <View style={styles.citationCard}>
              <Text style={[styles.citationText, { fontFamily: fonts.sans }]}>
                Direct links to public Land Registry records for each comparable property will be included in your emailed PDF. These serve as primary source citations for your appeal.
              </Text>
              <View style={styles.citationRows}>
                {comparables.slice(0, 3).map((row, i) => (
                  <View key={i} style={[styles.citationRow, i > 0 && styles.citationRowBorder]}>
                    <Text style={[styles.citationAddress, { fontFamily: fonts.sans }]} numberOfLines={1}>
                      {row.address}
                    </Text>
                    <Text style={[styles.citationLink, { fontFamily: fonts.mono }]}>
                      land-registry.gov.uk →
                    </Text>
                  </View>
                ))}
                {comparables.length > 3 && (
                  <Text style={[styles.citationMore, { fontFamily: fonts.sans }]}>
                    + {comparables.length - 3} more in full PDF
                  </Text>
                )}
              </View>
            </View>

            <View style={{ height: 8 }} />
          </View>
        </ScrollView>

        <EditorialFooter>
          <EditorialPrimaryButton
            label="Send my evidence pack →"
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
  scroll: { paddingBottom: 120 },

  // Cover
  cover: { paddingHorizontal: 16, paddingTop: 12 },
  coverInner: {
    backgroundColor: editorial.colors.ink,
    borderRadius: 20,
    padding: 20,
    gap: 8,
  },
  coverTitle: { fontSize: 28, lineHeight: 32, color: editorial.colors.paper, marginTop: 4 },
  coverPostcode: { fontSize: 13, color: "rgba(244,239,229,0.55)", letterSpacing: 0.5 },
  coverMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(244,239,229,0.12)",
  },
  coverMetaItem: { flex: 1, alignItems: "center", gap: 6 },
  coverMetaDivider: { width: 1, height: 36, backgroundColor: "rgba(244,239,229,0.12)" },
  coverMetaLabel: { fontSize: 10, color: "rgba(244,239,229,0.45)", textTransform: "uppercase", letterSpacing: 0.5 },
  coverMetaValue: { fontSize: 16, color: editorial.colors.paper },

  body: { paddingHorizontal: 16 },

  // Table
  tableCard: {
    backgroundColor: editorial.colors.paperCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
    overflow: "hidden",
  },
  tableHead: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(20,18,13,0.03)",
    borderBottomWidth: 1,
    borderBottomColor: editorial.colors.hairline,
  },
  tableHeadCell: { fontSize: 10, color: editorial.colors.ink3, textTransform: "uppercase", letterSpacing: 0.6 },
  tableRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10 },
  tableRowBorder: { borderTopWidth: 1, borderTopColor: editorial.colors.hairline },
  tableRowMatch: { backgroundColor: "rgba(15, 92, 62, 0.04)" },
  tableCell: { fontSize: 12, color: editorial.colors.ink },
  tableCellMatch: { color: editorial.colors.forest },
  tableFoot: {
    borderTopWidth: 1,
    borderTopColor: editorial.colors.hairline,
    padding: 10,
    backgroundColor: "rgba(20,18,13,0.02)",
  },
  tableFootText: { fontSize: 11, color: editorial.colors.ink3, textAlign: "center" },
  tableFootEm: { color: editorial.colors.forest, fontWeight: "600" },

  // Financial breakdown
  finCard: {
    backgroundColor: editorial.colors.paperCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
    overflow: "hidden",
  },
  finRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12 },
  finRowBorder: { borderTopWidth: 1, borderTopColor: editorial.colors.hairline },
  finRowEm: { backgroundColor: "rgba(15, 92, 62, 0.04)" },
  finLabel: { fontSize: 13, color: editorial.colors.ink2, flex: 1, paddingRight: 8 },
  finLabelEm: { color: editorial.colors.ink },
  finValue: { fontSize: 18, letterSpacing: -0.18, color: editorial.colors.ink },
  finValueEm: { color: editorial.colors.forest },

  // Appeal letter
  letterCard: {
    backgroundColor: editorial.colors.paperCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
    overflow: "hidden",
  },
  letterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: editorial.colors.hairline,
    backgroundColor: "rgba(20,18,13,0.03)",
  },
  letterHeaderLabel: { fontSize: 11, color: editorial.colors.ink3 },
  letterBody: {
    fontSize: 11.5,
    lineHeight: 18,
    color: editorial.colors.ink2,
    padding: 14,
  },
  letterHint: {
    fontSize: 11,
    color: editorial.colors.ink3,
    paddingHorizontal: 14,
    paddingBottom: 12,
    fontStyle: "italic",
  },

  // Citations
  citationCard: {
    backgroundColor: editorial.colors.paperCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
    padding: 14,
  },
  citationText: { fontSize: 12, lineHeight: 18, color: editorial.colors.ink2, marginBottom: 12 },
  citationRows: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
    overflow: "hidden",
  },
  citationRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10 },
  citationRowBorder: { borderTopWidth: 1, borderTopColor: editorial.colors.hairline },
  citationAddress: { fontSize: 12, color: editorial.colors.ink, flex: 1 },
  citationLink: { fontSize: 10, color: editorial.colors.accent, marginLeft: 8 },
  citationMore: { fontSize: 11, color: editorial.colors.ink3, textAlign: "center", paddingVertical: 8, borderTopWidth: 1, borderTopColor: editorial.colors.hairline },

  footerBtn: { width: "100%" },
});
