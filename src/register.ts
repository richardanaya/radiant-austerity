import { createParts } from "@ui-sdk/web";
import "./controls.js";
import { alertBanner, breadcrumb, breadcrumbItem, card, skeleton, spinner } from "./display.js";
import {
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

const block = { display: "block" } as const;

createParts(star, { root: { tag: "ra-star", display: "block" } });
createParts(crosshair, { root: { tag: "ra-crosshair", display: "block" } });
createParts(ruler, { root: { tag: "ra-ruler", ...block } });
createParts(sheet, { root: { tag: "ra-sheet", ...block } });
createParts(sheetMeta, { root: { tag: "ra-sheet-meta", ...block } });
createParts(sheetMargin, { root: { tag: "ra-sheet-margin", ...block } });
createParts(callout, { root: { tag: "ra-callout", ...block } });
createParts(figure, {
  root: { tag: "ra-figure", ...block },
  media: { tag: "ra-figure-media", ...block },
  caption: { tag: "ra-figure-caption", ...block },
});
createParts(versionHero, { root: { tag: "ra-version-hero", ...block } });
createParts(specTable, {
  root: { tag: "ra-spec-table", ...block },
  row: { tag: "ra-spec-row", ...block },
  cell: { tag: "ra-spec-cell", ...block },
  label: { tag: "ra-spec-label", ...block },
  value: { tag: "ra-spec-value", ...block },
});

const pillParts = createParts(pill, {
  root: { tag: "ra-pill", display: "block" },
});
if (
  typeof customElements !== "undefined" &&
  pillParts.Root &&
  !customElements.get("ra-badge")
) {
  // A custom element class can only be defined once. A subclass keeps the
  // same primitive, so both tags share the pill parts and styles.
  customElements.define("ra-badge", class extends pillParts.Root {});
}

createParts(tag, { root: { tag: "ra-tag", display: "block" } });
createParts(changeList, {
  root: { tag: "ra-change-list", ...block },
  item: { tag: "ra-change-item", ...block },
  index: { tag: "ra-change-index", ...block },
  title: { tag: "ra-change-title", ...block },
  body: { tag: "ra-change-body", ...block },
});
createParts(barcode, { root: { tag: "ra-barcode", ...block } });
createParts(qr, { root: { tag: "ra-qr", ...block } });
createParts(seal, { root: { tag: "ra-seal", display: "block" } });
createParts(prose, { root: { tag: "ra-prose", display: "block" } });
createParts(card, { root: { tag: "ra-card", display: "block" } });
createParts(breadcrumb, { root: { tag: "ra-breadcrumb", display: "block" } });
createParts(breadcrumbItem, { root: { tag: "ra-breadcrumb-item", display: "block" } });
createParts(alertBanner, { root: { tag: "ra-alert", display: "block" } });
createParts(spinner, { root: { tag: "ra-spinner", display: "block" } });
createParts(skeleton, { root: { tag: "ra-skeleton", display: "block" } });
