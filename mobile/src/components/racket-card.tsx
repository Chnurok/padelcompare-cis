import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { RacketVisual } from "@/components/racket-visual";
import { useAppState } from "@/providers/app-state";
import { colors } from "@/theme/colors";
import type { CatalogRacket } from "@/types/catalog";
import { averageScore, formatPrice, labelFor } from "@/utils/catalog";

export function RacketCard({
  racket,
  rank,
  reason,
  compact = false
}: {
  racket: CatalogRacket;
  rank?: number;
  reason?: string;
  compact?: boolean;
}) {
  const { savedIds, compareIds, toggleSaved, toggleCompare } = useAppState();
  const saved = savedIds.includes(racket.id);
  const comparing = compareIds.includes(racket.id);

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 22,
        borderCurve: "continuous",
        padding: 12,
        gap: 11,
        borderWidth: 1,
        borderColor: colors.separator,
        boxShadow: "0 7px 22px rgba(52, 32, 18, 0.07)"
      }}
    >
      <Link href={{ pathname: "/racket/[slug]", params: { slug: racket.id } }} asChild>
        <Pressable accessibilityRole="link">
          <RacketVisual racket={racket} height={compact ? 120 : 165} />
        </Pressable>
      </Link>

      <View style={{ gap: 5 }}>
        <Text selectable style={{ color: colors.accent, fontSize: 12, fontWeight: "800" }}>
          {rank ? `#${rank} · ` : ""}
          {racket.brand.toUpperCase()} · {racket.season}
        </Text>
        <Link href={{ pathname: "/racket/[slug]", params: { slug: racket.id } }} asChild>
          <Pressable accessibilityRole="link">
            <Text
              selectable
              numberOfLines={2}
              style={{ color: colors.label, fontSize: compact ? 16 : 18, fontWeight: "800" }}
            >
              {racket.model}
            </Text>
          </Pressable>
        </Link>
        <Text selectable style={{ color: colors.secondaryLabel, fontSize: 13 }}>
          {labelFor("style", racket.playStyle)} · {labelFor("shape", racket.shape)} ·{" "}
          {racket.weight} г
        </Text>
        {reason ? (
          <Text selectable numberOfLines={2} style={{ color: colors.secondaryLabel, fontSize: 12 }}>
            {reason}
          </Text>
        ) : null}
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text selectable style={{ color: colors.label, fontSize: 18, fontWeight: "900" }}>
          {formatPrice(racket.currentPrice)}
        </Text>
        <Text
          selectable
          style={{
            color: colors.success,
            fontWeight: "800",
            fontVariant: ["tabular-nums"]
          }}
        >
          {averageScore(racket)}/100
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={saved ? "Удалить из избранного" : "Сохранить в избранное"}
          onPress={() => toggleSaved(racket.id)}
          style={({ pressed }) => ({
            flex: 1,
            alignItems: "center",
            paddingVertical: 10,
            borderRadius: 12,
            borderCurve: "continuous",
            backgroundColor: saved ? colors.tintSoft : colors.background,
            opacity: pressed ? 0.7 : 1
          })}
        >
          <Text selectable style={{ color: colors.label, fontWeight: "700", fontSize: 13 }}>
            {saved ? "Сохранено" : "Сохранить"}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={comparing ? "Убрать из сравнения" : "Добавить к сравнению"}
          onPress={() => toggleCompare(racket.id)}
          style={({ pressed }) => ({
            flex: 1,
            alignItems: "center",
            paddingVertical: 10,
            borderRadius: 12,
            borderCurve: "continuous",
            backgroundColor: comparing ? colors.accent : colors.background,
            opacity: pressed ? 0.7 : 1
          })}
        >
          <Text
            selectable
            style={{ color: comparing ? colors.onAccent : colors.label, fontWeight: "700", fontSize: 13 }}
          >
            {comparing ? "В сравнении" : "Сравнить"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
