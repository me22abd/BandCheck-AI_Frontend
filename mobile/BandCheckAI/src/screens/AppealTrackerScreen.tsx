import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PaperBackground } from "../components/editorial/PaperBackground";
import { editorial } from "../theme/editorial";
import type { EditorialFonts } from "../theme/editorial";
import { formatGbp } from "../lib/appealEstimates";
import { formatPostcode } from "../lib/postcode";
import {
  clearAppealRecord,
  nextStatus,
  STATUS_LABELS,
  STATUS_STEPS,
  STATUS_SUB,
  statusIndex,
  updateAppealStatus,
  type AppealRecord,
  type AppealStatus,
} from "../lib/appealTracker";

type Props = {
  fonts: EditorialFonts;
  initialRecord: AppealRecord;
  onRecordChange: (record: AppealRecord) => void;
  onDone: () => void;
};

const STEP_ICONS: Record<AppealStatus, string> = {
  submitted: "📤",
  acknowledged: "📬",
  under_review: "🔍",
  decision_received: "📋",
  won: "🏆",
  lost: "📄",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AppealTrackerScreen({ fonts, initialRecord, onRecordChange, onDone }: Props) {
  const [record, setRecord] = useState<AppealRecord>(initialRecord);
  const [updating, setUpdating] = useState(false);

  async function handleAdvance() {
    if (!record) return;
    const next = nextStatus(record.status);
    if (!next) return;

    // For decision_received → won or lost, ask the user which outcome
    if (record.status === "decision_received") {
      Alert.alert(
        "What was the decision?",
        "Did the VOA agree to reduce your council tax band?",
        [
          {
            text: "Yes — band reduced! 🎉",
            onPress: () => advance("won"),
          },
          {
            text: "No — band upheld",
            onPress: () => advance("lost"),
          },
          { text: "Not yet decided", style: "cancel" },
        ],
      );
      return;
    }

    advance(next);
  }

  async function advance(status: AppealStatus) {
    setUpdating(true);
    const updated: AppealRecord = {
      ...record,
      status,
      updatedAt: new Date().toISOString(),
    };
    setRecord(updated);
    onRecordChange(updated);
    // persist in background — UI doesn't depend on this completing
    updateAppealStatus(status).catch(() => {});
    setUpdating(false);
  }

  async function handleShare() {
    const pc = formatPostcode(record.postcode);
    const saving = record.annualSaving ? formatGbp(record.annualSaving) : "money";
    const bandChange =
      record.likelyBand && record.likelyBand !== record.userBand
        ? `from Band ${record.userBand} to Band ${record.likelyBand}`
        : `from Band ${record.userBand}`;

    try {
      await Share.share({
        message: `I just saved ${saving}/year on my council tax! 🎉\n\nI challenged my band ${bandChange} using BandCheck AI — it took less than 10 minutes and was completely free.\n\nCheck if you're overpaying: bandcheckai.co.uk`,
        title: "I reduced my council tax band with BandCheck AI",
      });
    } catch {
      // ignore share cancellation
    }
  }

  async function handleReset() {
    Alert.alert(
      "Clear appeal?",
      "This will remove your appeal record. You can start a new check at any time.",
      [
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearAppealRecord().catch(() => {});
            onDone();
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
  }

  const pc = formatPostcode(record.postcode);
  const currentIdx = statusIndex(record.status);
  const isWon = record.status === "won";
  const isLost = record.status === "lost";
  const isTerminal = isWon || isLost;
  const next = nextStatus(record.status);

  return (
    <PaperBackground>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={[styles.topTitle, { fontFamily: fonts.sansSemiBold }]}>My appeal</Text>
          <Pressable onPress={handleReset} hitSlop={12}>
            <Text style={[styles.clearText, { fontFamily: fonts.sans }]}>Clear</Text>
          </Pressable>
        </View>

        {/* Win celebration card */}
        {isWon ? (
          <View style={styles.winCard}>
            <View style={styles.winGlow} pointerEvents="none" />
            <View style={styles.winGlow2} pointerEvents="none" />
            <Text style={styles.winEmoji}>🏆</Text>
            <Text style={[styles.winTitle, { fontFamily: fonts.serif }]}>
              You won{"\n"}your appeal
            </Text>
            {record.annualSaving ? (
              <View style={styles.winSavingRow}>
                <Text style={[styles.winSavingLabel, { fontFamily: fonts.sans }]}>
                  annual saving
                </Text>
                <Text style={[styles.winSavingValue, { fontFamily: fonts.serif }]}>
                  {formatGbp(record.annualSaving)} / yr
                </Text>
              </View>
            ) : null}
            <Text style={[styles.winMeta, { fontFamily: fonts.mono }]}>
              {pc} · Band {record.userBand}
              {record.likelyBand && record.likelyBand !== record.userBand
                ? ` → ${record.likelyBand}`
                : ""}
            </Text>
          </View>
        ) : (
          /* Standard status hero card */
          <View style={[styles.heroCard, isLost && styles.heroCardMuted]}>
            <Text style={styles.heroEmoji}>{STEP_ICONS[record.status]}</Text>
            <View style={styles.heroBody}>
              <Text style={[styles.heroTitle, { fontFamily: fonts.serif }]}>
                {STATUS_LABELS[record.status]}
              </Text>
              <Text style={[styles.heroSub, { fontFamily: fonts.sans }]}>
                {STATUS_SUB[record.status]}
              </Text>
            </View>
          </View>
        )}

        {/* Property details row */}
        <View style={styles.detailsRow}>
          <View style={styles.detailChip}>
            <Text style={[styles.detailLabel, { fontFamily: fonts.sans }]}>Postcode</Text>
            <Text style={[styles.detailValue, { fontFamily: fonts.sansBold }]}>{pc}</Text>
          </View>
          <View style={styles.detailChip}>
            <Text style={[styles.detailLabel, { fontFamily: fonts.sans }]}>Band</Text>
            <Text style={[styles.detailValue, { fontFamily: fonts.sansBold }]}>
              {record.userBand}
              {record.likelyBand && record.likelyBand !== record.userBand
                ? ` → ${record.likelyBand}`
                : ""}
            </Text>
          </View>
          <View style={styles.detailChip}>
            <Text style={[styles.detailLabel, { fontFamily: fonts.sans }]}>Submitted</Text>
            <Text style={[styles.detailValue, { fontFamily: fonts.sansBold }]}>
              {formatDate(record.submittedAt)}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { fontFamily: fonts.sansBold }]}>Progress</Text>
          <View style={styles.timeline}>
            {STATUS_STEPS.map((step, i) => {
              const isDone = i <= currentIdx && !isLost;
              const isCurrent = i === currentIdx && !isTerminal;
              const isFuture = i > currentIdx;

              return (
                <View key={step} style={styles.timelineRow}>
                  {/* Connector line */}
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineDot,
                        isDone && styles.timelineDotDone,
                        isCurrent && styles.timelineDotCurrent,
                      ]}
                    >
                      {isDone && !isCurrent ? (
                        <Text style={styles.timelineCheck}>✓</Text>
                      ) : isCurrent ? (
                        <View style={styles.timelinePulse} />
                      ) : null}
                    </View>
                    {i < STATUS_STEPS.length - 1 ? (
                      <View
                        style={[styles.timelineLine, i < currentIdx && styles.timelineLineDone]}
                      />
                    ) : null}
                  </View>

                  {/* Step content */}
                  <View style={[styles.timelineContent, i < STATUS_STEPS.length - 1 && { marginBottom: 20 }]}>
                    <Text
                      style={[
                        styles.timelineTitle,
                        { fontFamily: isCurrent ? fonts.sansBold : fonts.sans },
                        isFuture && styles.timelineFuture,
                        isCurrent && styles.timelineCurrent,
                      ]}
                    >
                      {STATUS_LABELS[step]}
                    </Text>
                    {isCurrent ? (
                      <Text style={[styles.timelineDesc, { fontFamily: fonts.sans }]}>
                        {STATUS_SUB[step]}
                      </Text>
                    ) : null}
                  </View>
                </View>
              );
            })}

            {/* Lost branch */}
            {isLost ? (
              <View style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, styles.timelineDotLost]}>
                    <Text style={styles.timelineCheck}>✗</Text>
                  </View>
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineTitle, { fontFamily: fonts.sansBold }, styles.timelineLostText]}>
                    {STATUS_LABELS.lost}
                  </Text>
                  <Text style={[styles.timelineDesc, { fontFamily: fonts.sans }]}>
                    {STATUS_SUB.lost}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {/* CTA buttons */}
        <View style={styles.actions}>
          {isWon ? (
            <>
              <Pressable style={styles.shareBtn} onPress={handleShare}>
                <Text style={[styles.shareBtnText, { fontFamily: fonts.sansSemiBold }]}>
                  🎉 Share my win
                </Text>
              </Pressable>
              <Pressable style={styles.secondaryBtn} onPress={onDone}>
                <Text style={[styles.secondaryBtnText, { fontFamily: fonts.sans }]}>
                  Check another postcode
                </Text>
              </Pressable>
            </>
          ) : isLost ? (
            <>
              <Pressable
                style={styles.tribunalBtn}
                onPress={() =>
                  import("react-native").then(({ Linking }) =>
                    Linking.openURL("https://www.gov.uk/appeal-council-tax"),
                  )
                }
              >
                <Text style={[styles.tribunalBtnText, { fontFamily: fonts.sansSemiBold }]}>
                  Appeal to Valuation Tribunal →
                </Text>
              </Pressable>
              <Pressable style={styles.secondaryBtn} onPress={onDone}>
                <Text style={[styles.secondaryBtnText, { fontFamily: fonts.sans }]}>
                  Check another postcode
                </Text>
              </Pressable>
            </>
          ) : next ? (
            <Pressable
              style={[styles.advanceBtn, updating && styles.advanceBtnDisabled]}
              onPress={handleAdvance}
              disabled={updating}
            >
              <Text style={[styles.advanceBtnText, { fontFamily: fonts.sansSemiBold }]}>
                {updating ? "Updating…" : `Mark as: ${STATUS_LABELS[next]}`}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {/* Tip */}
        {!isTerminal ? (
          <View style={styles.tip}>
            <Text style={[styles.tipText, { fontFamily: fonts.sans }]}>
              Tap the button above when your status changes. The VOA usually responds within 2 months.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: 60 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
  loadingText: { fontSize: 14, color: editorial.colors.ink3 },
  emptyText: { fontSize: 15, color: editorial.colors.ink2, textAlign: "center" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  topTitle: { fontSize: 16, color: editorial.colors.ink },
  clearText: { fontSize: 13, color: editorial.colors.ink3 },

  // Win card
  winCard: {
    margin: 16,
    backgroundColor: editorial.colors.ink,
    borderRadius: 20,
    padding: 24,
    overflow: "hidden",
    position: "relative",
  },
  winGlow: {
    position: "absolute", top: -40, right: -40,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: "rgba(15, 92, 62, 0.40)",
  },
  winGlow2: {
    position: "absolute", bottom: -20, left: -20,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: "rgba(200, 67, 28, 0.18)",
  },
  winEmoji: { fontSize: 44, marginBottom: 10 },
  winTitle: {
    fontSize: 40, lineHeight: 42, letterSpacing: -0.8,
    color: editorial.colors.paper,
  },
  winSavingRow: {
    marginTop: 16, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: "rgba(244,239,229,0.12)", gap: 2,
  },
  winSavingLabel: {
    fontSize: 11, letterSpacing: 0.88, textTransform: "uppercase",
    color: "rgba(244,239,229,0.5)",
  },
  winSavingValue: {
    fontSize: 30, letterSpacing: -0.3, color: editorial.colors.paper, marginTop: 2,
  },
  winMeta: { fontSize: 11, color: "rgba(244,239,229,0.4)", marginTop: 8 },

  // Standard hero card
  heroCard: {
    margin: 16, flexDirection: "row", alignItems: "flex-start", gap: 14,
    backgroundColor: editorial.colors.paperCard,
    borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: editorial.colors.hairline,
  },
  heroCardMuted: { opacity: 0.7 },
  heroEmoji: { fontSize: 36, marginTop: 2 },
  heroBody: { flex: 1 },
  heroTitle: { fontSize: 20, color: editorial.colors.ink, lineHeight: 24 },
  heroSub: { fontSize: 13, lineHeight: 19, color: editorial.colors.ink2, marginTop: 4 },

  // Details row
  detailsRow: {
    flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 8,
  },
  detailChip: {
    flex: 1, backgroundColor: editorial.colors.paperCard,
    borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: editorial.colors.hairline,
    alignItems: "center",
  },
  detailLabel: { fontSize: 10, color: editorial.colors.ink3, textTransform: "uppercase", letterSpacing: 0.5 },
  detailValue: { fontSize: 13, color: editorial.colors.ink, marginTop: 3 },

  // Section
  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionLabel: {
    fontSize: 11, color: editorial.colors.ink3, letterSpacing: 0.88,
    textTransform: "uppercase", marginBottom: 16,
  },

  // Timeline
  timeline: { paddingLeft: 4 },
  timelineRow: { flexDirection: "row", gap: 14 },
  timelineLeft: { alignItems: "center", width: 22 },
  timelineDot: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: editorial.colors.hairline,
    borderWidth: 2, borderColor: editorial.colors.paper2,
    alignItems: "center", justifyContent: "center",
  },
  timelineDotDone: {
    backgroundColor: editorial.colors.forest,
    borderColor: editorial.colors.forest,
  },
  timelineDotCurrent: {
    backgroundColor: editorial.colors.accent,
    borderColor: editorial.colors.accent,
  },
  timelineDotLost: {
    backgroundColor: editorial.colors.ink3,
    borderColor: editorial.colors.ink3,
  },
  timelinePulse: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: editorial.colors.paper,
  },
  timelineCheck: { fontSize: 11, color: editorial.colors.paper, fontWeight: "700" },
  timelineLine: {
    width: 2, flex: 1, backgroundColor: editorial.colors.hairline,
    minHeight: 20, marginTop: 2,
  },
  timelineLineDone: { backgroundColor: editorial.colors.forest },
  timelineContent: { flex: 1, paddingTop: 2 },
  timelineTitle: { fontSize: 14, color: editorial.colors.ink2 },
  timelineFuture: { color: editorial.colors.ink3 },
  timelineCurrent: { color: editorial.colors.accent },
  timelineLostText: { color: editorial.colors.ink3 },
  timelineDesc: {
    fontSize: 12, lineHeight: 17, color: editorial.colors.ink3, marginTop: 3,
  },

  // Actions
  actions: { paddingHorizontal: 16, paddingTop: 24, gap: 10 },
  advanceBtn: {
    backgroundColor: editorial.colors.accent, borderRadius: 14,
    paddingVertical: 17, alignItems: "center",
    shadowColor: editorial.colors.accent, shadowOpacity: 0.3,
    shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 3,
  },
  advanceBtnDisabled: { opacity: 0.5 },
  advanceBtnText: { fontSize: 15, color: editorial.colors.paper },
  shareBtn: {
    backgroundColor: editorial.colors.forest, borderRadius: 14,
    paddingVertical: 17, alignItems: "center",
    shadowColor: editorial.colors.forest, shadowOpacity: 0.3,
    shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 3,
  },
  shareBtnText: { fontSize: 15, color: editorial.colors.paper },
  tribunalBtn: {
    backgroundColor: editorial.colors.ink, borderRadius: 14,
    paddingVertical: 17, alignItems: "center",
  },
  tribunalBtnText: { fontSize: 15, color: editorial.colors.paper },
  secondaryBtn: {
    paddingVertical: 14, alignItems: "center",
    borderRadius: 14, borderWidth: 1, borderColor: editorial.colors.hairline,
    backgroundColor: editorial.colors.paperCard,
  },
  secondaryBtnText: { fontSize: 14, color: editorial.colors.ink2 },

  // Tip
  tip: { marginHorizontal: 16, marginTop: 16 },
  tipText: { fontSize: 12, lineHeight: 18, color: editorial.colors.ink3, textAlign: "center" },

  doneBtn: {
    backgroundColor: editorial.colors.accent, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 28, alignItems: "center",
  },
  doneBtnText: { fontSize: 15, color: editorial.colors.paper },
});
