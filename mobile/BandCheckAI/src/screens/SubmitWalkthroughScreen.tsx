import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
} from "react-native";
import { PaperBackground } from "../components/editorial/PaperBackground";
import { editorial } from "../theme/editorial";
import type { EditorialFonts } from "../theme/editorial";

const VOA_URL = "https://www.gov.uk/challenge-council-tax-band";
const { width: SCREEN_W } = Dimensions.get("window");

type Props = {
  postcode: string;
  userBand: string;
  likelyBand?: string;
  email: string;
  fonts: EditorialFonts;
  onDone: (submitted: boolean) => void;
};

type Step = {
  id: string;
  stepNum: string;
  icon: string;
  title: string;
  titleEm: string;
  body: string;
  highlight?: string;
  tipLabel?: string;
  tip?: string;
};

function buildSteps(postcode: string, userBand: string, likelyBand: string | undefined, email: string): Step[] {
  const pc = postcode.replace(/\s+/g, "").toUpperCase().replace(/(.{3})$/, " $1");
  const target = likelyBand && likelyBand !== userBand ? `Band ${likelyBand}` : "a lower band";
  return [
    {
      id: "open",
      stepNum: "1 of 5",
      icon: "🌐",
      title: "Open the ",
      titleEm: "GOV website",
      body: "The challenge is free, takes about 10 minutes, and is done entirely online. Tap the button below to open the official page.",
      highlight: "gov.uk/challenge-council-tax-band",
      tipLabel: "Good to know",
      tip: "You don't need to create an account. Anyone can challenge their band.",
    },
    {
      id: "find",
      stepNum: "2 of 5",
      icon: "📍",
      title: "Find your ",
      titleEm: "property",
      body: `Enter your postcode to search for your address. When the list appears, select the entry that matches your home.`,
      highlight: pc,
      tipLabel: "Your postcode",
      tip: `Type "${pc}" exactly as shown above and press Search.`,
    },
    {
      id: "reason",
      stepNum: "3 of 5",
      icon: "📋",
      title: "Choose your ",
      titleEm: "reason",
      body: "You'll be asked why you think your band is wrong. Select the option about comparable properties nearby.",
      highlight: '"My band is too high compared with similar properties nearby"',
      tipLabel: "Which option to pick",
      tip: `Your comparable evidence shows nearby homes in ${target}, which is the strongest ground for a challenge.`,
    },
    {
      id: "evidence",
      stepNum: "4 of 5",
      icon: "📎",
      title: "Attach your ",
      titleEm: "evidence",
      body: "Upload the PDF evidence pack that was emailed to you. Open your email app, find the BandCheck AI email, and save the attached PDF.",
      highlight: email || "your inbox",
      tipLabel: "Where to find it",
      tip: "Search your inbox for 'BandCheck AI evidence pack'. The PDF is attached to the confirmation email.",
    },
    {
      id: "submit",
      stepNum: "5 of 5",
      icon: "✅",
      title: "Submit your ",
      titleEm: "challenge",
      body: "Review your details on the final page and tap Submit. The VOA will send an acknowledgement within 2 weeks and make a decision within 2 months.",
      tipLabel: "What happens next",
      tip: "If successful, your band is reduced and your council will issue a refund dating back to when you moved in.",
    },
  ];
}

