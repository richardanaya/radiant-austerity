import "./register.js";
import { watchConcealedLabels } from "./conceal.js";

if (typeof document !== "undefined") watchConcealedLabels();

export { UI_SDK_VERSION, components, type ComponentTag } from "./catalog.js";
export {
  barcode,
  callout,
  changeList,
  crosshair,
  figure,
  pill,
  qr,
  prose,
  ruler,
  seal,
  sheet,
  sheetMargin,
  sheetMeta,
  specTable,
  star,
  tag,
  versionHero,
} from "./primitives.js";
export { alertBanner, breadcrumb, breadcrumbItem, card, skeleton, spinner } from "./display.js";
export { code128Modules, code128Svg, code128Symbols } from "./code128.js";
export { chooseQrVersion, qrMatrix, qrSvg } from "./qr.js";
export { createAgent, registerTools } from "@ui-sdk/web/agent";
export { observe } from "@ui-sdk/core/observe";
export { createToaster, toast } from "@ui-sdk/web";
