import { ActivityIndicator, View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { useAppFonts } from "./src/hooks/useAppFonts";
import { AppContext } from "./src/context/AppContext";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { getApiBaseUrl } from "./src/lib/api";
import { editorial } from "./src/theme/editorial";

export default function App() {
  const { ready, fonts } = useAppFonts();
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={editorial.colors.accent} />
      </View>
    );
  }

  return (
    <AppContext.Provider value={{ fonts, apiBaseUrl }}>
      <AppNavigator />
      <StatusBar style="dark" />
    </AppContext.Provider>
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
