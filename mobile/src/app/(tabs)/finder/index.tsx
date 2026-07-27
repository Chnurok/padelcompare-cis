import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { ChoiceChips } from "@/components/choice-chips";
import { RacketCard } from "@/components/racket-card";
import { useAppState } from "@/providers/app-state";
import { colors } from "@/theme/colors";
import type { FinderProfile } from "@/types/catalog";
import { explainFit, findRecommendations, finderScore } from "@/utils/catalog";

export default function FinderScreen() {
  const { catalog } = useAppState();
  const [profile, setProfile] = useState<FinderProfile>({
    budget: "under_330",
    priority: "balanced",
    level: "intermediate",
    feel: "medium"
  });

  const recommendations = useMemo(
    () => findRecommendations(catalog, profile, 5),
    [catalog, profile]
  );

  function update<Key extends keyof FinderProfile>(
    key: Key,
    value: FinderProfile[Key]
  ) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 22 }}
      style={{ backgroundColor: colors.background }}
    >
      <View
        style={{
          backgroundColor: colors.dark,
          borderRadius: 24,
          borderCurve: "continuous",
          padding: 20,
          gap: 8
        }}
      >
        <Text selectable style={{ color: "#e59a68", fontWeight: "900", letterSpacing: 1 }}>
          ПЕРСОНАЛЬНЫЙ ПРОФИЛЬ
        </Text>
        <Text selectable style={{ color: "#fff8f0", fontSize: 25, lineHeight: 30, fontWeight: "900" }}>
          Четыре ответа — понятный shortlist
        </Text>
        <Text selectable style={{ color: "#d9c8bb", fontSize: 14, lineHeight: 20 }}>
          Рейтинг обновляется сразу и объясняет, почему модель подходит именно тебе.
        </Text>
      </View>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 22,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: colors.separator,
          padding: 16,
          gap: 19
        }}
      >
        <ChoiceChips
          label="Бюджет"
          value={profile.budget}
          onChange={(value) => update("budget", value)}
          choices={[
            { value: "under_280", label: "До €280" },
            { value: "under_330", label: "До €330" },
            { value: "premium", label: "Премиум" }
          ]}
        />
        <ChoiceChips
          label="Главный приоритет"
          value={profile.priority}
          onChange={(value) => update("priority", value)}
          choices={[
            { value: "balanced", label: "Баланс" },
            { value: "control", label: "Контроль" },
            { value: "power", label: "Мощность" },
            { value: "comfort", label: "Комфорт" }
          ]}
        />
        <ChoiceChips
          label="Уровень"
          value={profile.level}
          onChange={(value) => update("level", value)}
          choices={[
            { value: "intermediate", label: "Средний" },
            { value: "advanced", label: "Продвинутый" }
          ]}
        />
        <ChoiceChips
          label="Ощущение"
          value={profile.feel}
          onChange={(value) => update("feel", value)}
          choices={[
            { value: "soft", label: "Мягкое" },
            { value: "medium", label: "Среднее" },
            { value: "hard", label: "Жёсткое" }
          ]}
        />
      </View>

      <View style={{ gap: 13 }}>
        <Text selectable style={{ color: colors.label, fontSize: 22, fontWeight: "900" }}>
          Твои рекомендации
        </Text>
        {recommendations.map((racket, index) => (
          <RacketCard
            key={racket.id}
            racket={racket}
            rank={index + 1}
            reason={`${explainFit(racket, profile)} · match ${finderScore(racket, profile)}`}
          />
        ))}
      </View>
    </ScrollView>
  );
}
