import { css, definePrimitive } from "@ui-sdk/core";
import { code128Svg } from "./code128.js";
import { escapeHtml, reticleSvg } from "./glyph.js";
import { qrSvg, type QrLevel } from "./qr.js";

const star = definePrimitive({
  name: "ra-star",
  state: () => ({}),
  api: () => ({}),
  slots: slot => ({
    root: slot({
      attrs: () => ({ "aria-hidden": "true" }),
      bind: el => {
        el.innerHTML = reticleSvg();
      },
    }),
  }),
});

const crosshair = definePrimitive({
  name: "ra-crosshair",
  options: { corner: "string" },
  state: (options: { corner?: string }) => ({ corner: options.corner ?? "nw" }),
  sync: options => (options.corner === undefined ? {} : { corner: options.corner }),
  api: () => ({}),
  slots: slot => ({
    root: slot({
      attrs: state => ({
        "data-corner": state.corner,
        "aria-hidden": "true",
      }),
    }),
  }),
});

const ruler = definePrimitive({
  name: "ra-ruler",
  options: { from: "number", to: "number" },
  state: (options: { from?: number; to?: number }) => ({
    from: options.from ?? 0,
    to: options.to ?? 12,
  }),
  sync: options => ({
    ...(options.from === undefined ? {} : { from: options.from }),
    ...(options.to === undefined ? {} : { to: options.to }),
  }),
  api: () => ({}),
  slots: slot => ({
    root: slot({
      attrs: state => ({
        "aria-hidden": "true",
        "data-from": String(state.from),
        "data-to": String(state.to),
      }),
      bind: (el, part) => {
        const draw = () => {
          const { from, to } = part.store.get();
          const ticks: string[] = [];
          for (let value = from; value <= to; value += 1) {
            ticks.push(`<span><em>${String(value).padStart(2, "0")}</em></span>`);
          }
          el.innerHTML = `${ticks.join("")}<i></i>`;
        };
        draw();
        return part.store.subscribe(draw);
      },
    }),
  }),
});

const sheet = definePrimitive({
  name: "ra-sheet",
  options: { label: "string" },
  state: (options: { label?: string }) => ({ label: options.label ?? "Release sheet" }),
  sync: options => (options.label === undefined ? {} : { label: options.label }),
  api: () => ({}),
  slots: slot => ({
    root: slot({
      attrs: state => ({
        role: "region",
        "aria-label": state.label,
      }),
    }),
  }),
});

const sheetMeta = definePrimitive({
  name: "ra-sheet-meta",
  options: {
    number: "string",
    sheet: "string",
    of: "string",
    revision: "string",
    date: "string",
  },
  state: (options: {
    number?: string;
    sheet?: string;
    of?: string;
    revision?: string;
    date?: string;
  }) => ({
    number: options.number ?? "001",
    sheet: options.sheet ?? "1",
    of: options.of ?? "1",
    revision: options.revision ?? "0.1.0",
    date: options.date ?? "",
  }),
  sync: options => ({
    ...(options.number === undefined ? {} : { number: options.number }),
    ...(options.sheet === undefined ? {} : { sheet: options.sheet }),
    ...(options.of === undefined ? {} : { of: options.of }),
    ...(options.revision === undefined ? {} : { revision: options.revision }),
    ...(options.date === undefined ? {} : { date: options.date }),
  }),
  api: () => ({}),
  slots: slot => ({
    root: slot({
      attrs: state => ({
        "aria-label": `Number ${state.number}, sheet ${state.sheet} of ${state.of}, revision ${state.revision}`,
      }),
      bind: (el, part) => {
        const draw = () => {
          const state = part.store.get();
          el.innerHTML = `<span>No. ${escapeHtml(state.number)}</span><span>${escapeHtml(state.date)}</span><span>Sheet ${escapeHtml(state.sheet)} of ${escapeHtml(state.of)}</span><span>Rev. ${escapeHtml(state.revision)}</span>`;
        };
        draw();
        return part.store.subscribe(draw);
      },
    }),
  }),
});

