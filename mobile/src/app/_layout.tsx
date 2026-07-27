import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router/react-navigation";
import { Stack } from "expo-router/stack";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";

import { AppStateProvider } from "@/providers/app-state";
import { colors } from "@/theme/colors";

export default function RootLayout() {
  const scheme = useColorScheme();

  return (
    <AppStateProvider>
      <ThemeProvider value={scheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerBackButtonDisplayMode: "minimal",
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.background }
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="racket/[slug]" options={{ title: "Ракетка" }} />
          <Stack.Screen name="compare" options={{ title: "Сравнение", headerLargeTitle: true }} />
          <Stack.Screen name="brands" options={{ title: "Бренды", headerLargeTitle: true }} />
          <Stack.Screen name="brand/[slug]" options={{ title: "Бренд" }} />
          <Stack.Screen name="deals" options={{ title: "Лучшие цены", headerLargeTitle: true }} />
          <Stack.Screen name="+not-found" options={{ title: "Не найдено" }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AppStateProvider>
  );
}
