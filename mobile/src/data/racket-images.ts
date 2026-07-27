import adidasCrossItLight25 from "../../assets/rackets/adidas-cross-it-light-25.webp";
import adidasCrossItLight26Marta from "../../assets/rackets/adidas-cross-it-light-26-marta.webp";
import adidasMetalboneCtrl25 from "../../assets/rackets/adidas-metalbone-ctrl-25.webp";
import adidasMetalboneHrd25 from "../../assets/rackets/adidas-metalbone-hrd-25.webp";
import adidasMetalboneTeamLight26 from "../../assets/rackets/adidas-metalbone-team-light-26.webp";
import babolatAirViper25 from "../../assets/rackets/babolat-air-viper-25.jpg";
import babolatCounterViper25 from "../../assets/rackets/babolat-counter-viper-25.jpg";
import babolatTechnicalViper25 from "../../assets/rackets/babolat-technical-viper-25.jpg";
import bullpadelHack0325 from "../../assets/rackets/bullpadel-hack-03-25.jpg";
import bullpadelVertex0425 from "../../assets/rackets/bullpadel-vertex-04-25.jpg";
import headExtremePro25 from "../../assets/rackets/head-extreme-pro-25.png";
import headSpeedMotion25 from "../../assets/rackets/head-speed-motion-25.webp";
import noxAt1018k25 from "../../assets/rackets/nox-at10-18k-25.webp";
import noxAt10Attack12k26 from "../../assets/rackets/nox-at10-attack-12k-26.png";
import noxEquationSoftAdvanced26 from "../../assets/rackets/nox-equation-soft-advanced-26.webp";
import noxMl10VentusControl26 from "../../assets/rackets/nox-ml10-ventus-control-26.png";
import royalPadelM27Poly26 from "../../assets/rackets/royal-padel-m27-poly-26.webp";
import siuxDiabloPro425 from "../../assets/rackets/siux-diablo-pro-4-25.jpg";
import siuxElectraStupaPro from "../../assets/rackets/siux-electra-stupa-pro.jpg";
import starvieAstrumSoft25 from "../../assets/rackets/starvie-astrum-soft-25.webp";
import starvieBasaltoSoft25 from "../../assets/rackets/starvie-basalto-soft-25.jpg";
import starvieRaptorPlus26 from "../../assets/rackets/starvie-raptor-plus-26.webp";
import starvieTritonSoft25 from "../../assets/rackets/starvie-triton-soft-25.png";
import wilsonBladeProV3Alt from "../../assets/rackets/wilson-blade-pro-v3-alt.webp";
import wilsonBladeProV3Jpg from "../../assets/rackets/wilson-blade-pro-v3.jpg";
import wilsonBladeProV3Webp from "../../assets/rackets/wilson-blade-pro-v3.webp";
import wilsonDefyProV125 from "../../assets/rackets/wilson-defy-pro-v1-25.webp";

const images: Record<string, number> = {
  "adidas-cross-it-light-25.webp": adidasCrossItLight25,
  "adidas-cross-it-light-26-marta.webp": adidasCrossItLight26Marta,
  "adidas-metalbone-ctrl-25.webp": adidasMetalboneCtrl25,
  "adidas-metalbone-hrd-25.webp": adidasMetalboneHrd25,
  "adidas-metalbone-team-light-26.webp": adidasMetalboneTeamLight26,
  "babolat-air-viper-25.jpg": babolatAirViper25,
  "babolat-counter-viper-25.jpg": babolatCounterViper25,
  "babolat-technical-viper-25.jpg": babolatTechnicalViper25,
  "bullpadel-hack-03-25.jpg": bullpadelHack0325,
  "bullpadel-vertex-04-25.jpg": bullpadelVertex0425,
  "head-extreme-pro-25.png": headExtremePro25,
  "head-speed-motion-25.webp": headSpeedMotion25,
  "nox-at10-18k-25.webp": noxAt1018k25,
  "nox-at10-attack-12k-26.png": noxAt10Attack12k26,
  "nox-equation-soft-advanced-26.webp": noxEquationSoftAdvanced26,
  "nox-ml10-ventus-control-26.png": noxMl10VentusControl26,
  "royal-padel-m27-poly-26.webp": royalPadelM27Poly26,
  "siux-diablo-pro-4-25.jpg": siuxDiabloPro425,
  "siux-electra-stupa-pro.jpg": siuxElectraStupaPro,
  "starvie-astrum-soft-25.webp": starvieAstrumSoft25,
  "starvie-basalto-soft-25.jpg": starvieBasaltoSoft25,
  "starvie-raptor-plus-26.webp": starvieRaptorPlus26,
  "starvie-triton-soft-25.png": starvieTritonSoft25,
  "wilson-blade-pro-v3-alt.webp": wilsonBladeProV3Alt,
  "wilson-blade-pro-v3.jpg": wilsonBladeProV3Jpg,
  "wilson-blade-pro-v3.webp": wilsonBladeProV3Webp,
  "wilson-defy-pro-v1-25.webp": wilsonDefyProV125
};

export function getRacketImageSource(path: string | null) {
  if (!path) return null;
  const filename = path.split("/").at(-1);
  return filename ? images[filename] ?? null : null;
}
