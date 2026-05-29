import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import type { StackScreenProps } from "@react-navigation/stack";

import { useAppContext } from "../context/AppContext";
import { storageGet, storageSet } from "../lib/storage";
import { upsertCase, deleteCase, updateCaseStatus, caseIdFromPostcode, getLatestInProgressCase } from "../lib/casesStore";
import { cancelAllNotificationsForCase, schedulePackReminderNotifications, schedulePostSubmissionNotifications } from "../lib/notifications";
import { saveAppealRecord, loadAppealRecord, type AppealRecord } from "../lib/appealTracker";

import { OnboardingScreen } from "../screens/OnboardingScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { CompareScreen } from "../screens/CompareScreen";
import { SummaryScreen } from "../screens/SummaryScreen";
import { EmailCaptureScreen } from "../screens/EmailCaptureScreen";
import { AppealBuilderScreen } from "../screens/AppealBuilderScreen";
import { SubmitWalkthroughScreen } from "../screens/SubmitWalkthroughScreen";
import { AppealTrackerScreen } from "../screens/AppealTrackerScreen";
import { EvidencePackPreviewScreen } from "../screens/EvidencePackPreviewScreen";
import { OutcomeRecordScreen } from "../screens/OutcomeRecordScreen";
import { OutcomeSuccessScreen } from "../screens/OutcomeSuccessScreen";
import { TestimonialScreen } from "../screens/TestimonialScreen";
import { MyCasesScreen } from "../screens/MyCasesScreen";
import { SettingsScreen } from "../screens/SettingsScreen";

import { editorial } from "../theme/editorial";
import type { RootStackParamList } from "./types";
import type { CheckResponse } from "../lib/api";
import type { SavedCase } from "../lib/casesStore";

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// ─── Tab icon components ───────────────────────────────────────────────────────

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>
  );
}

function TabLabel({ label, focused, fonts }: { label: string; focused: boolean; fonts: any }) {
  return (
    <Text style={{
      fontFamily: fonts.sans,
      fontSize: 10,
      color: focused ? editorial.colors.accent : editorial.colors.ink3,
      marginTop: 2,
    }}>
      {label}
    </Text>
  );
}

// ─── Screen wrappers (bridge navigation ↔ existing component props) ────────────

