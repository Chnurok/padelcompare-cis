import { Text, View } from "react-native";

import { colors } from "@/theme/colors";

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 22,
        borderCurve: "continuous",
        padding: 22,
        gap: 8,
        borderWidth: 1,
        borderColor: colors.separator
      }}
    >
      <Text selectable style={{ color: colors.label, fontSize: 20, fontWeight: "800" }}>
        {title}
      </Text>
      <Text selectable style={{ color: colors.secondaryLabel, fontSize: 15, lineHeight: 21 }}>
        {text}
      </Text>
    </View>
  );
}
