# Radiant Austerity UI Kit

An editorial component library. The page is a sheet: cream paper, ink rules, a yellow action, and an orange reticle. Release `0.1.0`.

The parts are [UI SDK](https://ui-sdk.dev) primitives rendered as Web Components by `@ui-sdk/web` **0.1.0-beta.13**. There is no `@vercel/ui-sdk` package. The adapter does not use shadow DOM or CSS `::part`. Each part is a light-DOM custom element. Style it with `[data-slot]` and the `--ui-*` tokens. `data-slot` is the primitive name for a root and `name-slot` for the rest (`ra-spec-table-row`, not `ra-spec-row`).

## Use it

```ts
import "radiant-austerity-ui-kit/theme.css";
import "radiant-austerity-ui-kit";
```

`theme.css` includes the SDK's `web.css`, the self-hosted Inter and Geist Serif faces, and this kit's tokens. Interactive parts (`ra-button`, `ra-input`, `ra-toggle`, `ra-tabs`, `ra-dialog`, `ra-tooltip`) are the SDK primitives registered under `ra-*` tags, so keyboard behavior, focus, and roles come from the primitive.

```html
<ra-button>
  <button type="button" data-variant="yellow">Mark the sheet</button>
</ra-button>
```

Buttons, tabs, toggles, dialogs, and tooltips wrap a native `<button>`. Dialog and tooltip popups start with the `hidden` attribute.

A primary button is a yellow fill with ink text. On hover it inverts to an ink fill with yellow text. Outline controls stay square. `:focus-visible` is a 2px orange outline, offset 3px. Cyan, lime, and magenta are diagonal stripe swatches on badges and tags (`data-variant="cyan"` and the same for `lime`, `magenta`, and `yellow`). They are not text, buttons, or states.

`ra-prose` is the long-form face: Geist Serif at 400, 20px on 32px leading, a 760px measure, left aligned. Under a 520px measure it drops to 18px on 30px. Inter is every other role. The wordmark is the same serif, cream on an ink field, with scanlines clipped into the glyphs.

## Use from CDN

The Pages build publishes a self-contained ESM bundle. The script brings the UI SDK with it, so the page needs no bundler and no import map. Fonts are in the CSS.

```html
<link rel="stylesheet" href="https://richardanaya.github.io/radiant-austerity/cdn/radiant-austerity.css" />
<script type="module" src="https://richardanaya.github.io/radiant-austerity/cdn/radiant-austerity.js"></script>

<ra-button>
  <button type="button" data-variant="yellow">Mark the sheet</button>
</ra-button>
```

Pin a release at `https://richardanaya.github.io/radiant-austerity/cdn/v0.1.0/radiant-austerity.js` and the matching `.css`. The demo sheets are on the same site: `/`, `/gallery.html`, `/app.html`. `cdn-test.html` loads only those CDN files.

## Responsive

Parts stay inside the viewport. Each `[data-slot]` uses `min-width: 0` and `max-width: 100%`, and rows (`ra-toolbar`, `ra-menubar`, `ra-pagination`, `ra-breadcrumb`, segmented controls) wrap. Type, space, and the version hero use `clamp()`, so the release numerals shrink on a phone and keep their desktop size.

Under 720px the sheet drops its side gutters. The vertical margin notes become a top strip and a bottom strip, and the frame padding tightens so the plate is not a narrow column inside a wide border. Callout labels sit under the figure instead of running off it, and the ruler keeps every tick but labels every fourth one.

Popovers, menus, selects, drawers, and toasts use `max-width: calc(100vw - 1rem)`. Dialogs and alert dialogs become a full-width bottom sheet. `src/anchor.ts` opens a popup below its trigger, or above it when that side has more room, then clamps it to an 8px margin. Interactive controls are at least 44px tall on a narrow screen.

The sheet nav of three links stays one scrolling row on a phone. A longer in-sheet path (`.mast-path`) becomes a two-column ruled grid under 640px.

## Parts

`ra-sheet`, `ra-sheet-meta`, `ra-sheet-margin`, `ra-ruler`, `ra-crosshair`, `ra-star`, `ra-callout`, `ra-figure`, `ra-figure-media`, `ra-figure-caption`, `ra-version-hero`, `ra-spec-table`, `ra-spec-row`, `ra-spec-cell`, `ra-spec-label`, `ra-spec-value`, `ra-pill`, `ra-badge`, `ra-tag`, `ra-change-list`, `ra-change-item`, `ra-change-index`, `ra-change-title`, `ra-change-body`, `ra-barcode`, `ra-qr`, `ra-seal`, `ra-prose`, `ra-button`, `ra-field`, `ra-field-label`, `ra-field-description`, `ra-field-error`, `ra-input`, `ra-input-group`, `ra-input-clear`, `ra-toggle`, `ra-toggle-group`, `ra-tabs`, `ra-tabs-list`, `ra-tabs-tab`, `ra-tabs-panel`, `ra-dialog`, `ra-dialog-trigger`, `ra-dialog-backdrop`, `ra-dialog-content`, `ra-dialog-title`, `ra-dialog-description`, `ra-dialog-close`, `ra-tooltip`, `ra-tooltip-trigger`, `ra-tooltip-content`.

The same sheet also registers the rest of the SDK primitives used here: checkbox, radio, switch, slider, select, combobox, autocomplete, listbox, segmented control, number input, password input, OTP input, file input, textarea, rating, alert dialog, drawer, popover, hover card, menu, menubar, trigger menu, toast, command, accordion, collapsible, separator, scroll area, resizable, avatar, progress, meter, pagination, navigation menu, toolbar, calendar, date picker, date input, and time input. Card, breadcrumb, alert, spinner, and skeleton are local sheet parts. The full tag list is `components` in `src/catalog.ts` (218 tags).

`ra-badge` is the same pill primitive as `ra-pill` (a subclass, because one custom-element class cannot be registered twice). `ra-barcode` draws Code 128 set B. `ra-qr` draws a byte-mode QR symbol, levels L and M, versions 1–6. `ra-star` draws the orange reticle. Corner dots on `ra-crosshair` are the only circles.

Tokens live on `:root` as `--cream`, `--ink`, `--yellow`, `--orange`, `--cyan`, `--lime`, `--magenta`, and the `--ra-*` aliases the parts read. `--ui-primary` is yellow. `--ui-ring` is orange. Focus rings are 2px orange. Rules are 1px solid ink. The sheet border is 2px ink, max width 1120px.

Cream `#f1f0db` is the paper. Ink `#171816` is the text. Yellow `#f9c602` is the primary action, the selection, and the skip link. Orange `#fe4a08` is the hover on a cream surface, the focus outline, the bar, the reticle, and the ruler ticks. It is not a fill anywhere else. Cyan `#02d7e3`, lime `#54d815`, and magenta `#fb66c9` are stripe fills only.

Inter (weight 100–900, self-hosted) is the UI face: body 16px / 500 / 1.35, labels 11px / 650 / 0.14em, nav 12px / 650, section headings 13px / 750 / 0.12em, titles `clamp(26px, 4.2cqw, 44px)`. Geist Serif is 400 only, with `font-synthesis: none`, and it is used for `ra-prose` and the wordmark. Both faces are in `assets/` with their OFL licenses.

A radio is a square with an inner square. A switch is a square track and a square thumb. Avatars, toasts, pills, and buttons are square. The 9px ink dots on the sheet corners are the only `border-radius`.

## SDK gaps

- The public adapter exports `createParts`, `wrappedButton`, and `wrappedChild`. It does not export `instanceOf`. A toggle group needs its full api, including `internal`, for arrow keys and roving tabindex, and `element.api` hides `internal`. The group element stores that api from `createParts`' `render` hook.
- Popup helpers used by the shipped tooltip and dialog registrations are not public. These tags use the documented `createParts` map. Dialogs still open in the top layer and trap focus. `src/anchor.ts` is a local fallback: if an overlay opens without a position, it pins the content under the trigger. The primitive's own placement wins when it sets one.
- `definePart` is not a public export, so a submenu is a second `createParts` root (`ra-menu-sub`) registered before the menu parts. Calendar day tags list `ra-date-picker` as an extra owner, which is the public `owners` option.
- Lists (select, combobox, command, menu, rating) are written markup. The shipped list renderer uses unpublished helpers.
- `PartDisplay` has no inline value. Inline layout is unlayered CSS on `[data-slot]`, which wins over the adapter's `@layer ui-sdk` display rules.
- A button's authored `type` is not preserved by this registration. Put `type="button"` on the inner button.
- `definePrimitive`'s return type is not portable under `declaration` (TS2742). The package ships a hand-written `types/index.d.ts` instead of emitted declarations.

## Scripts

Node 22 or newer.

```sh
npm install
npm run dev       # demo at http://127.0.0.1:4173, /gallery.html, and /app.html
npm run check     # types, unit tests, library build, CDN bundle, Pages site, Playwright
```

The demo poster is a release sheet for this kit. It does not reproduce another project's copy or photograph.

## License

[MIT](LICENSE). Copyright (c) 2026 Richard Anaya.

Forked from claudia-ui-kit.
