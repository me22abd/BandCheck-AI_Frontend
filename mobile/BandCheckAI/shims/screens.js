/**
 * Pure-JS shim for react-native-screens.
 * Replaces native Screen components with plain Views so the app works
 * in Expo Go without a native build.
 */
const React = require("react");
const { View, StyleSheet } = require("react-native");

function Screen({ children, style, ...rest }) {
  return React.createElement(View, { style: [StyleSheet.absoluteFill, style] }, children);
}

function ScreenContainer({ children, style, ...rest }) {
  return React.createElement(View, { style: [{ flex: 1 }, style] }, children);
}

function ScreenStack({ children, style, ...rest }) {
  return React.createElement(View, { style: [{ flex: 1 }, style] }, children);
}

function ScreenStackHeaderConfig() {
  return null;
}

function ScreenStackHeaderBackButtonImage() {
  return null;
}

function NativeScreen(props) {
  return React.createElement(View, props);
}

function NativeScreenContainer(props) {
  return React.createElement(View, props);
}

function enableScreens() {}
function screensEnabled() { return false; }

const FullWindowOverlay = View;
const GestureDetector = ({ children }) => children;

module.exports = {
  Screen,
  ScreenContainer,
  ScreenStack,
  ScreenStackHeaderConfig,
  ScreenStackHeaderBackButtonImage,
  NativeScreen,
  NativeScreenContainer,
  FullWindowOverlay,
  GestureDetector,
  enableScreens,
  screensEnabled,
  // Also export as default for ESM interop
  default: { enableScreens, screensEnabled },
};
