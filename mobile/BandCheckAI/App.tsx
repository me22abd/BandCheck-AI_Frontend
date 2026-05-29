import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useMemo, useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { useAppFonts } from "./src/hooks/useAppFonts";
import { AppContext } from "./src/context/AppContext";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { getApiBaseUrl } from "./src/lib/api";
import { editorial } from "./src/theme/editorial";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const { ready, fonts } = useAppFonts();
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return (
      <View style={styles.wrap}>
        <View style={styles.wordmarkRow}>
          <Text style={styles.b}>b</Text>
          <Text style={styles.c}>c</Text>
        </View>
        <Text style={styles.sub}>BandCheck <Text style={{ color: editorial.colors.accent }}>· AI</Text></Text>
        <ActivityIndicator size="small" color={editorial.colors.accent} style={styles.spinner} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppContext.Provider value={{ fonts, apiBaseUrl }}>
          <AppNavigator />
          <StatusBar style="dark" />
        </AppContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: editorial.colors.paper,
    alignItems: "center",
    justifyContent: "center",
  },
  wordmarkRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  b: {
    fontSize: 52,
    fontWeight: "700",
    letterSpacing: -1.5,
    color: editorial.colors.ink,
  },
  c: {
    fontSize: 52,
    fontWeight: "700",
    letterSpacing: -1.5,
    color: editorial.colors.accent,
  },
  sub: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
    color: editorial.colors.ink,
    marginBottom: 32,
  },
  spinner: {
    marginTop: 4,
  },
});
