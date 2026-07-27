import { Stack, useLocalSearchParams } from "expo-router";
import { FlatList, View } from "react-native";

import { EmptyState } from "@/components/empty-state";
import { RacketCard } from "@/components/racket-card";
import { useAppState } from "@/providers/app-state";
import { colors } from "@/theme/colors";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function BrandScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { catalog } = useAppState();
  const rackets = catalog.filter((item) => slugify(item.brand) === slug);
  const brand = rackets[0]?.brand ?? "Бренд";

  return (
    <>
      <Stack.Title>{brand}</Stack.Title>
      <FlatList
        data={rackets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RacketCard racket={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        style={{ backgroundColor: colors.background }}
        ListEmptyComponent={
          <EmptyState title="Бренд не найден" text="Вернись к общему списку брендов." />
        }
      />
    </>
  );
}
