import { Text, View } from "react-native";

import { colors } from "@/theme/colors";

export function MetricBar({
  label,
  value,
  compact = false
}: {
  label: string;
  value: number;
  compact?: boolean;
}) {
  return (
    <View style={{ gap: 5 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
        <Text selectable style={{ color: colors.secondaryLabel, fontSize: compact ? 12 : 13 }}>
          {label}
        </Text>
        <Text
          selectable
          style={{
            color: colors.label,
            fontSize: compact ? 12 : 13,
            fontWeight: "800",
            fontVariant: ["tabular-nums"]
          }}
        >
          {value}
        </Text>
      </View>
      <View
        style={{
          height: compact ? 5 : 7,
          backgroundColor: colors.tintSoft,
          borderRadius: 999,
          overflow: "hidden"
        }}
      >
        <View
          style={{
            width: `${value}%`,
            height: "100%",
            backgroundColor: colors.accent,
            borderRadius: 999
          }}
        />
      </View>
    </View>
  );
}
