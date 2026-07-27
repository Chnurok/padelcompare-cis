import { Stack, useLocalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { EmptyState } from "@/components/empty-state";
import { MetricBar } from "@/components/metric-bar";
import { RacketVisual } from "@/components/racket-visual";
import { useAppState } from "@/providers/app-state";
import { colors } from "@/theme/colors";
import {
  averageScore,
  formatPrice,
  labelFor,
  metrics,
  metricScore,
  safeDescription
} from "@/utils/catalog";

export default function RacketDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { catalog, savedIds, compareIds, toggleSaved, toggleCompare } = useAppState();
  const racket = catalog.find((item) => item.id === slug);

  if (!racket) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16 }}
      >
        <EmptyState title="Ракетка не найдена" text="Вернись в каталог и выбери другую модель." />
      </ScrollView>
    );
  }

  const saved = savedIds.includes(racket.id);
  const comparing = compareIds.includes(racket.id);

  async function openOffer(url: string) {
    if (!/^https?:\/\//i.test(url)) {
      Alert.alert("Ссылка недоступна", "Магазин не передал корректную ссылку.");
      return;
    }
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert("Не удалось открыть", "Попробуй открыть предложение позже.");
      return;
    }
    await Linking.openURL(url);
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 16, paddingBottom: 80, gap: 20 }}
      style={{ backgroundColor: colors.background }}
    >
      <Stack.Title>{racket.model}</Stack.Title>
      <RacketVisual racket={racket} height={330} />

      <View style={{ gap: 7 }}>
        <Text selectable style={{ color: colors.accent, fontWeight: "900", letterSpacing: 1 }}>
          {racket.brand.toUpperCase()} · {racket.season}
        </Text>
        <Text selectable style={{ color: colors.label, fontSize: 27, lineHeight: 31, fontWeight: "900" }}>
          {racket.model}
        </Text>
        <Text selectable style={{ color: colors.secondaryLabel, fontSize: 15, lineHeight: 22 }}>
          {safeDescription(racket)}
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable
          accessibilityRole="button"
          onPress={() => toggleSaved(racket.id)}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: saved ? colors.tintSoft : colors.surface,
            borderRadius: 14,
            borderCurve: "continuous",
            paddingVertical: 13,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.separator,
            opacity: pressed ? 0.7 : 1
          })}
        >
          <Text selectable style={{ color: colors.label, fontWeight: "800" }}>
            {saved ? "Сохранено" : "Сохранить"}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => toggleCompare(racket.id)}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: comparing ? colors.accent : colors.surface,
            borderRadius: 14,
            borderCurve: "continuous",
            paddingVertical: 13,
            alignItems: "center",
            borderWidth: 1,
            borderColor: comparing ? colors.accent : colors.separator,
            opacity: pressed ? 0.7 : 1
          })}
        >
          <Text selectable style={{ color: comparing ? colors.onAccent : colors.label, fontWeight: "800" }}>
            {comparing ? "В сравнении" : "Сравнить"}
          </Text>
        </Pressable>
      </View>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 22,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: colors.separator,
          padding: 17,
          gap: 14
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
          <Text selectable style={{ color: colors.label, fontSize: 20, fontWeight: "900" }}>
            Игровой профиль
          </Text>
          <Text
            selectable
            style={{ color: colors.success, fontSize: 21, fontWeight: "900", fontVariant: ["tabular-nums"] }}
          >
            {averageScore(racket)}
          </Text>
        </View>
        {metrics.map((metric) => (
          <MetricBar
            key={metric.key}
            label={metric.label}
            value={metricScore(racket, metric.key)}
          />
        ))}
      </View>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 22,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: colors.separator,
          padding: 17,
          gap: 13
        }}
      >
        <Text selectable style={{ color: colors.label, fontSize: 20, fontWeight: "900" }}>
          Характеристики
        </Text>
        {[
          ["Форма", labelFor("shape", racket.shape)],
          ["Стиль", labelFor("style", racket.playStyle)],
          ["Уровень", labelFor("level", racket.skillLevel)],
          ["Жёсткость", labelFor("hardness", racket.hardness)],
          ["Вес", `${racket.weight} г`],
          ["Баланс", labelFor("balance", racket.balance)],
          ["Материал лица", racket.faceMaterial],
          ["Сердцевина", racket.coreMaterial]
        ].map(([label, value]) => (
          <View
            key={label}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 18,
              borderBottomWidth: 1,
              borderBottomColor: colors.separator,
              paddingBottom: 9
            }}
          >
            <Text selectable style={{ color: colors.secondaryLabel, flex: 1 }}>
              {label}
            </Text>
            <Text selectable style={{ color: colors.label, flex: 1, textAlign: "right", fontWeight: "700" }}>
              {value}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ gap: 12 }}>
        <Text selectable style={{ color: colors.label, fontSize: 22, fontWeight: "900" }}>
          Предложения
        </Text>
        {racket.offers.map((offer) => (
          <Pressable
            key={`${offer.merchant}-${offer.url}`}
            accessibilityRole="link"
            onPress={() => void openOffer(offer.url)}
            style={({ pressed }) => ({
              backgroundColor: colors.surface,
              borderRadius: 17,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: colors.separator,
              padding: 15,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 14,
              opacity: pressed ? 0.7 : 1
            })}
          >
            <View style={{ flex: 1, gap: 3 }}>
              <Text selectable style={{ color: colors.label, fontWeight: "800" }}>
                {offer.merchant}
              </Text>
              <Text selectable style={{ color: colors.secondaryLabel, fontSize: 12 }}>
                {offer.availability === "in_stock" ? "В наличии" : offer.availability}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: 2 }}>
              {offer.previousPrice && offer.previousPrice > offer.price ? (
                <Text
                  selectable
                  style={{ color: colors.secondaryLabel, textDecorationLine: "line-through", fontSize: 12 }}
                >
                  {formatPrice(offer.previousPrice, offer.currency)}
                </Text>
              ) : null}
              <Text selectable style={{ color: colors.accent, fontSize: 18, fontWeight: "900" }}>
                {formatPrice(offer.price, offer.currency)}
              </Text>
            </View>
          </Pressable>
        ))}
        <Text selectable style={{ color: colors.secondaryLabel, fontSize: 12, lineHeight: 17 }}>
          Некоторые ссылки могут быть партнёрскими. Цена для покупателя не меняется; PadelCompare может получить комиссию.
        </Text>
      </View>
    </ScrollView>
  );
}
