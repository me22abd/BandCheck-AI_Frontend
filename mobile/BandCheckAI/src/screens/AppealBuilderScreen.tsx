import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AppealStepper } from "../components/editorial/AppealStepper";
import { EditorialFooter } from "../components/editorial/EditorialFooter";
import { EditorialPrimaryButton } from "../components/editorial/EditorialPrimaryButton";
import { EditorialSecondaryButton } from "../components/editorial/EditorialSecondaryButton";
import { IconBack, IconCheck } from "../components/editorial/Icons";
import { IconButton } from "../components/editorial/IconButton";
import { PaperBackground } from "../components/editorial/PaperBackground";
import { SmallChip } from "../components/editorial/SmallChip";
import { TopBar } from "../components/editorial/TopBar";
import { getAppealSummary, formatGbp } from "../lib/appealEstimates";
import { formatPostcode } from "../lib/postcode";
import { isBandLowerThan, type NearbyProperty } from "../lib/scoring";
import { editorial } from "../theme/editorial";
import type { EditorialFonts } from "../theme/editorial";

type Step = 1 | 2 | 3 | 4;

type PropertyDetails = {
  propertyType: "house" | "flat" | "other" | "";
  ownership: "owner" | "tenant" | "";
  extensions: "yes" | "no" | "";
  notes: string;
};

type EvidenceState = {
  councilTaxBill: boolean;
  propertyPhotos: boolean;
  floorplan: boolean;
  extensionHistory: boolean;
  notes: string;
};

type Props = {
  postcode: string;
  userBand: string;
  nearbyProperties: NearbyProperty[];
  email: string;
  fonts: EditorialFonts;
  onBack: () => void;
  /** Called when user taps Submit — passes the likelyBand so the walkthrough can use it */
  onSubmit: (likelyBand: string | undefined) => void;
  onFinish: () => void;
};

const STEP_HEAD: Record<Step, { chip: string; title: string; titleEm?: string; sub: string }> = {
  1: {
    chip: "Step 1 of 4",
    title: "Appeal ",
    titleEm: "details",
    sub: "Let's start with basic information.",
  },
  2: {
    chip: "Step 2 of 4",
    title: "Your ",
    titleEm: "evidence",
    sub: "We've pulled this automatically. Review & add anything else.",
  },
  3: {
    chip: "Step 3 of 4",
    title: "Review your ",
    titleEm: "case",
    sub: "Check your details before generating your pack.",
  },
  4: {
    chip: "Step 4 of 4",
    title: "Appeal ",
    titleEm: "pack",
    sub: "Your submission summary and next steps.",
  },
};

