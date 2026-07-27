import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { EmptyState } from "@/components/empty-state";
import { MetricBar } from "@/components/metric-bar";
import { RacketVisual } from "@/components/racket-visual";
import { useAppState } from "@/providers/app-state";
import { colors } from "@/theme/colors";
import { formatPrice, labelFor, metrics, metricScore } from "@/utils/catalog";

export default function CompareScreen() {
  const { catalog, compareIds, toggleCompare, clearCompare } = useAppState();
  const rackets = compareIds
    .map((id) => catalog.find((item) => item.id === id))
    .filter((racket) => racket !== undefined);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 16, paddingBottom: 80, gap: 18 }}
      style={{ backgroundColor: colors.background }}
    >
      {rackets.length < 2 ? (
        <>
          <EmptyState
            title={rackets.length ? "Добавь ещё одну модель" : "Сравнение пока пусто"}
            text="Выбери от двух до четырёх ракеток. Мы покажем игровые метрики, характеристики и цены рядом."
          />
          <Link href="/(tabs)/catalog" asChild>
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
                Открыть каталог
              </Text>
            </Pressable>
          </Link>
        </>
      ) : (
        <>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text selectable style={{ color: colors.secondaryLabel }}>
              {rackets.length} из 4 моделей
            </Text>
            <Pressable accessibilityRole="button" onPress={clearCompare}>
              <Text selectable style={{ color: colors.danger, fontWeight: "800" }}>
                Очистить
              </Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
          >
            {rackets.map((racket) => (
              <View
                key={racket.id}
                style={{
                  width: 272,
                  backgroundColor: colors.surface,
                  borderRadius: 22,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: colors.separator,
                  padding: 13,
                  gap: 13
                }}
              >
                <RacketVisual racket={racket} height={165} />
                <View style={{ gap: 4 }}>
                  <Text selectable style={{ color: colors.accent, fontWeight: "900", fontSize: 12 }}>
                    {racket.brand.toUpperCase()}
                  </Text>
                  <Text selectable style={{ color: colors.label, fontSize: 18, fontWeight: "900" }}>
                    {racket.model}
                  </Text>
                  <Text selectable style={{ color: colors.secondaryLabel, fontSize: 13 }}>
                    {labelFor("shape", racket.shape)} · {racket.weight} г ·{" "}
                    {labelFor("hardness", racket.hardness)}
                  </Text>
                  <Text selectable style={{ color: colors.label, fontSize: 20, fontWeight: "900" }}>
                    {formatPrice(racket.currentPrice)}
                  </Text>
                </View>

                {metrics.map((metric) => (
                  <MetricBar
                    key={metric.key}
                    label={metric.label}
                    value={metricScore(racket, metric.key)}
                    compact
                  />
                ))}

                <Link href={{ pathname: "/racket/[slug]", params: { slug: racket.id } }} asChild>
                  <Pressable
                    accessibilityRole="link"
                    style={({ pressed }) => ({
                      backgroundColor: colors.accent,
                      borderRadius: 12,
                      borderCurve: "continuous",
                      paddingVertical: 11,
                      alignItems: "center",
                      opacity: pressed ? 0.7 : 1
                    })}
                  >
                    <Text selectable style={{ color: colors.onAccent, fontWeight: "800" }}>
                      Детали
                    </Text>
                  </Pressable>
                </Link>
                <Pressable accessibilityRole="button" onPress={() => toggleCompare(racket.id)}>
                  <Text selectable style={{ color: colors.danger, textAlign: "center", fontWeight: "700" }}>
                    Убрать
                  </Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </>
      )}
    </ScrollView>
  );
}