const sheetMargin = definePrimitive({
  name: "ra-sheet-margin",
  options: { side: "string" },
  state: (options: { side?: string }) => ({ side: options.side ?? "start" }),
  sync: options => (options.side === undefined ? {} : { side: options.side }),
  api: () => ({}),
  slots: slot => ({
    root: slot({
      attrs: state => ({ "data-side": state.side }),
    }),
  }),
});

const callout = definePrimitive({
  name: "ra-callout",
  options: { letter: "string", label: "string", x: "string", y: "string", side: "string" },
  state: (options: { letter?: string; label?: string; x?: string; y?: string; side?: string }) => ({
    letter: options.letter ?? "A",
    label: options.label ?? "",
    x: options.x ?? "50%",
    y: options.y ?? "50%",
    side: options.side ?? "right",
  }),
  sync: options => ({
    ...(options.letter === undefined ? {} : { letter: options.letter }),
    ...(options.label === undefined ? {} : { label: options.label }),
    ...(options.x === undefined ? {} : { x: options.x }),
    ...(options.y === undefined ? {} : { y: options.y }),
    ...(options.side === undefined ? {} : { side: options.side }),
  }),
  api: () => ({}),
  slots: slot => ({
    root: slot({
      attrs: state => ({
        role: "note",
        "aria-label": `${state.letter}. ${state.label}`,
        "data-side": state.side,
        style: css({ "--ra-x": state.x, "--ra-y": state.y }),
      }),
      bind: (el, part) => {
        const draw = () => {
          const state = part.store.get();
          el.innerHTML = `<span class="dot" aria-hidden="true"></span><span class="leader" aria-hidden="true"></span><span class="chip" aria-hidden="true">${escapeHtml(state.letter)}</span><span class="name">${escapeHtml(state.label)}</span>`;
        };
        draw();
        return part.store.subscribe(draw);
      },
    }),
  }),
});

const figure = definePrimitive({
  name: "ra-figure",
  state: () => ({}),
  api: () => ({}),
  slots: slot => ({
    root: slot({
      role: "figure",
      attrs: (_state, part) => ({ "aria-labelledby": `${part.id}-caption` }),
    }),
    media: slot({}),
    caption: slot({
      attrs: (_state, part) => ({ id: `${part.id}-caption` }),
    }),
  }),
});

const versionHero = definePrimitive({
  name: "ra-version-hero",
  options: { value: "string" },
  state: (options: { value?: string }) => ({ value: options.value ?? "0.1.0" }),
  sync: options => (options.value === undefined ? {} : { value: options.value }),
  api: () => ({}),
  slots: slot => ({
    root: slot({
      attrs: state => ({
        role: "img",
        "aria-label": `Version ${state.value}`,
      }),
      bind: (el, part) => {
        const draw = () => {
          const parts = part.store.get().value.split(".");
          el.innerHTML = parts
            .map((piece, index) => {
              const dot = index === parts.length - 1 ? "" : `<span class="dot" aria-hidden="true">.</span>`;
              return `<span class="num">${escapeHtml(piece)}</span>${dot}`;
            })
            .join("");
        };
        draw();
        return part.store.subscribe(draw);
      },
    }),
  }),
});

const specTable = definePrimitive({
  name: "ra-spec-table",
  options: { label: "string" },
  state: (options: { label?: string }) => ({ label: options.label ?? "Release specification" }),
  sync: options => (options.label === undefined ? {} : { label: options.label }),
  api: () => ({}),
  slots: slot => ({
    root: slot({
      role: "table",
      attrs: state => ({ "aria-label": state.label }),
    }),
    row: slot({ role: "row" }),
    cell: slot({ role: "cell" }),
    label: slot({}),
    value: slot({}),
  }),
});

const pill = definePrimitive({
  name: "ra-pill",
  options: { variant: "string" },
  state: (options: { variant?: string }) => ({ variant: options.variant ?? "outline" }),
  sync: options => (options.variant === undefined ? {} : { variant: options.variant }),
  api: () => ({}),
  slots: slot => ({
    root: slot({
      attrs: state => ({ "data-variant": state.variant }),
    }),
  }),
});

