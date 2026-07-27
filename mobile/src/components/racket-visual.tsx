import { Image } from "expo-image";
import { Text, View } from "react-native";

import { getRacketImageSource } from "@/data/racket-images";
import { colors } from "@/theme/colors";
import type { CatalogRacket } from "@/types/catalog";

export function RacketVisual({
  racket,
  height = 170
}: {
  racket: CatalogRacket;
  height?: number;
}) {
  const source = getRacketImageSource(racket.imageUrl);

  return (
    <View
      style={{
        height,
        borderRadius: 18,
        borderCurve: "continuous",
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.dark
      }}
    >
      {source ? (
        <Image
          source={source}
          contentFit="contain"
          transition={180}
          style={{ width: "100%", height: "100%" }}
          accessibilityLabel={`Ракетка ${racket.fullName}`}
        />
      ) : (
        <>
          <Text
            selectable
            style={{ color: colors.onAccent, fontSize: 38, fontWeight: "900", letterSpacing: -1 }}
          >
            {racket.brand.slice(0, 1)}
            {racket.model.slice(0, 1)}
          </Text>
          <Text
            selectable
            style={{ color: "#d9b79f", fontSize: 11, fontWeight: "700", letterSpacing: 2 }}
          >
            PADELCOMPARE
          </Text>
        </>
      )}
    </View>
  );
}
