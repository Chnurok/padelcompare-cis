import { Color } from "expo-router";
import { Platform } from "react-native";

export const colors = {
  label: Platform.select({
    ios: Color.ios.label,
    android: Color.android.dynamic.onSurface,
    default: "#181411"
  })!,
  secondaryLabel: Platform.select({
    ios: Color.ios.secondaryLabel,
    android: Color.android.dynamic.onSurfaceVariant,
    default: "#6f655e"
  })!,
  background: Platform.select({
    ios: Color.ios.systemGroupedBackground,
    android: Color.android.dynamic.surface,
    default: "#f6f2ed"
  })!,
  surface: Platform.select({
    ios: Color.ios.secondarySystemGroupedBackground,
    android: Color.android.dynamic.surfaceContainer,
    default: "#ffffff"
  })!,
  separator: Platform.select({
    ios: Color.ios.separator,
    android: Color.android.dynamic.outlineVariant,
    default: "#ddd4cc"
  })!,
  accent: "#c9682d",
  accentDark: "#8f3f19",
  success: "#2f7d50",
  warning: "#9b5c16",
  danger: "#b33b32",
  onAccent: "#ffffff",
  tintSoft: "#f4dfd1",
  dark: "#201711"
};
