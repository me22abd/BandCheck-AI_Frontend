import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
} from "react-native";
import { PaperBackground } from "../components/editorial/PaperBackground";
import { useAppContext } from "../context/AppContext";
import { editorial } from "../theme/editorial";

const { width: W } = Dimensions.get("window");

type Slide = {
  key: string;
  emoji: string;
  title: string;
  body: string;
};

const SLIDES: Slide[] = [
  {
    key: "s1",
    emoji: "🏠",
    title: "Are you paying too much council tax?",
    body: "1 in 3 UK homes are placed in the wrong band — meaning millions of households overpay by hundreds of pounds every year.",
  },
  {
    key: "s2",
    emoji: "📊",
    title: "We compare your home to your neighbours",
    body: "BandCheck AI analyses comparable properties in your area using real VOA data to see if your band stacks up.",
  },
  {
    key: "s3",
    emoji: "📨",
    title: "We build your appeal pack for free",
    body: "If you have a case, we draft your appeal letter and evidence pack automatically. No solicitors. No upfront cost.",
  },
];

type Props = {
  onDone: () => void;
};

export function OnboardingScreen({ onDone }: Props) {
  const { fonts } = useAppContext();
  const [index, setIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  function goTo(i: number) {
    flatListRef.current?.scrollToIndex({ index: i, animated: true });
    Animated.timing(progressAnim, {
      toValue: i / (SLIDES.length - 1),
      duration: 280,
      useNativeDriver: false,
    }).start();
    setIndex(i);
  }

  function handleNext() {
    if (index < SLIDES.length - 1) {
      goTo(index + 1);
    } else {
      onDone();
    }
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["33%", "100%"],
  });

  function renderItem({ item }: ListRenderItemInfo<Slide>) {
    return (
      <View style={styles.slide}>
        <View style={styles.emojiWrap}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>
        <Text style={[styles.title, { fontFamily: fonts.serif }]}>{item.title}</Text>
        <Text style={[styles.body, { fontFamily: fonts.sans }]}>{item.body}</Text>
      </View>
    );
  }

  return (
    <PaperBackground>
      <View style={styles.container}>
        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderItem}
          keyExtractor={(s) => s.key}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          style={styles.list}
        />

        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.footer}>
          <Pressable style={styles.nextBtn} onPress={handleNext}>
            <Text style={[styles.nextBtnText, { fontFamily: fonts.sansSemiBold }]}>
              {index < SLIDES.length - 1 ? "Next →" : "Get started →"}
            </Text>
          </Pressable>
          {index < SLIDES.length - 1 ? (
            <Pressable onPress={onDone} style={styles.skipBtn} hitSlop={12}>
              <Text style={[styles.skipText, { fontFamily: fonts.sans }]}>Skip</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressTrack: {
    height: 3,
    backgroundColor: editorial.colors.paper2,
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: editorial.colors.accent,
    borderRadius: 2,
  },
  list: { flex: 1 },
  slide: {
    width: W,
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 20,
    justifyContent: "center",
  },
  emojiWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: editorial.colors.paper2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  emoji: { fontSize: 40 },
  title: {
    fontSize: 28,
    lineHeight: 34,
    color: editorial.colors.ink,
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: editorial.colors.ink2,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingBottom: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: editorial.colors.paper2,
  },
  dotActive: {
    backgroundColor: editorial.colors.accent,
    width: 18,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 14,
    alignItems: "center",
  },
  nextBtn: {
    width: "100%",
    backgroundColor: editorial.colors.accent,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: editorial.colors.accent,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  nextBtnText: { fontSize: 16, color: editorial.colors.paper },
  skipBtn: { paddingVertical: 4 },
  skipText: { fontSize: 14, color: editorial.colors.ink3 },
});
