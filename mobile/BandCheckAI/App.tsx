import { ActivityIndicator, View, StyleSheet } from "react-native";
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
  // All hooks must be called unconditionally — before any early return
  const { ready, fonts } = useAppFonts();
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
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
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: editorial.colors.paper,
  },
});
