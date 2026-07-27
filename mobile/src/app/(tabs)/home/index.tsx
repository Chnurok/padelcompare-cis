import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { RacketCard } from "@/components/racket-card";
import { useAppState } from "@/providers/app-state";
import { colors } from "@/theme/colors";
import { averageScore, formatPrice, topDeals } from "@/utils/catalog";

function ActionLink({
  href,
  title,
  text
}: {
  href: "/deals" | "/brands" | "/compare" | "/(tabs)/finder";
  title: string;
  text: string;
}) {
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="link"
        style={({ pressed }) => ({
          flex: 1,
          minWidth: 155,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.separator,
          borderRadius: 18,
          borderCurve: "continuous",
          padding: 16,
          gap: 5,
          opacity: pressed ? 0.7 : 1
        })}
      >
        <Text selectable style={{ color: colors.label, fontSize: 17, fontWeight: "800" }}>
          {title}
        </Text>
        <Text selectable style={{ color: colors.secondaryLabel, fontSize: 13, lineHeight: 18 }}>
          {text}
        </Text>
      </Pressable>
    </Link>
  );
}

export default function HomeScreen() {
  const { catalog, compareIds, savedIds } = useAppState();
  const featured = [...catalog]
    .sort((left, right) => averageScore(right) - averageScore(left))
    .slice(0, 6);
  const deals = topDeals(catalog, 3);
  const brands = new Set(catalog.map((item) => item.brand)).size;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 26 }}
      style={{ backgroundColor: colors.background }}
    >
      <View
        style={{
          backgroundColor: colors.dark,
          borderRadius: 28,
          borderCurve: "continuous",
          padding: 22,
          gap: 18,
          overflow: "hidden"
        }}
      >
        <View style={{ gap: 8 }}>
          <Text selectable style={{ color: "#e59a68", fontSize: 12, fontWeight: "900", letterSpacing: 1.2 }}>
            ВЫБЕРИ СВОЮ РАКЕТКУ
          </Text>
          <Text selectable style={{ color: "#fff8f0", fontSize: 29, lineHeight: 33, fontWeight: "900" }}>
            Сравнивай по игре, а не по рекламе
          </Text>
          <Text selectable style={{ color: "#d9c8bb", fontSize: 15, lineHeight: 22 }}>
            150 моделей, понятные метрики, реальные предложения и персональный подбор.
          </Text>
        </View>

        <Link href="/(tabs)/finder" asChild>
          <Pressable
            accessibilityRole="link"
            style={({ pressed }) => ({
              backgroundColor: colors.accent,
              borderRadius: 14,
              borderCurve: "continuous",
              alignItems: "center",
              paddingVertical: 14,
              opacity: pressed ? 0.74 : 1
            })}
          >
            <Text selectable style={{ color: colors.onAccent, fontSize: 16, fontWeight: "900" }}>
              Подобрать за минуту
            </Text>
          </Pressable>
        </Link>

        <View style={{ flexDirection: "row", gap: 18 }}>
          {[
            [`${catalog.length}`, "ракеток"],
            [`${brands}`, "брендов"],
            [`${savedIds.length}`, "сохранено"]
          ].map(([value, label]) => (
            <View key={label} style={{ gap: 2 }}>
              <Text selectable style={{ color: "#fff8f0", fontSize: 20, fontWeight: "900" }}>
                {value}
              </Text>
              <Text selectable style={{ color: "#bda99b", fontSize: 12 }}>
                {label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <Text selectable style={{ color: colors.label, fontSize: 22, fontWeight: "900" }}>
          Быстрый старт
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <ActionLink href="/brands" title="Бренды" text="Все линейки в одном месте" />
          <ActionLink href="/deals" title="Скидки" text="Лучшие текущие цены" />
          <ActionLink
            href="/compare"
            title={`Сравнение${compareIds.length ? ` · ${compareIds.length}` : ""}`}
            text="До четырёх моделей рядом"
          />
          <ActionLink href="/(tabs)/finder" title="Finder" text="Подбор под твой профиль" />
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
          <Text selectable style={{ color: colors.label, fontSize: 22, fontWeight: "900" }}>
            Топ по профилю
          </Text>
          <Link href="/(tabs)/catalog">
            <Text selectable style={{ color: colors.accent, fontWeight: "800" }}>
              Все модели
            </Text>
          </Link>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
        >
          {featured.map((racket, index) => (
            <View key={racket.id} style={{ width: 270 }}>
              <RacketCard racket={racket} rank={index + 1} compact />
            </View>
          ))}
        </ScrollView>
      </View>

      {deals.length ? (
        <View style={{ gap: 12 }}>
          <Text selectable style={{ color: colors.label, fontSize: 22, fontWeight: "900" }}>
            Цены снизились
          </Text>
          {deals.map(({ racket, discount }) => (
            <Link
              key={racket.id}
              href={{ pathname: "/racket/[slug]", params: { slug: racket.id } }}
              asChild
            >
              <Pressable
                accessibilityRole="link"
                style={({ pressed }) => ({
                  backgroundColor: colors.surface,
                  borderRadius: 17,
                  borderCurve: "continuous",
                  padding: 15,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  borderWidth: 1,
                  borderColor: colors.separator,
                  opacity: pressed ? 0.7 : 1
                })}
              >
                <View style={{ flex: 1, gap: 3 }}>
                  <Text selectable style={{ color: colors.label, fontWeight: "800" }}>
                    {racket.fullName}
                  </Text>
                  <Text selectable style={{ color: colors.secondaryLabel }}>
                    от {formatPrice(racket.currentPrice)}
                  </Text>
                </View>
                <Text selectable style={{ color: colors.success, fontWeight: "900", fontSize: 17 }}>
                  −{discount}%
                </Text>
              </Pressable>
            </Link>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}
