import { alertDialog } from "@ui-sdk/core/dialog";
import { command } from "@ui-sdk/core/command";
import { drawer } from "@ui-sdk/core/drawer";
import { hoverCard } from "@ui-sdk/core/hover-card";
import { menu } from "@ui-sdk/core/menu";
import { menubar } from "@ui-sdk/core/menubar";
import { popover } from "@ui-sdk/core/popover";
import { menuCheckable, menuContextTrigger } from "@ui-sdk/core/renderer";
import { toastRegion, type ToastItem } from "@ui-sdk/core/toast";
import { triggerMenu } from "@ui-sdk/core/trigger-menu";
import { createParts, wrappedButton, wrappedChild } from "@ui-sdk/web";
import { followAnchor } from "./anchor.js";
import { popupApi, popupKinds, popupState } from "./popup-state.js";

const menus = new WeakMap<Element, unknown>();
const bars = new WeakMap<Element, unknown>();

createParts(alertDialog, {
  root: {
    tag: "ra-alert-dialog",
    defaults: { dismissible: false },
    state: popupState,
    api: [...popupApi],
  },
  trigger: { tag: "ra-alert-dialog-trigger", target: wrappedButton, display: "contents" },
  backdrop: "ra-alert-dialog-backdrop",
  content: "ra-alert-dialog-content",
  title: "ra-alert-dialog-title",
  description: "ra-alert-dialog-description",
  close: { tag: "ra-alert-dialog-close", target: wrappedButton, display: "contents" },
});

createParts(drawer, {
  root: {
    tag: "ra-drawer",
    display: "block",
    defaults: { dismissible: true },
    state: popupState,
    api: [...popupApi],
  },
  trigger: { tag: "ra-drawer-trigger", target: wrappedButton, display: "contents" },
  close: { tag: "ra-drawer-close", target: wrappedButton, display: "contents" },
  backdrop: "ra-drawer-backdrop",
  viewport: "ra-drawer-viewport",
  content: {
    tag: "ra-drawer-content",
    render(el: HTMLElement) {
      if (el.parentElement?.localName === "ra-drawer-viewport") return;
      const viewport = document.createElement("ra-drawer-viewport");
      el.replaceWith(viewport);
      viewport.append(el);
    },
  },
  title: "ra-drawer-title",
  description: "ra-drawer-description",
  handle: "ra-drawer-handle",
});

createParts(popover, {
  root: {
    tag: "ra-popover",
    defaults: { dismissible: true },
    kinds: popupKinds,
    options: () => ({ container: undefined }),
    state: popupState,
    api: [...popupApi],
    render: (el: HTMLElement) => followAnchor(el, "ra-popover-content", "ra-popover-trigger"),
  },
  trigger: { tag: "ra-popover-trigger", target: wrappedButton, display: "contents" },
  content: { tag: "ra-popover-content", kinds: popupKinds },
  title: "ra-popover-title",
  description: "ra-popover-description",
  close: { tag: "ra-popover-close", target: wrappedButton, display: "contents" },
});

createParts(hoverCard, {
  root: {
    tag: "ra-hover-card",
    kinds: popupKinds,
    options: () => ({ container: undefined }),
    state: popupState,
    api: [...popupApi],
    render: (el: HTMLElement) => followAnchor(el, "ra-hover-card-content", "ra-hover-card-trigger"),
  },
  trigger: {
    tag: "ra-hover-card-trigger",
    display: "contents",
    target: (el: HTMLElement) =>
      (el.querySelector("a[href], button") as HTMLElement | null) ??
      (el.firstElementChild as HTMLElement | null),
  },
  content: { tag: "ra-hover-card-content", kinds: popupKinds },
});

const item = { tag: "ra-menu-item", display: "block" as const, defaults: { closeOnSelect: true } };

// A second root has to be registered first so later parts accept either tag
// as their owner. `definePart` is not a public package export.
createParts(menu, {
  root: {
    tag: "ra-menu-sub",
    display: "contents",
    kinds: { menubar: null, parent: null, container: null },
    options: (el: HTMLElement): any => ({
      parent: () => {
        const owner = el.parentElement?.closest("ra-menu, ra-menu-sub");
        return owner ? menus.get(owner) : undefined;
      },
    }),
    render(el, instance) {
      const api = (instance as { api?: unknown }).api;
      if (api) menus.set(el, api);
    },
  },
});