function HomeScreenWrapper({ navigation }: StackScreenProps<RootStackParamList, "Home">) {
  const { fonts, apiBaseUrl } = useAppContext();
  const [hasActiveAppeal, setHasActiveAppeal] = useState(false);
  const [appealRecord, setAppealRecord] = useState<AppealRecord | null>(null);
  const [savedCase, setSavedCase] = useState<SavedCase | null>(null);
  const [lastPostcode, setLastPostcode] = useState<string | undefined>();

  useEffect(() => {
    loadAppealRecord().then((r) => {
      if (r) { setAppealRecord(r); setHasActiveAppeal(true); }
    });
    getLatestInProgressCase().then(setSavedCase);
  }, []);

  return (
    <HomeScreen
      apiBaseUrl={apiBaseUrl}
      fonts={fonts}
      lastPostcode={lastPostcode}
      hasActiveAppeal={hasActiveAppeal}
      savedCase={savedCase}
      onViewAppeal={() => {
        if (appealRecord) {
          navigation.navigate("Tracker", { appealRecord });
        }
      }}
      onResume={(sc) => navigation.navigate("Compare", {
        checkData: {
          postcode: sc.postcode,
          district: sc.district,
          userBand: sc.userBand,
          nearbyProperties: sc.nearbyProperties,
          isEstimated: sc.isEstimated,
          annualSaving: sc.annualSaving,
        },
      })}
      onDismissCase={(sc) => {
        deleteCase(sc.id).catch(() => {});
        setSavedCase(null);
      }}
      onResult={(data) => {
        setLastPostcode(data.postcode);
        // Save as in-progress case
        const id = caseIdFromPostcode(data.postcode);
        const newCase: SavedCase = {
          id,
          postcode: data.postcode,
          district: data.district ?? "",
          userBand: data.userBand,
          nearbyProperties: data.nearbyProperties,
          isEstimated: data.isEstimated,
          status: "in_progress",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        upsertCase(newCase).catch(() => {});
        navigation.navigate("Compare", { checkData: data });
      }}
    />
  );
}

function CompareScreenWrapper({ navigation, route }: StackScreenProps<RootStackParamList, "Compare">) {
  const { fonts, apiBaseUrl } = useAppContext();
  return (
    <CompareScreen
      fonts={fonts}
      apiBaseUrl={apiBaseUrl}
      data={route.params.checkData}
      onBack={() => navigation.goBack()}
      onContinue={() => navigation.navigate("Summary", { checkData: route.params.checkData })}
    />
  );
}

function SummaryScreenWrapper({ navigation, route }: StackScreenProps<RootStackParamList, "Summary">) {
  const { fonts } = useAppContext();
  return (
    <SummaryScreen
      fonts={fonts}
      data={route.params.checkData}
      onBack={() => navigation.goBack()}
      onContinue={() => navigation.navigate("PackPreview", { checkData: route.params.checkData })}
    />
  );
}

function PackPreviewScreenWrapper({ navigation, route }: StackScreenProps<RootStackParamList, "PackPreview">) {
  const { fonts } = useAppContext();
  return (
    <EvidencePackPreviewScreen
      fonts={fonts}
      data={route.params.checkData}
      onBack={() => navigation.goBack()}
      onContinue={() => navigation.navigate("Email", { checkData: route.params.checkData })}
    />
  );
}

function EmailScreenWrapper({ navigation, route }: StackScreenProps<RootStackParamList, "Email">) {
  const { fonts, apiBaseUrl } = useAppContext();
  return (
    <EmailCaptureScreen
      fonts={fonts}
      apiBaseUrl={apiBaseUrl}
      postcode={route.params.checkData.postcode}
      userBand={route.params.checkData.userBand}
      nearbyProperties={route.params.checkData.nearbyProperties}
      onBack={() => navigation.goBack()}
      onContinue={(email) => {
        const pc = route.params.checkData.postcode;
        upsertCase({
          id: caseIdFromPostcode(pc),
          postcode: pc,
          district: route.params.checkData.district ?? "",
          userBand: route.params.checkData.userBand,
          nearbyProperties: route.params.checkData.nearbyProperties,
          isEstimated: route.params.checkData.isEstimated,
          email,
          status: "pack_requested",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }).catch(() => {});
        // Schedule reminder notifications
        schedulePackReminderNotifications({
          postcode: pc,
          formattedPostcode: pc.toUpperCase(),
        }).catch(() => {});
        navigation.navigate("Builder", { checkData: route.params.checkData, email });
      }}
    />
  );
}

function BuilderScreenWrapper({ navigation, route }: StackScreenProps<RootStackParamList, "Builder">) {
  const { fonts } = useAppContext();
  const { checkData, email } = route.params;
  return (
    <AppealBuilderScreen
      fonts={fonts}
      postcode={checkData.postcode}
      userBand={checkData.userBand}
      nearbyProperties={checkData.nearbyProperties}
      email={email}
      onBack={() => navigation.goBack()}
      onSubmit={(likelyBand) => navigation.navigate("Submit", { checkData, email, likelyBand })}
      onFinish={() => navigation.navigate("Home")}
    />
  );
}

function SubmitScreenWrapper({ navigation, route }: StackScreenProps<RootStackParamList, "Submit">) {
  const { fonts } = useAppContext();
  const { checkData, email, likelyBand } = route.params;
  return (
    <SubmitWalkthroughScreen
      fonts={fonts}
      postcode={checkData.postcode}
      userBand={checkData.userBand}
      likelyBand={likelyBand}
      email={email}
      onDone={async (submitted) => {
        if (submitted) {
          const record: AppealRecord = {
            postcode: checkData.postcode,
            userBand: checkData.userBand,
            likelyBand,
            annualSaving: checkData.annualSaving,
            email,
            status: "submitted",
            submittedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await saveAppealRecord(record);
          // Schedule post-submission check-in notifications
          schedulePostSubmissionNotifications({
            postcode: checkData.postcode,
            formattedPostcode: checkData.postcode.toUpperCase(),
          }).catch(() => {});
          // Update case status
          upsertCase({
            id: caseIdFromPostcode(checkData.postcode),
            postcode: checkData.postcode,
            district: checkData.district ?? "",
            userBand: checkData.userBand,
            nearbyProperties: checkData.nearbyProperties,
            email,
            likelyBand,
            annualSaving: checkData.annualSaving,
            status: "appeal_submitted",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }).catch(() => {});
          navigation.navigate("Tracker", { appealRecord: record });
        } else {
          navigation.navigate("Home");
        }
      }}
    />
  );
}

function TrackerScreenWrapper({ navigation, route }: StackScreenProps<RootStackParamList, "Tracker">) {
  const { fonts } = useAppContext();
  const [record, setRecord] = useState(route.params.appealRecord);
  return (
    <AppealTrackerScreen
      fonts={fonts}
      initialRecord={record}
      onRecordChange={setRecord}
      onBack={() => navigation.goBack()}
      onDone={() => navigation.navigate("Home")}
    />
  );
}

// ─── Appeal tab placeholder ────────────────────────────────────────────────────

function AppealTabScreen({ navigation }: any) {
  const { fonts } = useAppContext();
  const [appealRecord, setAppealRecord] = useState<AppealRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // Reload every time the tab comes into focus so navigating away and back
  // always shows the latest record instead of a stale/empty state.
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadAppealRecord().then((r) => {
        setAppealRecord(r ?? null);
        setLoading(false);
      });
    }, []),
  );

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: editorial.colors.paper }}>
        <ActivityIndicator color={editorial.colors.accent} />
      </View>
    );
  }

  if (appealRecord) {
    return (
      <AppealTrackerScreen
        fonts={fonts}
        initialRecord={appealRecord}
        onRecordChange={setAppealRecord}
        onDone={() => {
          setAppealRecord(null);
          navigation.navigate("HomeTab");
        }}
      />
    );
  }

  return (
    <View style={noAppealStyles.wrap}>
      <Text style={[noAppealStyles.emoji]}>📨</Text>
      <Text style={[noAppealStyles.title, { fontFamily: fonts.serif }]}>
        No active appeal
      </Text>
      <Text style={[noAppealStyles.sub, { fontFamily: fonts.sans }]}>
        Check your postcode on the Home tab to start building your appeal case.
      </Text>
    </View>
  );
}

const noAppealStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: editorial.colors.paper,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 14,
  },
  emoji: { fontSize: 52 },
  title: { fontSize: 24, color: editorial.colors.ink, textAlign: "center" },
  sub: { fontSize: 14, lineHeight: 22, color: editorial.colors.ink3, textAlign: "center" },
});

// ─── Outcome flow wrappers ─────────────────────────────────────────────────────

function OutcomeRecordWrapper({ navigation, route }: StackScreenProps<RootStackParamList, "OutcomeRecord">) {
  const { fonts } = useAppContext();
  const { savedCase } = route.params;
  return (
    <OutcomeRecordScreen
      fonts={fonts}
      savedCase={savedCase}
      onBack={() => navigation.goBack()}
      onSave={async (status, refund, annual) => {
        await updateCaseStatus(savedCase.id, status, {
          outcomeRefund: refund,
          outcomeAnnualReduction: annual,
          outcomeRecordedAt: new Date().toISOString(),
        });
        await cancelAllNotificationsForCase(savedCase.postcode);
        if (status === "successful") {
          navigation.replace("Testimonial", { postcode: savedCase.postcode, refundAmount: refund });
        } else {
          navigation.navigate("MyCases");
        }
      }}
    />
  );
}

function TestimonialWrapper({ navigation, route }: StackScreenProps<RootStackParamList, "Testimonial">) {
  const { fonts, apiBaseUrl } = useAppContext();
  const { postcode, refundAmount } = route.params;
  return (
    <TestimonialScreen
      fonts={fonts}
      apiBaseUrl={apiBaseUrl}
      postcode={postcode}
      refundAmount={refundAmount}
      onBack={() => navigation.goBack()}
      onSubmit={() => navigation.replace("OutcomeSuccess", { postcode, refundAmount })}
      onSkip={() => navigation.replace("OutcomeSuccess", { postcode, refundAmount })}
    />
  );
}

function OutcomeSuccessWrapper({ navigation, route }: StackScreenProps<RootStackParamList, "OutcomeSuccess">) {
  const { fonts } = useAppContext();
  const { postcode, refundAmount, annualReduction } = route.params;
  return (
    <OutcomeSuccessScreen
      fonts={fonts}
      postcode={postcode}
      refundAmount={refundAmount}
      annualReduction={annualReduction}
      onDone={() => navigation.navigate("MyCases")}
    />
  );
}

