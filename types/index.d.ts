/** A `definePrimitive` result. Importing the package registers its `ra-*` element. */
export interface EditorialPrimitive {
  readonly name: string;
}

export const UI_SDK_VERSION: string;
/** Every registered `ra-*` tag. The runtime list in `src/catalog.ts` is the source. */
export const components: readonly string[];
export type ComponentTag = string;

/** Editorial primitives. Registered as `ra-*` elements by importing the package. */
export const barcode: EditorialPrimitive;
export const callout: EditorialPrimitive;
export const changeList: EditorialPrimitive;
export const crosshair: EditorialPrimitive;
export const figure: EditorialPrimitive;
export const pill: EditorialPrimitive;
export const qr: EditorialPrimitive;
export const prose: EditorialPrimitive;
export const ruler: EditorialPrimitive;
export const seal: EditorialPrimitive;
export const sheet: EditorialPrimitive;
export const sheetMargin: EditorialPrimitive;
export const sheetMeta: EditorialPrimitive;
export const specTable: EditorialPrimitive;
export const star: EditorialPrimitive;
export const tag: EditorialPrimitive;
export const versionHero: EditorialPrimitive;
export const card: EditorialPrimitive;
export const breadcrumb: EditorialPrimitive;
export const breadcrumbItem: EditorialPrimitive;
export const alertBanner: EditorialPrimitive;
export const spinner: EditorialPrimitive;
export const skeleton: EditorialPrimitive;

export function code128Symbols(text: string): number[];
export function code128Modules(text: string): number[];
export function code128Svg(text: string): string;

export type QrLevel = "L" | "M";
export function chooseQrVersion(text: string, level?: QrLevel): number;
export function qrMatrix(text: string, level?: QrLevel, version?: number): boolean[][];
export function qrSvg(text: string, level?: QrLevel): string;

export { createAgent, registerTools } from "@ui-sdk/web/agent";
export { observe } from "@ui-sdk/core/observe";
export { createToaster, toast } from "@ui-sdk/web";
