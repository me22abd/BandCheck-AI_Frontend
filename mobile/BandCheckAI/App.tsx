import { StatusBar } from "expo-status-bar";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Linking,
  PanResponder,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";
import { useAppFonts } from "./src/hooks/useAppFonts";
import { getApiBaseUrl, type CheckResponse } from "./src/lib/api";
import { CompareScreen } from "./src/screens/CompareScreen";
import { EmailCaptureScreen } from "./src/screens/EmailCaptureScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { SummaryScreen } from "./src/screens/SummaryScreen";
import { AppealBuilderScreen } from "./src/screens/AppealBuilderScreen";
import { SubmitWalkthroughScreen } from "./src/screens/SubmitWalkthroughScreen";
import { AppealTrackerScreen } from "./src/screens/AppealTrackerScreen";
import {
  loadAppealRecord,
  saveAppealRecord,
  type AppealRecord,
} from "./src/lib/appealTracker";
import { editorial } from "./src/theme/editorial";

type Screen = "home" | "compare" | "summary" | "email" | "builder" | "submit" | "tracker";

export default function App() {
  const { ready, fonts } = useAppFonts();
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
  const [screen, setScreen] = useState<Screen>("home");
  const [checkData, setCheckData] = useState<CheckResponse | null>(null);
  const [email, setEmail] = useState<string>("");
  const [likelyBand, setLikelyBand] = useState<string | undefined>(undefined);
  const [hasActiveAppeal, setHasActiveAppeal] = useState(false);
  const [appealRecord, setAppealRecord] = useState<AppealRecord | null>(null);

  // Check for a persisted appeal on mount
  useEffect(() => {
    loadAppealRecord().then((r) => {
      if (r) {
        setAppealRecord(r);
        setHasActiveAppeal(true);
      }
    });
  }, []);

  // Refs so PanResponder callbacks always see fresh state (avoids stale closures)
  const screenRef = useRef(screen);
  const checkDataRef = useRef(checkData);
  const emailRef = useRef(email);
  useEffect(() => { screenRef.current = screen; }, [screen]);
  useEffect(() => { checkDataRef.current = checkData; }, [checkData]);
  useEffect(() => { emailRef.current = email; }, [email]);

  // Swipe left = back, swipe right = forward
  const panResponder = useRef(
    PanResponder.create({
      // Only capture a clearly horizontal movement
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 12 && Math.abs(gs.dx) > Math.abs(gs.dy) * 2,
      onPanResponderRelease: (_, gs) => {
        if (Math.abs(gs.dx) < 50) return;
        const s = screenRef.current;
        const cd = checkDataRef.current;
        const em = emailRef.current;

        if (gs.dx < 0) {
          // ← swipe left → go backward
          if (s === "compare") setScreen("home");
          else if (s === "summary") setScreen("compare");
          else if (s === "email") setScreen("summary");
          else if (s === "builder") setScreen("email");
          else if (s === "submit") setScreen("builder");
        } else {
          // → swipe right → go forward
          if (s === "home" && cd) setScreen("compare");
          else if (s === "compare") setScreen("summary");
          else if (s === "summary") setScreen("email");
          else if (s === "email" && em) setScreen("builder");
        }
      },
    })
  ).current;

  function handleCheckResult(data: CheckResponse) {
    setCheckData(data);
    setScreen("compare");
  }

  function handleDeepLink(url: string) {
    try {
      const path = url.replace(/^bandcheckai:\/\//, "").split("?")[0].replace(/^\//, "");
      if (path === "appeal" || path === "builder") {
        // Navigate to builder if we already have check data, otherwise go home
        // so the user enters their postcode first
        if (checkData) {
          setScreen("email");
        } else {
          setScreen("home");
        }
      }
    } catch {
      // ignore malformed URLs
    }
  }

  useEffect(() => {
    // Handle deep link that opened the app cold
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    // Handle deep link while app is already open
    const sub = Linking.addEventListener("url", ({ url }) => handleDeepLink(url));
    return () => sub.remove();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkData]);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={editorial.colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} {...panResponder.panHandlers}>
      {screen === "home" ? (
        <HomeScreen
          apiBaseUrl={apiBaseUrl}
          fonts={fonts}
          onResult={handleCheckResult}
          hasActiveAppeal={hasActiveAppeal}
          onViewAppeal={() => setScreen("tracker")}
        />
      ) : null}

      {screen === "compare" && checkData ? (
        <CompareScreen
          fonts={fonts}
          apiBaseUrl={apiBaseUrl}
          data={checkData}
          onBack={() => setScreen("home")}
          onContinue={() => setScreen("summary")}
        />
      ) : null}

      {screen === "summary" && checkData ? (
        <SummaryScreen
          fonts={fonts}
          data={checkData}
          onBack={() => setScreen("compare")}
          onContinue={() => setScreen("email")}
        />
      ) : null}

      {screen === "email" && checkData ? (
        <EmailCaptureScreen
          fonts={fonts}
          apiBaseUrl={apiBaseUrl}
          postcode={checkData.postcode}
          userBand={checkData.userBand}
          nearbyProperties={checkData.nearbyProperties}
          onBack={() => setScreen("summary")}
          onContinue={(nextEmail) => {
            setEmail(nextEmail);
            setScreen("builder");
          }}
        />
      ) : null}

      {screen === "builder" && checkData ? (
        <AppealBuilderScreen
          fonts={fonts}
          postcode={checkData.postcode}
          userBand={checkData.userBand}
          nearbyProperties={checkData.nearbyProperties}
          email={email}
          onBack={() => setScreen("email")}
          onSubmit={(lb) => {
            setLikelyBand(lb);
            setScreen("submit");
          }}
          onFinish={() => {
            setScreen("home");
            setCheckData(null);
            setEmail("");
            setLikelyBand(undefined);
          }}
        />
      ) : null}

      {screen === "submit" && checkData ? (
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
              // Save to state immediately — file system persists in background
              setAppealRecord(record);
              setHasActiveAppeal(true);
              setCheckData(null);
              setEmail("");
              setLikelyBand(undefined);
              setScreen("tracker");
              // Background persistence — UI doesn't wait for this
              saveAppealRecord(record).catch(() => {});
            } else {
              setScreen("home");
              setCheckData(null);
              setEmail("");
              setLikelyBand(undefined);
            }
          }}
        />
      ) : null}

      {screen === "tracker" && appealRecord ? (
        <AppealTrackerScreen
          fonts={fonts}
          initialRecord={appealRecord}
          onRecordChange={(updated) => setAppealRecord(updated)}
          onDone={() => {
            setHasActiveAppeal(false);
            setAppealRecord(null);
            setScreen("home");
          }}
        />
      ) : null}

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: editorial.colors.paper,
  },
  safe: {
    flex: 1,
    backgroundColor: editorial.colors.paper,
  },
});
