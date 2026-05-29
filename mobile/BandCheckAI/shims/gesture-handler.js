/**
 * Pure-JS shim for react-native-gesture-handler.
 * Replaces all gesture handler components with plain View/Pressable
 * so the app works in Expo Go without a native build.
 */
const React = require("react");
const { View, ScrollView, Switch, TextInput, DrawerLayoutAndroid, Pressable } = require("react-native");

function wrap(Component) {
  return function GestureShim({ children, ...rest }) {
    return React.createElement(Component, rest, children);
  };
}

function passThrough({ children }) {
  return children || null;
}

const State = {
  UNDETERMINED: 0,
  FAILED: 1,
  BEGAN: 2,
  CANCELLED: 3,
  ACTIVE: 4,
  END: 5,
};

const Directions = {
  RIGHT: 1,
  LEFT: 2,
  UP: 4,
  DOWN: 8,
};

// Root view — just a plain View
function GestureHandlerRootView({ children, style }) {
  return React.createElement(View, { style: style || { flex: 1 } }, children);
}

// All gesture handlers just render their children
const PanGestureHandler = passThrough;
const TapGestureHandler = passThrough;
const LongPressGestureHandler = passThrough;
const RotationGestureHandler = passThrough;
const PinchGestureHandler = passThrough;
const FlingGestureHandler = passThrough;
const ForceTouchGestureHandler = passThrough;
const NativeViewGestureHandler = passThrough;

// Button components
function BaseButton({ children, onPress, style, ...rest }) {
  return React.createElement(Pressable, { onPress, style }, children);
}
const RectButton = BaseButton;
const BorderlessButton = BaseButton;
const TouchableHighlight = wrap(Pressable);
const TouchableNativeFeedback = wrap(Pressable);
const TouchableOpacity = wrap(Pressable);
const TouchableWithoutFeedback = wrap(Pressable);

function gestureHandlerRootHOC(Component) {
  return function WrappedComponent(props) {
    return React.createElement(
      GestureHandlerRootView,
      null,
      React.createElement(Component, props),
    );
  };
}

// Swipeable mock
function Swipeable({ children }) {
  return React.createElement(View, null, children);
}
Swipeable.prototype.close = function () {};
Swipeable.prototype.openLeft = function () {};
Swipeable.prototype.openRight = function () {};

// DrawerLayout mock
function DrawerLayout({ children, renderNavigationView, ...rest }) {
  return React.createElement(View, { style: { flex: 1 } }, children);
}

// Animated versions (just forward to regular)
const createNativeWrapper = (Component) => Component;

module.exports = {
  GestureHandlerRootView,
  PanGestureHandler,
  TapGestureHandler,
  LongPressGestureHandler,
  RotationGestureHandler,
  PinchGestureHandler,
  FlingGestureHandler,
  ForceTouchGestureHandler,
  NativeViewGestureHandler,
  BaseButton,
  RectButton,
  BorderlessButton,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Switch,
  TextInput,
  DrawerLayoutAndroid,
  DrawerLayout,
  Swipeable,
  State,
  Directions,
  gestureHandlerRootHOC,
  createNativeWrapper,
  // Gesture API v2
  Gesture: {
    Pan: () => ({ onBegin: () => ({}), onUpdate: () => ({}), onEnd: () => ({}), onFinalize: () => ({}) }),
    Tap: () => ({}),
    LongPress: () => ({}),
  },
  GestureDetector: passThrough,
};
