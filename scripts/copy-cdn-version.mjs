import { cpSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const version = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
const from = join(root, "dist/cdn");
const banner = `/*! Radiant Austerity UI Kit v${version} · MIT License · (c) 2026 Richard Anaya */\n`;
for (const name of ["radiant-austerity.js", "radiant-austerity.css"]) {
  const file = join(from, name);
  const text = readFileSync(file, "utf8");
  if (!text.startsWith(banner)) writeFileSync(file, banner + text);
}
const to = join(from, `v${version}`);
mkdirSync(to, { recursive: true });
for (const name of readdirSync(from)) {
  if (name === `v${version}`) continue;
  cpSync(join(from, name), join(to, name), { recursive: true });
}