createParts(menu, {
  root: {
    tag: "ra-menu",
    defaults: { loop: true, dismissible: true },
    kinds: { ...popupKinds, menubar: null, parent: null },
    options: (el: HTMLElement) => ({
      container: undefined,
      menubar: () => {
        const bar = el.parentElement?.closest("ra-menubar");
        return (bar ? bars.get(bar) : undefined) as never;
      },
    }),
    state: popupState,
    api: [...popupApi],
    render(el: HTMLElement, instance) {
      const api = (instance as { api?: unknown }).api;
      if (api) menus.set(el, api);
      return followAnchor(el, "ra-menu-content", "ra-menu-trigger");
    },
  },
  trigger: { tag: "ra-menu-trigger", target: wrappedButton, display: "contents" },
  "context-trigger": {
    tag: "ra-menu-context-trigger",
    display: "contents",
    feature: menuContextTrigger,
    target: (el: HTMLElement) => (el.firstElementChild as HTMLElement | null) ?? el,
  },
  content: { tag: "ra-menu-content", kinds: popupKinds },
  item,
  "checkbox-item": { tag: "ra-menu-checkbox-item", display: "block", feature: menuCheckable },
  separator: { tag: "ra-menu-separator", display: "block" },
});

createParts(menubar, {
  root: {
    tag: "ra-menubar",
    display: "block",
    defaults: { loop: true },
    api: ["focus", "isOpen", "close"],
    render(el, instance) {
      const api = (instance as { api?: unknown }).api;
      if (api) bars.set(el, api);
    },
  },
});

createParts(triggerMenu, {
  root: {
    tag: "ra-trigger-menu",
    display: "block",
    options: (): any => ({ container: undefined, triggers: [{ char: "/" }] }),
    kinds: popupKinds,
    state: popupState,
    api: ["isOpen", "setOpen", "open", "close", "getQuery", "getMatch", "insert", "focus"],
    render: (el: HTMLElement) => followAnchor(el, "ra-trigger-menu-content", "ra-trigger-menu-input"),
  },
  input: {
    tag: "ra-trigger-menu-input",
    display: "contents",
    target: wrappedChild("textarea, input"),
  },
  content: { tag: "ra-trigger-menu-content", kinds: popupKinds },
  item: { tag: "ra-trigger-menu-item", display: "block" },
});

createParts(toastRegion, {
  root: {
    tag: "ra-toast-region",
    self: "region",
    display: "block",
    api: ["focus", "pause", "resume"],
    render(el: HTMLElement, instance) {
      const live = instance as unknown as {
        get: () => { items?: readonly ToastItem[] };
        subscribe: (fn: () => void) => () => void;
      };
      const draw = () => {
        for (const child of [...el.children]) {
          if (child.localName === "ra-toast") child.remove();
        }
        for (const item of live.get().items ?? []) {
          const toast = document.createElement("ra-toast");
          const record = item.toast as { id?: string; title?: string; description?: string };
          if (record.id) toast.setAttribute("toast", record.id);
          const title = document.createElement("ra-toast-title");
          title.textContent = record.title ?? "";
          const description = document.createElement("ra-toast-description");
          description.textContent = record.description ?? "";
          const close = document.createElement("ra-toast-close");
          const button = document.createElement("button");
          button.type = "button";
          button.textContent = "Dismiss";
          close.append(button);
          toast.append(title, description, close);
          el.append(toast);
        }
      };
      draw();
      return live.subscribe(draw);
    },
  },
  toast: {
    tag: "ra-toast",
    slot: "root",
    display: "block",
    context: (el: HTMLElement) => ({ id: el.getAttribute("toast") || undefined }),
  },
  title: "ra-toast-title",
  description: "ra-toast-description",
  close: { tag: "ra-toast-close", target: wrappedButton, display: "contents" },
});

createParts(command, {
  root: {
    tag: "ra-command",
    display: "block",
    defaults: { autoHighlight: true, loop: true },
    state: {
      value: {
        get: (api: { getValue: () => string | null }) => api.getValue(),
        set: (api: { setValue: (value: string | null) => void }, value: string | null) => api.setValue(value),
      },
      query: {
        get: (api: { getQuery: () => string }) => api.getQuery(),
        set: (api: { setQuery: (query: string) => void }, query: string) => api.setQuery(query ?? ""),
      },
    },
    api: ["getValue", "setValue", "getQuery", "setQuery", "focus"],
  },
  input: { tag: "ra-command-input", display: "contents", target: wrappedChild("input") },
  list: { tag: "ra-command-list", display: "block" },
  item: { tag: "ra-command-item", display: "block" },
  empty: { tag: "ra-command-empty", display: "block" },
});

