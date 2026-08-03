import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(root, "mobile", "google-play", "assets", "source");
const outputDir = path.join(root, "mobile", "google-play", "assets");

await mkdir(outputDir, { recursive: true });

const assets = [
  ["feature-graphic.svg", "feature-graphic.png"],
  ["phone-01-catalog.svg", "phone-01-catalog.png"],
  ["phone-02-finder.svg", "phone-02-finder.png"],
  ["phone-03-compare.svg", "phone-03-compare.png"]
];

await Promise.all(
  assets.map(([input, output]) =>
    sharp(path.join(sourceDir, input)).png({ compressionLevel: 9 }).toFile(path.join(outputDir, output))
  )
);

await sharp(path.join(root, "mobile", "assets", "images", "icon.png"))
  .resize(512, 512, { fit: "cover" })
  .png({ compressionLevel: 9 })
  .toFile(path.join(outputDir, "play-icon-512.png"));

console.log(`Rendered ${assets.length + 1} Google Play assets to ${outputDir}`);
