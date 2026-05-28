import { useMemo } from "react";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BandLadder } from "../components/editorial/BandLadder";
import { BandPill } from "../components/editorial/BandPill";
import { EditorialPrimaryButton } from "../components/editorial/EditorialPrimaryButton";
import { Hairline } from "../components/editorial/Hairline";
import { IconBack, IconShare } from "../components/editorial/Icons";
import { IconButton } from "../components/editorial/IconButton";
import { PaperBackground } from "../components/editorial/PaperBackground";
import { SmallChip } from "../components/editorial/SmallChip";
import { TopBar } from "../components/editorial/TopBar";
import type { CheckResponse } from "../lib/api";
import { BAND_ANNUAL, bandKey, formatGbp, likelyLowerBand } from "../lib/appealEstimates";
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

export function CompareScreen({ data, fonts, onBack, onContinue }: Props) {
  const { userBand, nearbyProperties } = data;
  const formatted = formatPostcode(data.postcode);
  const count = nearbyProperties.length;

  const lowerCount = useMemo(() => {
    const userIdx = councilTaxBandIndex(userBand);
    return nearbyProperties.filter((p) => councilTaxBandIndex(p.band) < userIdx).length;
  }, [nearbyProperties, userBand]);

  const maxDist = useMemo(() => {
    if (!nearbyProperties.length) return 0;
    return Math.max(...nearbyProperties.map((p) => p.distanceMiles ?? 0));
  }, [nearbyProperties]);

  const lowerBand = likelyLowerBand(
    userBand,
    nearbyProperties.map((p) => p.band),
  );
  const currentAnnual = BAND_ANNUAL[bandKey(userBand)] ?? BAND_ANNUAL.D;
  const reducedAnnual = lowerBand ? (BAND_ANNUAL[lowerBand] ?? currentAnnual) : currentAnnual;

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
            title="Comparables"
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
                Estimated band — always verify
              </Text>
              <Text style={[styles.disclaimerText, { fontFamily: fonts.sans }]}>
                This analysis is based on area data, not live VOA records. Check your official band at gov.uk/council-tax-bands before appealing.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Your home card */}
          <View style={styles.homeWrap}>
            <View style={styles.homeCard}>
              <Text style={[styles.cardKicker, { fontFamily: fonts.sansSemiBold }]}>
                Your home
              </Text>
              <View style={styles.homeHeader}>
                <View style={styles.homeText}>
                  <Text style={[styles.homeTitle, { fontFamily: fonts.serif }]}>
                    {formatted}
                  </Text>
                  <Text style={[styles.homeMeta, { fontFamily: fonts.mono }]}>
                    {formatted} · Council tax band {userBand}
                  </Text>
                </View>
                <BandPill letter={bandKey(userBand)} big tone="accent" fonts={fonts} />
              </View>
              {lowerBand ? (
                <View style={styles.homeSplit}>
                  <View style={styles.splitCol}>
                    <Text style={[styles.splitValue, { fontFamily: fonts.serif }]}>
                      {formatGbp(currentAnnual)}
                    </Text>
                    <Text style={[styles.splitLabel, { fontFamily: fonts.sans }]}>
                      this year (band {bandKey(userBand)})
                    </Text>
                  </View>
                  <Hairline vertical />
                  <View style={styles.splitCol}>
                    <Text style={[styles.splitValueForest, { fontFamily: fonts.serif }]}>
                      {formatGbp(reducedAnnual)}
                    </Text>
                    <Text style={[styles.splitLabel, { fontFamily: fonts.sans }]}>
                      if reduced to {lowerBand}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>

          {count > 0 ? (
            <>
              {/* Band scatter */}
              <View style={styles.ladderSection}>
                <View style={styles.ladderHeader}>
                  <Text style={[styles.sectionTitle, { fontFamily: fonts.serif }]}>
                    Where you sit
                  </Text>
                  <Text style={[styles.ladderMeta, { fontFamily: fonts.sans }]}>
                    {count} comparables · {maxDist.toFixed(1)}mi
                  </Text>
                </View>
                <BandLadder
                  userBand={userBand}
                  propertyBands={nearbyProperties.map((p) => p.band)}
                  fonts={fonts}
                />
              </View>

              {/* Comparable list */}
              <View style={styles.listSection}>
                <Text style={[styles.listKicker, { fontFamily: fonts.sansSemiBold }]}>
                  Comparable properties
                </Text>
                <View style={styles.listCard}>
                  {nearbyProperties.map((row, index) => {
                    const match =
                      councilTaxBandIndex(row.band) < councilTaxBandIndex(userBand);
                    return (
                      <View
                        key={`${row.address}-${index}`}
                        style={[
                          styles.listRow,
                          index > 0 && styles.listRowBorder,
                          !match && styles.listRowMuted,
                        ]}
                      >
                        <BandPill
                          letter={bandKey(row.band)}
                          tone={match ? "forest" : "ink"}
                          fonts={fonts}
                        />
                        <View style={styles.listBody}>
                          <Text style={[styles.listTitle, { fontFamily: fonts.sans }]}>
                            {row.address}
                          </Text>
                          <Text style={[styles.listMeta, { fontFamily: fonts.mono }]}>
                            {formatDistanceMiles(row.distanceMiles)}
                          </Text>
                        </View>
                        {match ? (
                          <SmallChip tone="forest" fonts={fonts}>
                            match
                          </SmallChip>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
                <Text style={[styles.listFoot, { fontFamily: fonts.sans }]}>
                  <Text style={styles.listFootStrong}>{lowerCount} of {count}</Text> sit in a
                  lower band than yours
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.empty}>
              <Text style={[styles.emptyTitle, { fontFamily: fonts.sansSemiBold }]}>
                No comparable properties found
              </Text>
              <Text style={[styles.emptySub, { fontFamily: fonts.sans }]}>
                We couldn't find nearby matches for this postcode. You can still review your
                band and continue to the appeal builder.
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerFade} pointerEvents="none" />
          <EditorialPrimaryButton
            label={count > 0 ? "See your case" : "Continue anyway"}
            onPress={onContinue}
            fonts={fonts}
            style={styles.footerBtn}
          />
        </View>
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
  homeWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  homeCard: {
    backgroundColor: editorial.colors.paperCard,
    borderRadius: editorial.radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
    shadowColor: "#14120D",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  cardKicker: {
    fontSize: 11,
    color: editorial.colors.ink3,
    letterSpacing: 0.88,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  homeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  homeText: {
    flex: 1,
    paddingRight: 12,
  },
  homeTitle: {
    fontSize: 22,
    lineHeight: 25,
    letterSpacing: -0.22,
    color: editorial.colors.ink,
  },
  homeMeta: {
    fontSize: 11,
    color: editorial.colors.ink3,
    marginTop: 2,
    letterSpacing: 0.44,
  },
  homeSplit: {
    flexDirection: "row",
    gap: 14,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: editorial.colors.hairline,
  },
  splitCol: {
    flex: 1,
  },
  splitValue: {
    fontSize: 19,
    color: editorial.colors.ink,
  },
  splitValueForest: {
    fontSize: 19,
    color: editorial.colors.forest,
  },
  splitLabel: {
    fontSize: 10.5,
    color: editorial.colors.ink3,
    letterSpacing: 0.42,
    marginTop: 2,
  },
  ladderSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  ladderHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    letterSpacing: -0.22,
    color: editorial.colors.ink,
  },
  ladderMeta: {
    fontSize: 11,
    color: editorial.colors.ink3,
  },
  listSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  listKicker: {
    fontSize: 11,
    color: editorial.colors.ink3,
    letterSpacing: 0.88,
    textTransform: "uppercase",
    paddingHorizontal: 6,
    paddingBottom: 10,
  },
  listCard: {
    backgroundColor: editorial.colors.paperCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
    overflow: "hidden",
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  listRowBorder: {
    borderTopWidth: 1,
    borderTopColor: editorial.colors.hairline,
  },
  listRowMuted: {
    backgroundColor: "rgba(20, 18, 13, 0.025)",
  },
  listBody: {
    flex: 1,
    minWidth: 0,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: editorial.colors.ink,
  },
  listMeta: {
    fontSize: 10.5,
    color: editorial.colors.ink3,
    marginTop: 2,
    letterSpacing: 0.21,
  },
  listFoot: {
    textAlign: "center",
    paddingTop: 12,
    fontSize: 12,
    color: editorial.colors.ink3,
  },
  listFootStrong: {
    color: editorial.colors.forest,
    fontWeight: "600",
  },
  empty: {
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    color: editorial.colors.ink,
  },
  emptySub: {
    marginTop: 8,
    fontSize: 14,
    color: editorial.colors.ink2,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 16,
    backgroundColor: editorial.colors.paper,
  },
  footerFade: {
    position: "absolute",
    top: -32,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: editorial.colors.paper,
    opacity: 0.85,
  },
  footerBtn: {
    width: "100%",
  },
});
