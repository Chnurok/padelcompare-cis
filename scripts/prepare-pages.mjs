import { cp, mkdir, rm, writeFile } from "node:fs/promises";

const output = new URL("../_site/", import.meta.url);

await rm(output, { recursive: true, force: true });
await mkdir(new URL("brand/", output), { recursive: true });
await mkdir(new URL("catalog/", output), { recursive: true });
await mkdir(new URL("data/", output), { recursive: true });

await Promise.all([
  cp(new URL("../index.html", import.meta.url), new URL("index.html", output)),
  cp(new URL("../404.html", import.meta.url), new URL("404.html", output)),
  cp(new URL("../static-pages/catalog/index.html", import.meta.url), new URL("catalog/index.html", output)),
  cp(new URL("../public/brand/", import.meta.url), new URL("brand/", output), { recursive: true }),
  cp(new URL("../public/rackets/", import.meta.url), new URL("rackets/", output), { recursive: true }),
  cp(new URL("../mobile/src/data/catalog.json", import.meta.url), new URL("data/catalog.json", output))
]);

await writeFile(new URL(".nojekyll", output), "", "utf8");
console.log("Prepared GitHub Pages artifact in _site");
