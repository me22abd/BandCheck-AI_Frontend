import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { PaperBackground } from "../components/editorial/PaperBackground";
import { TopBar } from "../components/editorial/TopBar";
import { Wordmark } from "../components/editorial/Wordmark";
import { BandPill } from "../components/editorial/BandPill";
import { useAppContext } from "../context/AppContext";
import {
  deleteCase,
  listCases,
  STATUS_COLORS,
  STATUS_LABELS,
  type SavedCase,
} from "../lib/casesStore";
import { bandKey, formatGbp } from "../lib/appealEstimates";
import { formatPostcode } from "../lib/postcode";
import { editorial } from "../theme/editorial";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "MyCases">;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function MyCasesScreen({ navigation }: Props) {
  const { fonts } = useAppContext();
  const [cases, setCases] = useState<SavedCase[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const data = await listCases();
    setCases(data);
  }

  // Reload every time the tab gains focus
  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function handleDelete(c: SavedCase) {
    Alert.alert(
      "Delete case?",
      `Remove the check for ${formatPostcode(c.postcode)}?`,
      [
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteCase(c.id);
            await load();
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
  }

  function handleOpen(c: SavedCase) {
    navigation.navigate("CaseDetail", { savedCase: c });
  }

  return (
    <PaperBackground>
      <TopBar
        fonts={fonts}
        left={<Wordmark fonts={fonts} />}
        title="My Cases"
      />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {cases.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={[styles.emptyTitle, { fontFamily: fonts.serif }]}>
              No cases yet
            </Text>
            <Text style={[styles.emptySub, { fontFamily: fonts.sans }]}>
              Check your postcode on the Home tab to start a case.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            <Text style={[styles.listLabel, { fontFamily: fonts.sansBold }]}>
              {cases.length} {cases.length === 1 ? "case" : "cases"}
            </Text>
            {cases.map((c) => (
              <Pressable
                key={c.id}
                style={styles.card}
                onPress={() => handleOpen(c)}
                onLongPress={() => handleDelete(c)}
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardLeft}>
                    <BandPill
                      letter={bandKey(c.userBand)}
                      tone={c.status === "won" ? "forest" : "accent"}
                      fonts={fonts}
                    />
                    <View style={styles.cardMeta}>
                      <Text style={[styles.cardPostcode, { fontFamily: fonts.sansSemiBold }]}>
                        {formatPostcode(c.postcode)}
                      </Text>
                      <Text style={[styles.cardDistrict, { fontFamily: fonts.sans }]}>
                        {c.district}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusChip,
                      { backgroundColor: STATUS_COLORS[c.status] + "18" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { fontFamily: fonts.sansSemiBold, color: STATUS_COLORS[c.status] },
                      ]}
                    >
                      {STATUS_LABELS[c.status]}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBottom}>
                  {c.annualSaving ? (
                    <Text style={[styles.cardSaving, { fontFamily: fonts.serif }]}>
                      {formatGbp(c.annualSaving)} / yr potential saving
                    </Text>
                  ) : null}
                  <Text style={[styles.cardDate, { fontFamily: fonts.mono }]}>
                    {formatDate(c.updatedAt)}
                  </Text>
                </View>

                <Text style={[styles.longPressHint, { fontFamily: fonts.sans }]}>
                  Long-press to delete
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: 80 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingTop: 80,
    gap: 12,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 22, color: editorial.colors.ink, textAlign: "center" },
  emptySub: {
    fontSize: 14,
    lineHeight: 20,
    color: editorial.colors.ink3,
    textAlign: "center",
  },
  list: { paddingHorizontal: 16, paddingTop: 8 },
  listLabel: {
    fontSize: 11,
    color: editorial.colors.ink3,
    letterSpacing: 0.88,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  card: {
    backgroundColor: editorial.colors.paperCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: editorial.colors.hairline,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  cardMeta: { flex: 1 },
  cardPostcode: { fontSize: 15, color: editorial.colors.ink },
  cardDistrict: { fontSize: 12, color: editorial.colors.ink3, marginTop: 1 },
  statusChip: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { fontSize: 11 },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: editorial.colors.hairline,
    paddingTop: 8,
  },
  cardSaving: { fontSize: 13, color: editorial.colors.forest },
  cardDate: { fontSize: 11, color: editorial.colors.ink3 },
  longPressHint: { fontSize: 10, color: editorial.colors.ink3, marginTop: 6 },
});
