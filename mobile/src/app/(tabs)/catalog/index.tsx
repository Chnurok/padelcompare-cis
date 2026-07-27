import { useMemo, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";

import { ChoiceChips } from "@/components/choice-chips";
import { EmptyState } from "@/components/empty-state";
import { RacketCard } from "@/components/racket-card";
import { useAppState } from "@/providers/app-state";
import { colors } from "@/theme/colors";

type ShapeFilter = "all" | "round" | "tear" | "diamond";

export default function CatalogScreen() {
  const { catalog, isRefreshing, refreshCatalog } = useAppState();
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("all");
  const [shape, setShape] = useState<ShapeFilter>("all");

  const brands = useMemo(
    () => ["all", ...new Set(catalog.map((item) => item.brand))],
    [catalog]
  );
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return catalog.filter(
      (racket) =>
        (!normalized ||
          `${racket.brand} ${racket.model} ${racket.fullName}`
            .toLowerCase()
            .includes(normalized)) &&
        (brand === "all" || racket.brand === brand) &&
        (shape === "all" || racket.shape === shape)
    );
  }, [brand, catalog, query, shape]);

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <RacketCard racket={item} />}
      ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="on-drag"
      refreshing={isRefreshing}
      onRefresh={() => void refreshCatalog()}
      contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      style={{ backgroundColor: colors.background }}
      ListHeaderComponent={
        <View style={{ gap: 14, paddingBottom: 18 }}>
          <TextInput
            accessibilityLabel="Поиск по каталогу"
            value={query}
            onChangeText={setQuery}
            placeholder="Бренд или модель"
            placeholderTextColor={colors.secondaryLabel}
            returnKeyType="search"
            clearButtonMode="while-editing"
            style={{
              backgroundColor: colors.surface,
              color: colors.label,
              borderRadius: 14,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: colors.separator,
              paddingHorizontal: 15,
              paddingVertical: 13,
              fontSize: 16
            }}
          />
          <ChoiceChips
            label="Форма"
            value={shape}
            onChange={setShape}
            choices={[
              { value: "all", label: "Все" },
              { value: "round", label: "Круглая" },
              { value: "tear", label: "Капля" },
              { value: "diamond", label: "Ромб" }
            ]}
          />
          <ChoiceChips
            label="Бренд"
            value={brand}
            onChange={setBrand}
            choices={brands.map((item) => ({
              value: item,
              label: item === "all" ? "Все бренды" : item
            }))}
          />
          <Text selectable style={{ color: colors.secondaryLabel, fontSize: 13 }}>
            Найдено: {filtered.length} из {catalog.length}
          </Text>
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          title="Ничего не найдено"
          text="Измени запрос или сбрось один из фильтров."
        />
      }
    />
  );
}