// ─── Home stack ────────────────────────────────────────────────────────────────

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        ...TransitionPresets.SlideFromRightIOS,
        cardStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreenWrapper} />
      <Stack.Screen name="Compare" component={CompareScreenWrapper} />
      <Stack.Screen name="Summary" component={SummaryScreenWrapper} />
      <Stack.Screen name="PackPreview" component={PackPreviewScreenWrapper} />
      <Stack.Screen name="Email" component={EmailScreenWrapper} />
      <Stack.Screen name="Builder" component={BuilderScreenWrapper} />
      <Stack.Screen name="Submit" component={SubmitScreenWrapper} />
      <Stack.Screen name="Tracker" component={TrackerScreenWrapper} />
      <Stack.Screen name="OutcomeRecord" component={OutcomeRecordWrapper} />
      <Stack.Screen name="Testimonial" component={TestimonialWrapper} />
      <Stack.Screen name="OutcomeSuccess" component={OutcomeSuccessWrapper} />
    </Stack.Navigator>
  );
}

// ─── My Cases stack ────────────────────────────────────────────────────────────

function CaseDetailScreen({ navigation, route }: StackScreenProps<RootStackParamList, "CaseDetail">) {
  const { fonts, apiBaseUrl } = useAppContext();
  const { savedCase } = route.params;

  const checkData: CheckResponse = {
    postcode: savedCase.postcode,
    district: savedCase.district,
    userBand: savedCase.userBand,
    nearbyProperties: savedCase.nearbyProperties,
    isEstimated: savedCase.isEstimated,
    annualSaving: savedCase.annualSaving,
  };

  return (
    <CompareScreen
      fonts={fonts}
      apiBaseUrl={apiBaseUrl}
      data={checkData}
      onBack={() => navigation.goBack()}
      onContinue={() =>
        navigation.navigate("Summary", { checkData })
      }
    />
  );
}

function MyCasesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        ...TransitionPresets.SlideFromRightIOS,
        cardStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="MyCases" component={MyCasesScreen} />
      <Stack.Screen name="CaseDetail" component={CaseDetailScreen} />
      <Stack.Screen name="Summary" component={SummaryScreenWrapper} />
      <Stack.Screen name="PackPreview" component={PackPreviewScreenWrapper} />
      <Stack.Screen name="Email" component={EmailScreenWrapper} />
      <Stack.Screen name="Builder" component={BuilderScreenWrapper} />
      <Stack.Screen name="Submit" component={SubmitScreenWrapper} />
      <Stack.Screen name="Tracker" component={TrackerScreenWrapper} />
      <Stack.Screen name="OutcomeRecord" component={OutcomeRecordWrapper} />
      <Stack.Screen name="Testimonial" component={TestimonialWrapper} />
      <Stack.Screen name="OutcomeSuccess" component={OutcomeSuccessWrapper} />
    </Stack.Navigator>
  );
}

// ─── Main tab navigator ────────────────────────────────────────────────────────

function MainTabs() {
  const { fonts } = useAppContext();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: editorial.colors.paper,
          borderTopColor: editorial.colors.hairline,
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: 4,
          height: 62,
        },
        tabBarActiveTintColor: editorial.colors.accent,
        tabBarInactiveTintColor: editorial.colors.ink3,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Home" focused={focused} fonts={fonts} />,
        }}
      />
      <Tab.Screen
        name="MyCasesTab"
        component={MyCasesStack}
        options={{
          title: "My Cases",
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="My Cases" focused={focused} fonts={fonts} />,
        }}
      />
      <Tab.Screen
        name="AppealTab"
        component={AppealTabScreen}
        options={{
          title: "Appeal",
          tabBarIcon: ({ focused }) => <TabIcon emoji="📨" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Appeal" focused={focused} fonts={fonts} />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Settings" focused={focused} fonts={fonts} />,
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Root navigator (handles onboarding) ──────────────────────────────────────

export function AppNavigator() {
  const { fonts } = useAppContext();
  const [booting, setBooting] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    storageGet<boolean>("onboarding_done").then((done) => {
      setShowOnboarding(!done);
      setBooting(false);
    });
  }, []);

  async function finishOnboarding() {
    await storageSet("onboarding_done", true);
    setShowOnboarding(false);
  }

  if (booting) {
    return (
      <View style={bootStyles.wrap}>
        <ActivityIndicator color={editorial.colors.accent} />
      </View>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onDone={finishOnboarding} />;
  }

  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}

const bootStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: editorial.colors.paper,
    alignItems: "center",
    justifyContent: "center",
  },
});
