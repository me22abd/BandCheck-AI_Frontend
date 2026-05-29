/**
 * Pure-JS shim for react-native-safe-area-context.
 * Replaces the native module so the app works in Expo Go without a dev build.
 */
const React = require("react");
const { View } = require("react-native");

const defaultInsets = { top: 44, right: 0, bottom: 34, left: 0 };
const defaultFrame = { x: 0, y: 0, width: 390, height: 844 };

const SafeAreaInsetsContext = React.createContext(defaultInsets);
const SafeAreaFrameContext = React.createContext(defaultFrame);

function SafeAreaProvider({ children, initialMetrics }) {
  const insets = (initialMetrics && initialMetrics.insets) || defaultInsets;
  const frame = (initialMetrics && initialMetrics.frame) || defaultFrame;
  return React.createElement(
    SafeAreaFrameContext.Provider,
    { value: frame },
    React.createElement(
      SafeAreaInsetsContext.Provider,
      { value: insets },
      children,
    ),
  );
}

function SafeAreaView({ children, style, edges, ...rest }) {
  return React.createElement(View, Object.assign({ style: style }, rest), children);
}

function useSafeAreaInsets() {
  return React.useContext(SafeAreaInsetsContext);
}

function useSafeAreaFrame() {
  return React.useContext(SafeAreaFrameContext);
}

const initialWindowMetrics = {
  insets: defaultInsets,
  frame: defaultFrame,
};

module.exports = {
  SafeAreaProvider,
  SafeAreaView,
  SafeAreaInsetsContext,
  SafeAreaFrameContext,
  useSafeAreaInsets,
  useSafeAreaFrame,
  initialWindowMetrics,
  // Additional exports some packages reference
  SafeAreaConsumer: SafeAreaInsetsContext.Consumer,
  withSafeAreaInsets: (Component) => Component,
};
