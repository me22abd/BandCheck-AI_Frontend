import { StatusBar } from "expo-status-bar";
import { useMemo, useState, useEffect } from "react";
import { ActivityIndicator, Linking, SafeAreaView, StyleSheet, View } from "react-native";
import { useAppFonts } from "./src/hooks/useAppFonts";
import { getApiBaseUrl, type CheckResponse } from "./src/lib/api";
import { CompareScreen } from "./src/screens/CompareScreen";
import { EmailCaptureScreen } from "./src/screens/EmailCaptureScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { SummaryScreen } from "./src/screens/SummaryScreen";
import { AppealBuilderScreen } from "./src/screens/AppealBuilderScreen";
import { editorial } from "./src/theme/editorial";

type Screen = "home" | "compare" | "summary" | "email" | "builder";

export default function App() {
  const { ready, fonts } = useAppFonts();
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
  const [screen, setScreen] = useState<Screen>("home");
  const [checkData, setCheckData] = useState<CheckResponse | null>(null);
  const [email, setEmail] = useState<string>("");

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
    <SafeAreaView style={styles.safe}>
      {screen === "home" ? (
        <HomeScreen apiBaseUrl={apiBaseUrl} fonts={fonts} onResult={handleCheckResult} />
      ) : null}

      {screen === "compare" && checkData ? (
        <CompareScreen
          fonts={fonts}
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
          onFinish={() => {
            setScreen("home");
            setCheckData(null);
            setEmail("");
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
