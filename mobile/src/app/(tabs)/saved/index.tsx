import { Link } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";

import { EmptyState } from "@/components/empty-state";
import { RacketCard } from "@/components/racket-card";
import { useAppState } from "@/providers/app-state";
import { colors } from "@/theme/colors";

export default function SavedScreen() {
  const { catalog, savedIds, compareIds } = useAppState();
  const saved = savedIds
    .map((id) => catalog.find((racket) => racket.id === id))
    .filter((racket) => racket !== undefined);

  return (
    <FlatList
      data={saved}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <RacketCard racket={item} />}
      ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      style={{ backgroundColor: colors.background }}
      ListHeaderComponent={
        compareIds.length > 0 ? (
          <Link href="/compare" asChild>
            <Pressable
              accessibilityRole="link"
              style={({ pressed }) => ({
                backgroundColor: colors.accent,
                borderRadius: 16,
                borderCurve: "continuous",
                padding: 15,
                marginBottom: 16,
                alignItems: "center",
                opacity: pressed ? 0.7 : 1
              })}
            >
              <Text selectable style={{ color: colors.onAccent, fontWeight: "900", fontSize: 16 }}>
                Открыть сравнение · {compareIds.length}
              </Text>
            </Pressable>
          </Link>
        ) : (
          <View style={{ height: 1 }} />
        )
      }
      ListEmptyComponent={
        <EmptyState
          title="Здесь появится твой shortlist"
          text="Сохраняй интересные модели в каталоге или в результатах подбора. Выбор останется на устройстве."
        />
      }
    />
  );
}