export function SubmitWalkthroughScreen({
  postcode,
  userBand,
  likelyBand,
  email,
  fonts,
  onDone,
}: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const steps = buildSteps(postcode, userBand, likelyBand, email);
  const current = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const isFirst = stepIndex === 0;

  function goToStep(index: number) {
    const clamped = Math.max(0, Math.min(steps.length - 1, index));
    setStepIndex(clamped);
    flatListRef.current?.scrollToIndex({ index: clamped, animated: true });
    Animated.timing(progressAnim, {
      toValue: clamped / (steps.length - 1),
      duration: 250,
      useNativeDriver: false,
    }).start();
  }

  function handleNext() {
    if (isLast) return;
    goToStep(stepIndex + 1);
  }

  const renderStep = ({ item }: ListRenderItemInfo<Step>) => (
    <View style={[styles.slide, { width: SCREEN_W }]}>
      <ScrollView
        contentContainerStyle={styles.slideScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Big icon block */}
        <View style={styles.iconBlock}>
          <Text style={styles.iconEmoji}>{item.icon}</Text>
        </View>

        {/* Step chip */}
        <View style={styles.stepChip}>
          <Text style={[styles.stepChipText, { fontFamily: fonts.sansBold }]}>
            Step {item.stepNum}
          </Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, { fontFamily: fonts.serif }]}>
          {item.title}
          <Text style={[styles.titleEm, { fontFamily: fonts.serifItalic }]}>
            {item.titleEm}
          </Text>
        </Text>

        {/* Body */}
        <Text style={[styles.body, { fontFamily: fonts.sans }]}>{item.body}</Text>

        {/* Highlight box */}
        {item.highlight ? (
          <View style={styles.highlightBox}>
            <Text style={[styles.highlightText, { fontFamily: fonts.sansBold }]} selectable>
              {item.highlight}
            </Text>
          </View>
        ) : null}

        {/* Tip card */}
        {item.tip ? (
          <View style={styles.tipCard}>
            <Text style={[styles.tipLabel, { fontFamily: fonts.sansBold }]}>
              {item.tipLabel ?? "Tip"}
            </Text>
            <Text style={[styles.tipText, { fontFamily: fonts.sans }]}>{item.tip}</Text>
          </View>
        ) : null}

        {/* Open GOV button on step 1 */}
        {item.id === "open" ? (
          <Pressable
            style={styles.govButton}
            onPress={() => Linking.openURL(VOA_URL)}
          >
            <Text style={[styles.govButtonText, { fontFamily: fonts.sansSemiBold }]}>
              Open gov.uk/challenge-council-tax-band →
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );

  return (
    <PaperBackground>
      <View style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          {!isFirst ? (
            <Pressable onPress={() => goToStep(stepIndex - 1)} style={styles.backBtn} hitSlop={12}>
              <Text style={[styles.backText, { fontFamily: fonts.sans }]}>← Back</Text>
            </Pressable>
          ) : (
            <View style={styles.backBtn} />
          )}
          <Text style={[styles.topTitle, { fontFamily: fonts.sansSemiBold }]}>
            How to submit
          </Text>
          <Pressable onPress={() => onDone(false)} hitSlop={12} style={styles.skipBtn}>
            <Text style={[styles.skipText, { fontFamily: fonts.sans }]}>Skip</Text>
          </Pressable>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["20%", "100%"],
                }),
              },
            ]}
          />
        </View>

        {/* Step slides */}
        <FlatList
          ref={flatListRef}
          data={steps}
          renderItem={renderStep}
          keyExtractor={(s) => s.id}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          getItemLayout={(_, index) => ({
            length: SCREEN_W,
            offset: SCREEN_W * index,
            index,
          })}
          style={styles.flatList}
        />

        {/* Dot indicators */}
        <View style={styles.dots}>
          {steps.map((s, i) => (
            <Pressable key={s.id} onPress={() => goToStep(i)} hitSlop={8}>
              <View
                style={[
                  styles.dot,
                  i === stepIndex && styles.dotActive,
                  i < stepIndex && styles.dotPast,
                ]}
              />
            </Pressable>
          ))}
        </View>

        {/* Bottom actions */}
        <View style={styles.footer}>
          {isLast ? (
            <>
              <Pressable style={styles.submitBtn} onPress={() => onDone(true)}>
                <Text style={[styles.submitBtnText, { fontFamily: fonts.sansSemiBold }]}>
                  I've submitted my appeal ✓
                </Text>
              </Pressable>
              <Pressable style={styles.laterLink} onPress={() => onDone(false)}>
                <Text style={[styles.laterText, { fontFamily: fonts.sans }]}>
                  I'll do this later
                </Text>
              </Pressable>
            </>
          ) : (
            <Pressable style={styles.nextBtn} onPress={handleNext}>
              <Text style={[styles.nextBtnText, { fontFamily: fonts.sansSemiBold }]}>
                Next step →
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: {
    width: 60,
  },
  backText: {
    fontSize: 14,
    color: editorial.colors.ink2,
  },
  topTitle: {
    fontSize: 14,
    color: editorial.colors.ink,
    letterSpacing: 0.2,
  },
  skipBtn: {
    width: 60,
    alignItems: "flex-end",
  },
  skipText: {
    fontSize: 14,
    color: editorial.colors.ink3,
  },
  progressTrack: {
    height: 3,
    marginHorizontal: 20,
    backgroundColor: editorial.colors.hairline,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: editorial.colors.accent,
    borderRadius: 2,
  },
  flatList: {
    flex: 1,
  },
  slide: {
    flex: 1,
  },
  slideScroll: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    gap: 16,
  },
  iconBlock: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: editorial.colors.paperCard,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
    alignItems: "center",
    justifyContent: "center",
  },
  iconEmoji: {
    fontSize: 36,
  },
  stepChip: {
    alignSelf: "flex-start",
    backgroundColor: editorial.colors.chipAccentBg,
    borderRadius: editorial.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stepChipText: {
    fontSize: 11,
    color: editorial.colors.accent,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.68,
    color: editorial.colors.ink,
  },
  titleEm: {
    color: editorial.colors.accent,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    color: editorial.colors.ink2,
  },
  highlightBox: {
    backgroundColor: editorial.colors.ink,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  highlightText: {
    fontSize: 14,
    color: editorial.colors.paper,
    lineHeight: 20,
  },
  tipCard: {
    backgroundColor: editorial.colors.paperCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
    padding: 16,
    gap: 6,
  },
  tipLabel: {
    fontSize: 11,
    color: editorial.colors.forest,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  tipText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: editorial.colors.ink2,
  },
  govButton: {
    backgroundColor: editorial.colors.forest,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 4,
  },
  govButtonText: {
    fontSize: 14,
    color: editorial.colors.paper,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: editorial.colors.hairline,
  },
  dotActive: {
    width: 20,
    backgroundColor: editorial.colors.accent,
  },
  dotPast: {
    backgroundColor: editorial.colors.ink3,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 4,
    gap: 10,
  },
  nextBtn: {
    backgroundColor: editorial.colors.accent,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    shadowColor: editorial.colors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  nextBtnText: {
    fontSize: 15,
    color: editorial.colors.paper,
  },
  submitBtn: {
    backgroundColor: editorial.colors.forest,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    shadowColor: editorial.colors.forest,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  submitBtnText: {
    fontSize: 15,
    color: editorial.colors.paper,
  },
  laterLink: {
    alignItems: "center",
    paddingVertical: 6,
  },
  laterText: {
    fontSize: 14,
    color: editorial.colors.ink3,
    textDecorationLine: "underline",
  },
});
