export function AffiliateDisclosure({
  compact = false
}: {
  compact?: boolean;
}) {
  return (
    <p className={compact ? "affiliate-note affiliate-note--compact" : "affiliate-note"}>
      Некоторые ссылки на магазины и бренды идут через affiliate tracking, если у партнёра это уже поддерживается.
      Для пользователя цена от этого не меняется.
    </p>
  );
}
