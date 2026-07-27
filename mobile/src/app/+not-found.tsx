import { Link } from "expo-router";
import { Pressable, ScrollView, Text } from "react-native";

import { EmptyState } from "@/components/empty-state";
import { colors } from "@/theme/colors";

export default function NotFoundScreen() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 16, gap: 16 }}
      style={{ backgroundColor: colors.background }}
    >
      <EmptyState title="Страница не найдена" text="Ссылка устарела или была введена с ошибкой." />
      <Link href="/(tabs)/home" asChild>
        <Pressable
          accessibilityRole="link"
          style={({ pressed }) => ({
            backgroundColor: colors.accent,
            borderRadius: 14,
            borderCurve: "continuous",
            padding: 14,
            alignItems: "center",
            opacity: pressed ? 0.7 : 1
          })}
        >
          <Text selectable style={{ color: colors.onAccent, fontWeight: "900" }}>
            На главную
          </Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}
