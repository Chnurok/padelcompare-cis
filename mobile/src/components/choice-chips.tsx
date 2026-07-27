import { Pressable, ScrollView, Text, View } from "react-native";

import { colors } from "@/theme/colors";

type Choice<T extends string> = {
  value: T;
  label: string;
};

export function ChoiceChips<T extends string>({
  label,
  value,
  choices,
  onChange
}: {
  label?: string;
  value: T;
  choices: Choice<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <View style={{ gap: 8 }}>
      {label ? (
        <Text selectable style={{ color: colors.secondaryLabel, fontSize: 13, fontWeight: "600" }}>
          {label}
        </Text>
      ) : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {choices.map((choice) => {
          const selected = choice.value === value;
          return (
            <Pressable
              key={choice.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(choice.value)}
              style={({ pressed }) => ({
                backgroundColor: selected ? colors.accent : colors.surface,
                borderColor: selected ? colors.accent : colors.separator,
                borderWidth: 1,
                borderRadius: 999,
                paddingHorizontal: 14,
                paddingVertical: 9,
                opacity: pressed ? 0.72 : 1
              })}
            >
              <Text
                selectable
                style={{
                  color: selected ? colors.onAccent : colors.label,
                  fontWeight: "700",
                  fontSize: 14
                }}
              >
                {choice.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
