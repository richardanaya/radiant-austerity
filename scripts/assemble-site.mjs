import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const site = join(root, "dist/site");
rmSync(site, { recursive: true, force: true });
mkdirSync(site, { recursive: true });
cpSync(join(root, "dist/demo"), site, { recursive: true });
cpSync(join(root, "dist/cdn"), join(site, "cdn"), { recursive: true });
