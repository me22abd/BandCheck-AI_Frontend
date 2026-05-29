import { Linking, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { EditorialFooter } from "../components/editorial/EditorialFooter";
import { EditorialPrimaryButton } from "../components/editorial/EditorialPrimaryButton";
import { PaperBackground } from "../components/editorial/PaperBackground";
import { formatGbp } from "../lib/appealEstimates";
import { formatPostcode } from "../lib/postcode";
import { editorial } from "../theme/editorial";
import type { EditorialFonts } from "../theme/editorial";

type Props = {
  postcode: string;
  refundAmount?: number;
  annualReduction?: number;
  fonts: EditorialFonts;
  onDone: () => void;
};

export function OutcomeSuccessScreen({ postcode, refundAmount, annualReduction, fonts, onDone }: Props) {
  const formatted = formatPostcode(postcode);

  async function handleShare() {
    const savingStr = annualReduction
      ? ` saving ${formatGbp(annualReduction)}/yr`
      : "";
    const refundStr = refundAmount ? ` and received a ${formatGbp(refundAmount)} refund` : "";
    try {
      await Share.share({
        message: `I successfully appealed my council tax band for ${formatted}${savingStr}${refundStr} using BandCheck AI. Check if you're overpaying too: https://bandcheckai.co.uk`,
      });
    } catch {}
  }

  return (
    <PaperBackground>
      <View style={styles.wrap}>
        <View style={styles.content}>
          {/* Trophy */}
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>🏆</Text>
          </View>

          <Text style={[styles.headline, { fontFamily: fonts.serif }]}>
            Appeal successful
          </Text>
          <Text style={[styles.sub, { fontFamily: fonts.sans }]}>
            You successfully reduced your council tax band for {formatted}.
          </Text>

          {/* Savings card */}
          {(refundAmount || annualReduction) ? (
            <View style={styles.savingsCard}>
              {refundAmount ? (
                <View style={styles.savingsRow}>
                  <Text style={[styles.savingsLabel, { fontFamily: fonts.sans }]}>Refund received</Text>
                  <Text style={[styles.savingsValue, { fontFamily: fonts.serif }]}>
                    {formatGbp(refundAmount)}
                  </Text>
                </View>
              ) : null}
              {annualReduction ? (
                <View style={[styles.savingsRow, refundAmount ? styles.savingsRowBorder : null]}>
                  <Text style={[styles.savingsLabel, { fontFamily: fonts.sans }]}>Annual saving</Text>
                  <Text style={[styles.savingsValue, { fontFamily: fonts.serif }]}>
                    {formatGbp(annualReduction)}/yr
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Share CTA */}
          <View style={styles.shareSection}>
            <Text style={[styles.shareTitle, { fontFamily: fonts.sansSemiBold }]}>
              Know someone who might be overpaying?
            </Text>
            <Text style={[styles.shareSub, { fontFamily: fonts.sans }]}>
              Share BandCheck AI with a neighbour — millions of UK homes may be in the wrong band.
            </Text>
            <Pressable style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareEmoji}>📤</Text>
              <Text style={[styles.shareBtnText, { fontFamily: fonts.sansSemiBold }]}>
                Share with a neighbour
              </Text>
            </Pressable>
          </View>
        </View>

        <EditorialFooter>
          <EditorialPrimaryButton
            label="Back to my cases"
            onPress={onDone}
            fonts={fonts}
            style={styles.footerBtn}
          />
        </EditorialFooter>
      </View>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: "center",
    gap: 16,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: editorial.colors.chipForestBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  icon: { fontSize: 40 },
  headline: {
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.68,
    color: editorial.colors.ink,
    textAlign: "center",
  },
  sub: {
    fontSize: 15,
    lineHeight: 22,
    color: editorial.colors.ink2,
    textAlign: "center",
  },
  savingsCard: {
    width: "100%",
    backgroundColor: editorial.colors.paperCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
    overflow: "hidden",
    marginTop: 4,
  },
  savingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "rgba(15, 92, 62, 0.04)",
  },
  savingsRowBorder: {
    borderTopWidth: 1,
    borderTopColor: editorial.colors.hairline,
  },
  savingsLabel: { fontSize: 14, color: editorial.colors.ink2 },
  savingsValue: { fontSize: 24, letterSpacing: -0.24, color: editorial.colors.forest },
  shareSection: {
    width: "100%",
    backgroundColor: editorial.colors.paperCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
    padding: 18,
    gap: 10,
  },
  shareTitle: { fontSize: 15, color: editorial.colors.ink },
  shareSub: { fontSize: 13, lineHeight: 18, color: editorial.colors.ink3 },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: editorial.colors.ink,
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 4,
  },
  shareEmoji: { fontSize: 16 },
  shareBtnText: { fontSize: 14, color: editorial.colors.paper },
  footerBtn: { width: "100%" },
});
