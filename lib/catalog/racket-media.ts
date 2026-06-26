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
  "nox-at10-attack-12k-26": "/rackets/photos/nox-at10-attack-12k-26.png"
};

export function getRacketImageUrl(id: string) {
  return PHOTO_BY_ID[id] ?? `/rackets/${id}.svg`;
}

export function getRacketImageAlt(fullName: string) {
  return `${fullName} racket image`;
}
