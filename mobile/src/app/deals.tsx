import { FlatList, Text, View } from "react-native";

import { EmptyState } from "@/components/empty-state";
import { RacketCard } from "@/components/racket-card";
import { useAppState } from "@/providers/app-state";
import { colors } from "@/theme/colors";
import { topDeals } from "@/utils/catalog";

export default function DealsScreen() {
  const { catalog } = useAppState();
  const deals = topDeals(catalog);

  return (
    <FlatList
      data={deals}
      keyExtractor={(item) => item.racket.id}
      renderItem={({ item }) => (
        <View style={{ gap: 8 }}>
          <Text selectable style={{ color: colors.success, fontSize: 17, fontWeight: "900" }}>
            Цена ниже на {item.discount}%
          </Text>
          <RacketCard racket={item.racket} />
        </View>
      )}
      ItemSeparatorComponent={() => <View style={{ height: 18 }} />}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
      style={{ backgroundColor: colors.background }}
      ListEmptyComponent={
        <EmptyState
          title="Активных скидок пока нет"
          text="Предложения остаются доступными в карточках ракеток."
        />
      }
    />
  );
}
