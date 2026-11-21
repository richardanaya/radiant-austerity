import { navigationMenu } from "@ui-sdk/core/navigation-menu";
import { pagination } from "@ui-sdk/core/pagination";
import { toolbar } from "@ui-sdk/core/toolbar";
import { createParts, wrappedButton, wrappedChild } from "@ui-sdk/web";
import { followAnchor } from "./anchor.js";
import { popupKinds } from "./popup-state.js";

createParts(pagination, {
  root: {
    tag: "ra-pagination",
    display: "block",
    state: {
      page: {
        get: (api: { getPage: () => number }) => api.getPage(),
        set: (api: { setPage: (page: number) => void }, page: number) => api.setPage(page),
      },
    },
    api: ["getPage", "getPageCount", "setPage", "next", "previous", "first", "last"],
  },
  list: { tag: "ra-pagination-list", display: "block" },
  item: { tag: "ra-pagination-item", display: "block" },
  link: { tag: "ra-pagination-link", display: "contents", target: wrappedButton },
  previous: { tag: "ra-pagination-previous", display: "contents", target: wrappedButton },
  next: { tag: "ra-pagination-next", display: "contents", target: wrappedButton },
});

createParts(navigationMenu, {
  root: {
    tag: "ra-navigation-menu",
    display: "block",
    kinds: popupKinds,
    options: () => ({ container: undefined }),
    render: (el: HTMLElement) => followAnchor(el, "ra-navigation-menu-content", "ra-navigation-menu-trigger"),
  },
  list: { tag: "ra-navigation-menu-list", display: "block" },
  item: { tag: "ra-navigation-menu-item", display: "block" },
  trigger: { tag: "ra-navigation-menu-trigger", display: "contents", target: wrappedButton },
  content: { tag: "ra-navigation-menu-content", kinds: popupKinds },
  link: { tag: "ra-navigation-menu-link", display: "contents", target: wrappedChild("a") },
});

createParts(toolbar, {
  root: {
    tag: "ra-toolbar",
    display: "block",
    defaults: { loop: true },
    api: ["focus"],
  },
  button: { tag: "ra-toolbar-button", display: "contents", target: wrappedButton },
  separator: { tag: "ra-toolbar-separator", display: "block" },
  input: { tag: "ra-toolbar-input", display: "contents", target: wrappedChild("input, textarea") },
});
