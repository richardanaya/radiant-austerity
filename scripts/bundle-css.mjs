import { readFileSync, writeFileSync } from "node:fs";

const web = readFileSync("node_modules/@ui-sdk/core/dist/web.css", "utf8");
const tokens = readFileSync("src/tokens.css", "utf8");
const fonts = readFileSync("src/fonts.css", "utf8");
const widgets = readFileSync("src/widgets.css", "utf8");
const theme = readFileSync("src/theme.css", "utf8")
  .replace('@import "@ui-sdk/core/web.css";\n', "")
  .replace('@import "./tokens.css";\n', "")
  .replace('@import "./fonts.css";\n', fonts)
  .replace('@import "./widgets.css";\n', widgets);

writeFileSync("dist/theme.css", `${web}\n${tokens}\n${theme}`);
writeFileSync("dist/tokens.css", tokens);