export function AppealBuilderScreen({
  postcode,
  userBand,
  nearbyProperties,
  email,
  fonts,
  onBack,
  onSubmit,
  onFinish,
}: Props) {
  const [step, setStep] = useState<Step>(1);
  const [finished, setFinished] = useState(false);
  const formatted = useMemo(() => formatPostcode(postcode), [postcode]);
  const compCount = nearbyProperties.length;

  const summary = useMemo(
    () => getAppealSummary(userBand, nearbyProperties),
    [userBand, nearbyProperties],
  );

  const [property, setProperty] = useState<PropertyDetails>({
    propertyType: "",
    ownership: "",
    extensions: "",
    notes: "",
  });

  const [evidence, setEvidence] = useState<EvidenceState>({
    councilTaxBill: false,
    propertyPhotos: false,
    floorplan: false,
    extensionHistory: false,
    notes: "",
  });

  const comparables = useMemo(
    () => nearbyProperties.filter((p) => isBandLowerThan(p.band, userBand)).slice(0, 5),
    [nearbyProperties, userBand],
  );

  const canProceedStep1 =
    property.propertyType !== "" && property.ownership !== "" && property.extensions !== "";

  const head = STEP_HEAD[step];

  function goNext() {
    if (step === 1 && !canProceedStep1) return;
    if (step === 4) {
      setFinished(true);
      return;
    }
    setStep((s) => Math.min(4, s + 1) as Step);
  }

  function goPrev() {
    if (step === 1) onBack();
    else setStep((s) => Math.max(1, s - 1) as Step);
  }

  const primaryLabel =
    step === 4 ? "Done" : step === 3 ? "Generate pack" : "Continue to review";

  if (finished) {
    return (
      <PaperBackground>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.finishScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero success card */}
          <View style={styles.finishHeroCard}>
            <View style={styles.finishGlow} pointerEvents="none" />
            <View style={styles.finishGlow2} pointerEvents="none" />
            <View style={styles.finishIconWrap}>
              <IconCheck size={22} color={editorial.colors.paper} />
            </View>
            <Text style={[styles.finishTitle, { fontFamily: fonts.serif }]}>
              Your appeal{"\n"}pack is{" "}
              <Text style={[styles.finishTitleEm, { fontFamily: fonts.serifItalic }]}>
                ready
              </Text>
            </Text>
            {summary.annualSaving > 0 ? (
              <View style={styles.finishSavingRow}>
                <Text style={[styles.finishSavingLabel, { fontFamily: fonts.sans }]}>
                  potential saving
                </Text>
                <Text style={[styles.finishSavingValue, { fontFamily: fonts.serif }]}>
                  {formatGbp(summary.annualSaving)} / yr
                </Text>
              </View>
            ) : null}
            <Text style={[styles.finishMeta, { fontFamily: fonts.mono }]}>
              {formatted} · Band {summary.userBand}
              {summary.likelyBand !== summary.userBand ? ` → ${summary.likelyBand}` : ""}
            </Text>
          </View>

          {/* What's included */}
          <View style={styles.finishSection}>
            <Text style={[styles.finishSectionLabel, { fontFamily: fonts.sansSemiBold }]}>
              What&apos;s in your pack
            </Text>
            <View style={styles.listCard}>
              {[
                { t: `${comparables.length} comparable properties`, d: "Band evidence · Land Registry" },
                { t: "Draft appeal letter", d: "Pre-filled · ready to submit" },
                { t: "Your property details", d: `${property.propertyType} · ${property.ownership}` },
                ...(email ? [{ t: "Evidence pack", d: `Emailed to ${email}` }] : []),
              ].map((row, i) => (
                <View key={row.t} style={[styles.listRow, i > 0 && styles.listRowBorder]}>
                  <View style={[styles.listIcon, styles.listIconAuto]}>
                    <IconCheck size={13} color={editorial.colors.forest} />
                  </View>
                  <View style={styles.listBody}>
                    <Text style={[styles.listTitle, { fontFamily: fonts.sans }]}>{row.t}</Text>
                    <Text style={[styles.listSub, { fontFamily: fonts.sans }]}>{row.d}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Next steps */}
          <View style={styles.finishSection}>
            <Text style={[styles.finishSectionLabel, { fontFamily: fonts.sansSemiBold }]}>
              How to submit to the VOA
            </Text>
            <View style={styles.card}>
              {[
                "Visit gov.uk/challenge-council-tax-band",
                'Select "Challenge your council tax band"',
                "Enter your postcode and upload your evidence",
                "The VOA will respond within 2 months",
              ].map((s, i) => (
                <View key={s} style={[styles.stepRow, i > 0 && { borderTopWidth: 0, paddingTop: 4 }]}>
                  <Text style={[styles.stepNum, { fontFamily: fonts.serif }]}>{i + 1}.</Text>
                  <Text style={[styles.stepText, { fontFamily: fonts.sans }]}>{s}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* PDF inbox confirmation */}
          {email ? (
            <View style={styles.finishSection}>
              <View style={styles.inboxCard}>
                <Text style={styles.inboxIcon}>📧</Text>
                <View style={styles.inboxBody}>
                  <Text style={[styles.inboxTitle, { fontFamily: fonts.sansSemiBold }]}>
                    PDF sent to your inbox
                  </Text>
                  <Text style={[styles.inboxEmail, { fontFamily: fonts.mono }]} numberOfLines={1}>
                    {email}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}
          <View style={styles.finishSection}>
            <Pressable
              onPress={() => onSubmit(
                summary.likelyBand !== summary.userBand ? summary.likelyBand : undefined
              )}
              style={styles.voaButton}
            >
              <Text style={[styles.voaButtonText, { fontFamily: fonts.sansSemiBold }]}>
                How to submit to the VOA →
              </Text>
            </Pressable>
          </View>

          {/* Reset */}
          <View style={[styles.finishSection, { paddingBottom: 48 }]}>
            <Pressable onPress={onFinish} style={styles.resetLink}>
              <Text style={[styles.resetLinkText, { fontFamily: fonts.sans }]}>
                Check another postcode
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </PaperBackground>
    );
  }

  return (
    <PaperBackground>
      <View style={styles.flex}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TopBar
            fonts={fonts}
            left={
              <IconButton onPress={goPrev}>
                <IconBack color={editorial.colors.ink} />
              </IconButton>
            }
            title="Build appeal"
            right={
              <Text style={[styles.save, { fontFamily: fonts.sans }]}>Save</Text>
            }
          />

          <AppealStepper currentStep={step} fonts={fonts} />

          <View style={styles.head}>
            <SmallChip fonts={fonts}>{head.chip}</SmallChip>
            <Text style={[styles.title, { fontFamily: fonts.serif }]}>
              {head.title}
              {head.titleEm ? (
                <Text style={[styles.titleEm, { fontFamily: fonts.serifItalic }]}>
                  {head.titleEm}
                </Text>
              ) : null}
            </Text>
            <Text style={[styles.sub, { fontFamily: fonts.sans }]}>{head.sub}</Text>
          </View>

          {step === 1 ? (
            <View style={styles.block}>
              <View style={styles.card}>
                <Text style={[styles.cardKicker, { fontFamily: fonts.sansSemiBold }]}>
                  Property address
                </Text>
                <Text style={[styles.cardValue, { fontFamily: fonts.sans }]}>
                  {formatted} · Band {userBand}
                </Text>
                <Text style={[styles.cardHint, { fontFamily: fonts.mono }]}>{email}</Text>
              </View>

              <PillGroup
                label="Property type"
                fonts={fonts}
                options={[
                  { key: "house", label: "House" },
                  { key: "flat", label: "Flat" },
                  { key: "other", label: "Other" },
                ]}
                value={property.propertyType}
                onChange={(v) => setProperty((p) => ({ ...p, propertyType: v }))}
              />
              <PillGroup
                label="Ownership"
                fonts={fonts}
                options={[
                  { key: "owner", label: "Owner" },
                  { key: "tenant", label: "Tenant" },
                ]}
                value={property.ownership}
                onChange={(v) => setProperty((p) => ({ ...p, ownership: v }))}
              />
              <PillGroup
                label="Extensions since 1993?"
                fonts={fonts}
                options={[
                  { key: "yes", label: "Yes" },
                  { key: "no", label: "No" },
                ]}
                value={property.extensions}
                onChange={(v) => setProperty((p) => ({ ...p, extensions: v }))}
              />
            </View>
          ) : null}

          {step === 2 ? (
            <View style={styles.block}>
              <View style={styles.listCard}>
                {[
                  {
                    t: `${compCount} comparable properties`,
                    d: "Auto-pulled · Land Registry",
                    auto: true,
                  },
                  {
                    t: "Historical valuation (1991)",
                    d: `Indexed · ${formatGbp(summary.currentAnnual)} / yr · band ${summary.userBand}`,
                    auto: true,
                  },
                  {
                    t: "Sale price evidence",
                    d: summary.likelyBand !== summary.userBand
                      ? `Band ${summary.likelyBand} comparables · ${formatGbp(summary.reducedAnnual)} / yr`
                      : "Comparable band data · Land Registry",
                    auto: true,
                  },
                  { t: "Your statement", d: "Why you think the band is wrong", auto: false },
                ].map((row, i) => (
                  <View key={row.t} style={[styles.listRow, i > 0 && styles.listRowBorder]}>
                    <View style={[styles.listIcon, row.auto ? styles.listIconAuto : styles.listIconAdd]}>
                      {row.auto ? (
                        <IconCheck size={14} color={editorial.colors.forest} />
                      ) : (
                        <Text style={[styles.plus, { fontFamily: fonts.sansBold }]}>+</Text>
                      )}
                    </View>
                    <View style={styles.listBody}>
                      <Text style={[styles.listTitle, { fontFamily: fonts.sans }]}>{row.t}</Text>
                      <Text style={[styles.listSub, { fontFamily: fonts.sans }]}>{row.d}</Text>
                    </View>
                    {row.auto ? (
                      <SmallChip tone="forest" fonts={fonts}>
                        auto
                      </SmallChip>
                    ) : (
                      <Text style={[styles.addLink, { fontFamily: fonts.sans }]}>Add</Text>
                    )}
                  </View>
                ))}
              </View>

              <View style={styles.letterCard}>
                <View style={styles.letterHeader}>
                  <Text style={[styles.letterKicker, { fontFamily: fonts.sansSemiBold }]}>
                    Draft letter
                  </Text>
                  <Text style={[styles.letterEdit, { fontFamily: fonts.serifItalic }]}>
                    edit ↗
                  </Text>
                </View>
                <Text style={[styles.letterBody, { fontFamily: fonts.serif }]}>
                  To the Valuation Office Agency,{"\n\n"}
                  I am writing to formally challenge the council tax band assigned to{" "}
                  <Text style={[styles.letterStrong, { fontFamily: fonts.serif }]}>
                    {formatted}
                  </Text>
                  . The property is currently in band {userBand}, but evidence from comparable
                  homes…
                </Text>
                <Text style={[styles.letterFoot, { fontFamily: fonts.sans }]}>
                  2 pages · 6 citations · ready to submit
                </Text>
              </View>
            </View>
          ) : null}

          {step === 3 ? (
            <View style={styles.block}>
              <View style={styles.card}>
                <Text style={[styles.cardKicker, { fontFamily: fonts.sansSemiBold }]}>Details</Text>
                <Text style={[styles.cardValue, { fontFamily: fonts.sans }]}>
                  {property.propertyType || "—"} · {property.ownership || "—"} · extensions{" "}
                  {property.extensions || "—"}
                </Text>
              </View>
              <View style={styles.card}>
                <Text style={[styles.cardKicker, { fontFamily: fonts.sansSemiBold }]}>
                  Evidence selected
                </Text>
                {[
                  evidence.councilTaxBill && "Council tax bill",
                  evidence.propertyPhotos && "Property photos",
                  evidence.floorplan && "Floorplan",
                  evidence.extensionHistory && "Extension history",
                ]
                  .filter(Boolean)
                  .map((item) => (
                    <Text key={String(item)} style={[styles.cardValue, { fontFamily: fonts.sans }]}>
                      {item}
                    </Text>
                  ))}
                {!evidence.councilTaxBill &&
                !evidence.propertyPhotos &&
                !evidence.floorplan &&
                !evidence.extensionHistory ? (
                  <Text style={[styles.cardHint, { fontFamily: fonts.sans }]}>None selected</Text>
                ) : null}
              </View>
              {comparables.length > 0 ? (
                <View style={styles.listCard}>
                  {comparables.map((row, i) => (
                    <View
                      key={`${row.address}-${i}`}
                      style={[styles.listRow, i > 0 && styles.listRowBorder]}
                    >
                      <Text style={[styles.listTitle, { fontFamily: fonts.sans }]}>
                        {row.address}
                      </Text>
                      <Text style={[styles.listSub, { fontFamily: fonts.mono }]}>
                        Band {row.band}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}

          {step === 4 ? (
            <View style={styles.block}>
              <View style={styles.doneCard}>
                <View style={styles.doneGlow} pointerEvents="none" />
                <View style={styles.doneHeader}>
                  <View style={styles.doneIcon}>
                    <IconCheck size={16} color={editorial.colors.paper} />
                  </View>
                  <Text style={[styles.doneTitle, { fontFamily: fonts.serif }]}>
                    Pack generated
                  </Text>
                </View>
                <View style={styles.doneMeta}>
                  <Text style={[styles.doneMetaText, { fontFamily: fonts.mono }]}>
                    {formatted} · Band {summary.userBand}
                    {summary.likelyBand !== summary.userBand
                      ? ` → Band ${summary.likelyBand}`
                      : ""}
                  </Text>
                  {summary.annualSaving > 0 ? (
                    <Text style={[styles.doneSaving, { fontFamily: fonts.serif }]}>
                      Up to {formatGbp(summary.annualSaving)} / year
                    </Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.card}>
                <Text style={[styles.cardKicker, { fontFamily: fonts.sansSemiBold }]}>
                  Submission summary
                </Text>
                <Text style={[styles.cardValue, { fontFamily: fonts.sans }]}>
                  {formatted} · Band {summary.userBand}
                  {summary.likelyBand !== summary.userBand ? ` → ${summary.likelyBand}` : ""}
                </Text>
                {email ? (
                  <Text style={[styles.cardHint, { fontFamily: fonts.mono }]}>{email}</Text>
                ) : null}
                <Text style={[styles.cardHint, { fontFamily: fonts.sans }]}>
                  {property.propertyType} · {property.ownership} · extensions{" "}
                  {property.extensions}
                </Text>
              </View>
              {email ? (
                <View style={styles.inboxCard}>
                  <Text style={styles.inboxIcon}>📧</Text>
                  <View style={styles.inboxBody}>
                    <Text style={[styles.inboxTitle, { fontFamily: fonts.sansSemiBold }]}>
                      PDF evidence pack sent
                    </Text>
                    <Text style={[styles.inboxEmail, { fontFamily: fonts.mono }]} numberOfLines={1}>
                      {email}
                    </Text>
                  </View>
                </View>
              ) : null}
              <Text style={[styles.doneHint, { fontFamily: fonts.sans }]}>
                Tap <Text style={{ fontWeight: "600" }}>Done</Text> to see your full pack and
                submit to the VOA.
              </Text>
            </View>
          ) : null}

          {step === 2 ? (
            <View style={styles.evidenceChecks}>
              <View style={styles.card}>
                <Text style={[styles.cardKicker, { fontFamily: fonts.sansSemiBold }]}>
                  Additional documents
                </Text>
                {(
                  [
                    ["Council tax bill", "councilTaxBill"],
                    ["Property photos", "propertyPhotos"],
                    ["Floorplan", "floorplan"],
                    ["Extension history", "extensionHistory"],
                  ] as const
                ).map(([label, key]) => (
                  <CheckboxRow
                    key={key}
                    label={label}
                    value={evidence[key]}
                    fonts={fonts}
                    onChange={(next) => setEvidence((e) => ({ ...e, [key]: next }))}
                  />
                ))}
                <TextInput
                  value={evidence.notes}
                  onChangeText={(notes) => setEvidence((e) => ({ ...e, notes }))}
                  placeholder="Notes (optional)"
                  placeholderTextColor={editorial.colors.ink3}
                  multiline
                  style={[styles.textarea, { fontFamily: fonts.sans }]}
                />
              </View>
            </View>
          ) : null}
        </ScrollView>

        <EditorialFooter row>
          <EditorialSecondaryButton
            label="Back"
            onPress={goPrev}
            fonts={fonts}
            style={styles.backBtn}
          />
          <EditorialPrimaryButton
            label={primaryLabel}
            onPress={goNext}
            disabled={step === 1 && !canProceedStep1}
            fonts={fonts}
            style={styles.nextBtn}
          />
        </EditorialFooter>
      </View>
    </PaperBackground>
  );
}

function PillGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  fonts,
}: {
  label: string;
  options: { key: T; label: string }[];
  value: T | "";
  onChange: (v: T) => void;
  fonts: EditorialFonts;
}) {
  return (
    <View style={styles.pillSection}>
      <Text style={[styles.pillLabel, { fontFamily: fonts.sansSemiBold }]}>{label}</Text>
      <View style={styles.pillsRow}>
        {options.map((opt) => {
          const active = value === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => onChange(opt.key)}
              style={[styles.pill, active && styles.pillActive]}
            >
              <Text
                style={[
                  styles.pillText,
                  { fontFamily: fonts.sansSemiBold },
                  active && styles.pillTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function CheckboxRow({
  label,
  value,
  onChange,
  fonts,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
  fonts: EditorialFonts;
}) {
  return (
    <Pressable onPress={() => onChange(!value)} style={styles.checkboxRow}>
      <View style={[styles.checkbox, value && styles.checkboxOn]}>
        {value ? <IconCheck size={12} color={editorial.colors.accent} /> : null}
      </View>
      <Text style={[styles.checkboxLabel, { fontFamily: fonts.sans }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    paddingBottom: 120,
  },
  save: {
    fontSize: 12,
    color: editorial.colors.ink3,
  },
  head: {
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  title: {
    marginTop: 12,
    fontSize: 32,
    lineHeight: 32.6,
    letterSpacing: -0.64,
    color: editorial.colors.ink,
  },
  titleEm: {
    color: editorial.colors.accent,
  },
  sub: {
    marginTop: 6,
    fontSize: 13.5,
    lineHeight: 20.25,
    color: editorial.colors.ink2,
  },
  block: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 16,
  },
  card: {
    backgroundColor: editorial.colors.paperCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
  },
  cardKicker: {
    fontSize: 11,
    color: editorial.colors.ink3,
    letterSpacing: 0.88,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: "500",
    color: editorial.colors.ink,
    marginTop: 4,
  },
  cardHint: {
    fontSize: 12,
    lineHeight: 17,
    color: editorial.colors.ink2,
    marginTop: 6,
  },
  pillSection: {
    backgroundColor: editorial.colors.paperCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
  },
  pillLabel: {
    fontSize: 12,
    color: editorial.colors.ink3,
    marginBottom: 8,
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    borderRadius: editorial.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
    backgroundColor: editorial.colors.paperCard,
  },
  pillActive: {
    backgroundColor: editorial.colors.accent,
    borderColor: editorial.colors.accent,
  },
  pillText: {
    fontSize: 13,
    color: editorial.colors.ink,
  },
  pillTextActive: {
    color: editorial.colors.paper,
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
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  listRowBorder: {
    borderTopWidth: 1,
    borderTopColor: editorial.colors.hairline,
  },
  listIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  listIconAuto: {
    backgroundColor: editorial.colors.chipForestBg,
  },
  listIconAdd: {
    backgroundColor: editorial.colors.chipAccentBg,
  },
  plus: {
    fontSize: 16,
    color: editorial.colors.accent,
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
  listSub: {
    fontSize: 12,
    color: editorial.colors.ink3,
    marginTop: 1,
  },
  addLink: {
    fontSize: 12,
    fontWeight: "500",
    color: editorial.colors.accent,
  },
  letterCard: {
    backgroundColor: editorial.colors.paperCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
  },
  letterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 10,
  },
  letterKicker: {
    fontSize: 11,
    color: editorial.colors.ink3,
    letterSpacing: 0.88,
    textTransform: "uppercase",
  },
  letterEdit: {
    fontSize: 13,
    color: editorial.colors.accent,
  },
  letterBody: {
    fontSize: 13.5,
    lineHeight: 20.25,
    color: editorial.colors.ink2,
  },
  letterStrong: {
    color: editorial.colors.ink,
    fontWeight: "500",
  },
  letterFoot: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderTopColor: editorial.colors.hairline,
    fontSize: 11,
    color: editorial.colors.ink3,
  },
  evidenceChecks: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
    backgroundColor: editorial.colors.paperCard,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: {
    borderColor: editorial.colors.accent,
    backgroundColor: editorial.colors.chipAccentBg,
  },
  checkboxLabel: {
    fontSize: 13,
    color: editorial.colors.ink,
    fontWeight: "500",
  },
  textarea: {
    minHeight: 88,
    marginTop: 8,
    borderRadius: editorial.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 13,
    lineHeight: 18,
    color: editorial.colors.ink,
    backgroundColor: editorial.colors.inputBg,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
    textAlignVertical: "top",
  },
  backBtn: {
    flex: 0.38,
  },
  nextBtn: {
    flex: 1,
  },
  doneHint: {
    marginTop: 4,
    paddingHorizontal: 4,
    fontSize: 13,
    lineHeight: 19,
    color: editorial.colors.ink3,
    textAlign: "center",
  },
  doneCard: {
    backgroundColor: editorial.colors.ink,
    borderRadius: 16,
    padding: 18,
    overflow: "hidden",
    position: "relative",
  },
  doneGlow: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(15, 92, 62, 0.35)",
  },
  doneHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  doneIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: editorial.colors.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  doneTitle: {
    fontSize: 22,
    color: editorial.colors.paper,
  },
  doneMeta: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(244, 239, 229, 0.12)",
    gap: 4,
  },
  doneMetaText: {
    fontSize: 12,
    color: "rgba(244, 239, 229, 0.6)",
  },
  doneSaving: {
    fontSize: 20,
    color: editorial.colors.paper,
  },
  stepRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 6,
  },
  stepNum: {
    width: 18,
    fontSize: 15,
    lineHeight: 18,
    color: editorial.colors.accent,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19.5,
    color: editorial.colors.ink2,
  },
  voaButton: {
    borderRadius: 12,
    backgroundColor: editorial.colors.accent,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: editorial.colors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  voaButtonText: {
    fontSize: 15,
    color: editorial.colors.paper,
  },
  // --- Finish screen ---
  finishScroll: {
    paddingBottom: 80,
  },
  finishHeroCard: {
    margin: 16,
    backgroundColor: editorial.colors.ink,
    borderRadius: 20,
    padding: 24,
    overflow: "hidden",
    position: "relative",
  },
  finishGlow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(15, 92, 62, 0.35)",
  },
  finishGlow2: {
    position: "absolute",
    bottom: -20,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(200, 67, 28, 0.15)",
  },
  finishIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: editorial.colors.forest,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  finishTitle: {
    fontSize: 38,
    lineHeight: 40,
    letterSpacing: -0.76,
    color: editorial.colors.paper,
  },
  finishTitleEm: {
    color: "rgba(200, 67, 28, 0.9)",
  },
  finishSavingRow: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(244, 239, 229, 0.12)",
    gap: 2,
  },
  finishSavingLabel: {
    fontSize: 11,
    letterSpacing: 0.88,
    textTransform: "uppercase",
    color: "rgba(244, 239, 229, 0.5)",
  },
  finishSavingValue: {
    fontSize: 28,
    letterSpacing: -0.28,
    color: editorial.colors.paper,
    marginTop: 2,
  },
  finishMeta: {
    marginTop: 8,
    fontSize: 11,
    color: "rgba(244, 239, 229, 0.45)",
  },
  finishSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  finishSectionLabel: {
    fontSize: 11,
    letterSpacing: 0.88,
    textTransform: "uppercase",
    color: editorial.colors.ink3,
    marginBottom: 10,
  },
  inboxCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: editorial.colors.chipForestBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(15, 92, 62, 0.20)",
    padding: 14,
  },
  inboxIcon: {
    fontSize: 26,
  },
  inboxBody: {
    flex: 1,
    minWidth: 0,
  },
  inboxTitle: {
    fontSize: 14,
    color: editorial.colors.forest,
  },
  inboxEmail: {
    fontSize: 12,
    color: editorial.colors.ink2,
    marginTop: 2,
  },
  resetLink: {
    paddingVertical: 16,
    alignItems: "center",
  },
  resetLinkText: {
    fontSize: 14,
    color: editorial.colors.ink3,
    textDecorationLine: "underline",
  },
});
