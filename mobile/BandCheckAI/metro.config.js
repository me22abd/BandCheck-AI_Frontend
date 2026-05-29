const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

const SHIMS = {
  "react-native-safe-area-context": path.resolve(
    __dirname,
    "shims/safe-area-context.js",
  ),
  "react-native-screens": path.resolve(__dirname, "shims/screens.js"),
  "react-native-gesture-handler": path.resolve(
    __dirname,
    "shims/gesture-handler.js",
  ),
};

// Intercept imports of native-dependent packages and redirect to pure-JS
// shims so the app works in Expo Go without a custom dev build.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  for (const [pkg, shimPath] of Object.entries(SHIMS)) {
    if (moduleName === pkg || moduleName.startsWith(`${pkg}/`)) {
      return { filePath: shimPath, type: "sourceFile" };
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
