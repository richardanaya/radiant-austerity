import { accordion } from "@ui-sdk/core/accordion";
import { avatar } from "@ui-sdk/core/avatar";
import { collapsible } from "@ui-sdk/core/collapsible";
import { meter } from "@ui-sdk/core/meter";
import { progress } from "@ui-sdk/core/progress";
import { resizable } from "@ui-sdk/core/resizable";
import { scrollArea } from "@ui-sdk/core/scroll-area";
import { separator } from "@ui-sdk/core/separator";
import { createParts, wrappedButton } from "@ui-sdk/web";

createParts(accordion, {
  root: {
    tag: "ra-accordion",
    display: "block",
    defaults: { collapsible: true },
    api: ["getValue", "setValue", "isOpen", "open", "close", "toggle"],
  },
  item: { tag: "ra-accordion-item", display: "block" },
  header: {
    tag: "ra-accordion-header",
    display: "block",
    target: (el: HTMLElement) => (el.querySelector("h2, h3, h4") as HTMLElement | null) ?? el,
  },
  trigger: { tag: "ra-accordion-trigger", display: "contents", target: wrappedButton },
  panel: { tag: "ra-accordion-panel", display: "block" },
});

createParts(collapsible, {
  root: {
    tag: "ra-collapsible",
    display: "block",
    state: {
      open: {
        get: (api: { isOpen: () => boolean }) => api.isOpen(),
        set: (api: { setOpen: (open: boolean) => void }, open: boolean) => api.setOpen(!!open),
      },
    },
    api: ["isOpen", "setOpen", "toggle", "focus"],
  },
  trigger: { tag: "ra-collapsible-trigger", display: "contents", target: wrappedButton },
  panel: { tag: "ra-collapsible-panel", display: "block" },
});

createParts(separator, {
  root: { tag: "ra-separator", display: "block" },
});

createParts(scrollArea, {
  root: { tag: "ra-scroll-area", display: "block" },
  viewport: { tag: "ra-scroll-area-viewport", display: "block" },
  content: { tag: "ra-scroll-area-content", display: "block" },
  scrollbar: {
    tag: "ra-scroll-area-scrollbar",
    display: "block",
    context: (el: HTMLElement) => ({ id: el.getAttribute("orientation") ?? "vertical" }),
  },
  thumb: { tag: "ra-scroll-area-thumb", display: "block" },
});

createParts(resizable, {
  root: { tag: "ra-resizable", display: "block" },
  panel: {
    tag: "ra-resizable-panel",
    display: "block",
    kinds: { id: "string" },
  },
  handle: { tag: "ra-resizable-handle", display: "block" },
});

createParts(avatar, {
  root: {
    tag: "ra-avatar",
    display: "block",
    children: { image: (el: HTMLElement) => el.querySelector(":scope > img") },
    optionalChildren: ["image"],
  },
  fallback: { tag: "ra-avatar-fallback", display: "block" },
});

createParts(progress, {
  root: { tag: "ra-progress", display: "block" },
  track: { tag: "ra-progress-track", display: "block" },
  indicator: { tag: "ra-progress-indicator", display: "block" },
});

createParts(meter, {
  root: { tag: "ra-meter", display: "block" },
  track: { tag: "ra-meter-track", display: "block" },
  indicator: { tag: "ra-meter-indicator", display: "block" },
});
