const PHOTO_BY_ID: Record<string, string> = {
  "bullpadel-vertex-04-25": "/rackets/photos/bullpadel-vertex-04-25.jpg",
  "nox-at10-18k-25": "/rackets/photos/nox-at10-18k-25.webp",
  "adidas-metalbone-ctrl-25": "/rackets/photos/adidas-metalbone-ctrl-25.webp",
  "babolat-counter-viper-25": "/rackets/photos/babolat-counter-viper-25.jpg",
  "babolat-air-viper-25": "/rackets/photos/babolat-air-viper-25.jpg",
  "head-speed-motion-25": "/rackets/photos/head-speed-motion-25.webp",
  "wilson-blade-pro-v3": "/rackets/photos/wilson-blade-pro-v3.jpg",
  "siux-electra-stupa-pro": "/rackets/photos/siux-electra-stupa-pro.jpg",
  "starvie-triton-soft-25": "/rackets/photos/starvie-triton-soft-25.png",
  "adidas-cross-it-light-25": "/rackets/photos/adidas-cross-it-light-25.webp",
  "adidas-metalbone-hrd-25": "/rackets/photos/adidas-metalbone-hrd-25.webp",
  "starvie-basalto-soft-25": "/rackets/photos/starvie-basalto-soft-25.jpg",
  "nox-ml10-ventus-control-26": "/rackets/photos/nox-ml10-ventus-control-26.png",
  "babolat-technical-viper-25": "/rackets/photos/babolat-technical-viper-25.jpg",
  "nox-at10-attack-12k-26": "/rackets/photos/nox-at10-attack-12k-26.png",
  "bullpadel-hack-03-25": "/rackets/photos/bullpadel-hack-03-25.jpg",
  "head-extreme-pro-25": "/rackets/photos/head-extreme-pro-25.png",
  "siux-diablo-pro-4-25": "/rackets/photos/siux-diablo-pro-4-25.jpg",
  "starvie-astrum-soft-25": "/rackets/photos/starvie-astrum-soft-25.webp",
  "wilson-defy-pro-v1-25": "/rackets/photos/wilson-defy-pro-v1-25.webp",
  "adidas-cross-it-light-26-marta": "/rackets/photos/adidas-cross-it-light-26-marta.webp",
  "adidas-metalbone-team-light-26": "/rackets/photos/adidas-metalbone-team-light-26.webp",
  "nox-equation-soft-advanced-26": "/rackets/photos/nox-equation-soft-advanced-26.webp",
  "royal-padel-m27-poly-26": "/rackets/photos/royal-padel-m27-poly-26.webp",
  "starvie-raptor-plus-26": "/rackets/photos/starvie-raptor-plus-26.webp"
};

function buildInlinePlaceholder(id: string) {
  const label = id
    .split("-")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || "PC";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#201711" />
          <stop offset="55%" stop-color="#8f4a20" />
          <stop offset="100%" stop-color="#d7975b" />
        </linearGradient>
      </defs>
      <rect width="1200" height="1600" rx="72" fill="url(#bg)" />
      <rect x="94" y="94" width="1012" height="1412" rx="56" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.14)" />
      <text x="600" y="730" text-anchor="middle" font-family="Arial, sans-serif" font-size="220" font-weight="700" fill="#fff8f0">${label}</text>
      <text x="600" y="980" text-anchor="middle" font-family="Arial, sans-serif" font-size="54" letter-spacing="8" fill="rgba(255,248,240,0.72)">PADELCOMPARE</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function getRacketImageUrl(id: string) {
  const directPhoto = PHOTO_BY_ID[id];
  if (directPhoto) return directPhoto;

  const basePhotoEntry = Object.entries(PHOTO_BY_ID).find(([baseId]) => id === baseId || id.startsWith(`${baseId}-`));
  if (basePhotoEntry) return basePhotoEntry[1];

  return buildInlinePlaceholder(id);
}

export function getRacketImageAlt(fullName: string) {
  return `${fullName} racket image`;
}
