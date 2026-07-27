import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useAppState } from "@/providers/app-state";
import { colors } from "@/theme/colors";
import { formatPrice } from "@/utils/catalog";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function BrandsScreen() {
  const { catalog } = useAppState();
  const groups = [...new Set(catalog.map((item) => item.brand))]
    .map((brand) => {
      const rackets = catalog.filter((item) => item.brand === brand);
      return {
        brand,
        count: rackets.length,
        minPrice: Math.min(...rackets.map((item) => item.currentPrice)),
        latest: Math.max(...rackets.map((item) => item.season))
      };
    })
    .sort((left, right) => right.count - left.count);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 16, paddingBottom: 80, gap: 12 }}
      style={{ backgroundColor: colors.background }}
    >
      {groups.map((group) => (
        <Link
          key={group.brand}
          href={{ pathname: "/brand/[slug]", params: { slug: slugify(group.brand) } }}
          asChild
        >
          <Pressable
            accessibilityRole="link"
            style={({ pressed }) => ({
              backgroundColor: colors.surface,
              borderRadius: 18,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: colors.separator,
              padding: 17,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 14,
              opacity: pressed ? 0.7 : 1
            })}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text selectable style={{ color: colors.label, fontSize: 19, fontWeight: "900" }}>
                {group.brand}
              </Text>
              <Text selectable style={{ color: colors.secondaryLabel, fontSize: 13 }}>
                {group.count} моделей · сезон до {group.latest}
              </Text>
            </View>
            <Text selectable style={{ color: colors.accent, fontWeight: "800" }}>
              от {formatPrice(group.minPrice)}
            </Text>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}
