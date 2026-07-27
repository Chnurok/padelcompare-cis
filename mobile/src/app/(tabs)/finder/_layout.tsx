import { Stack } from "expo-router/stack";

export default function FinderLayout() {
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: "minimal"
      }}
    >
      <Stack.Screen name="index" options={{ title: "Подбор" }} />
    </Stack>
  );
}