const tag = definePrimitive({
  name: "ra-tag",
  state: () => ({}),
  api: () => ({}),
  slots: slot => ({
    root: slot({}),
  }),
});

const changeList = definePrimitive({
  name: "ra-change-list",
  options: { label: "string" },
  state: (options: { label?: string }) => ({ label: options.label ?? "Changes" }),
  sync: options => (options.label === undefined ? {} : { label: options.label }),
  api: () => ({}),
  slots: slot => ({
    root: slot({
      role: "list",
      attrs: state => ({ "aria-label": state.label }),
    }),
    item: slot({ role: "listitem" }),
    index: slot({}),
    title: slot({}),
    body: slot({}),
  }),
});

const barcode = definePrimitive({
  name: "ra-barcode",
  options: { value: "string" },
  state: (options: { value?: string }) => ({ value: options.value ?? "" }),
  sync: options => (options.value === undefined ? {} : { value: options.value }),
  api: () => ({}),
  slots: slot => ({
    root: slot({
      attrs: state => ({
        role: "img",
        "aria-label": `Code 128 ${state.value}`,
      }),
      bind: (el, part) => {
        const draw = () => {
          const { value } = part.store.get();
          if (!value) {
            el.innerHTML = "";
            return;
          }
          el.innerHTML = `${code128Svg(value)}<span class="readout">${escapeHtml(value)}</span>`;
        };
        draw();
        return part.store.subscribe(draw);
      },
    }),
  }),
});

const qr = definePrimitive({
  name: "ra-qr",
  options: { value: "string", level: "string" },
  state: (options: { value?: string; level?: string }) => ({
    value: options.value ?? "",
    level: options.level === "M" ? "M" : "L",
  }),
  sync: options => ({
    ...(options.value === undefined ? {} : { value: options.value }),
    ...(options.level === undefined ? {} : { level: options.level === "M" ? "M" : "L" }),
  }),
  api: () => ({}),
  slots: slot => ({
    root: slot({
      attrs: state => ({
        role: "img",
        "aria-label": `QR code for ${state.value}`,
      }),
      bind: (el, part) => {
        const draw = () => {
          const state = part.store.get();
          if (!state.value) {
            el.innerHTML = "";
            return;
          }
          el.innerHTML = qrSvg(state.value, state.level as QrLevel);
        };
        draw();
        return part.store.subscribe(draw);
      },
    }),
  }),
});

const prose = definePrimitive({
  name: "ra-prose",
  state: () => ({}),
  api: () => ({}),
  slots: slot => ({
    root: slot({}),
  }),
});

const seal = definePrimitive({
  name: "ra-seal",
  options: { text: "string" },
  state: (options: { text?: string }) => ({
    text: options.text ?? "RADIANT AUSTERITY UI KIT · ",
  }),
  sync: options => (options.text === undefined ? {} : { text: options.text }),
  api: () => ({}),
  slots: slot => ({
    root: slot({
      attrs: state => ({
        role: "img",
        "aria-label": state.text.replace(/\s·\s?$/, ""),
      }),
      bind: (el, part) => {
        const draw = () => {
          const text = part.store.get().text;
          const pathId = el.id || `ra-seal-${Math.random().toString(36).slice(2, 8)}`;
          if (!el.id) el.id = pathId;
          const ring = `${text} ${text}`.trim();
          el.innerHTML = `<svg viewBox="0 0 200 200" aria-hidden="true"><defs><path id="${pathId}-ring" d="M100 100 m -74 0 a 74 74 0 1 1 148 0 a 74 74 0 1 1 -148 0"/></defs><g class="ring"><text><textPath href="#${pathId}-ring">${escapeHtml(ring)}</textPath></text></g><g class="hub"><path d="M88 94V88h6M112 88h6v6M118 106v6h-6M94 112h-6v-6"/></g></svg>`;
        };
        draw();
        return part.store.subscribe(draw);
      },
    }),
  }),
});

export {
  barcode,
  callout,
  changeList,
  crosshair,
  figure,
  pill,
  qr,
  ruler,
  prose,
  seal,
  sheet,
  sheetMargin,
  sheetMeta,
  specTable,
  star,
  tag,
  versionHero,
};
