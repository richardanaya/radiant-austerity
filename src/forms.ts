import { autocomplete } from "@ui-sdk/core/autocomplete";
import { checkbox, checkboxGroup, type CheckboxGroupApi } from "@ui-sdk/core/checkbox";
import { combobox } from "@ui-sdk/core/combobox";
import { fileInput } from "@ui-sdk/core/file-input";
import { textarea } from "@ui-sdk/core/input";
import { listbox } from "@ui-sdk/core/listbox";
import { numberInput } from "@ui-sdk/core/number-input";
import { otpInput } from "@ui-sdk/core/otp-input";
import { passwordInput } from "@ui-sdk/core/password-input";
import { radioGroup } from "@ui-sdk/core/radio";
import { rating } from "@ui-sdk/core/rating";
import { segmentedControl } from "@ui-sdk/core/segmented-control";
import { select } from "@ui-sdk/core/select";
import { slider } from "@ui-sdk/core/slider";
import { switchPrimitive } from "@ui-sdk/core/switch";
import { createParts, wrappedButton, wrappedChild } from "@ui-sdk/web";
import { followAnchor } from "./anchor.js";
import { popupApi, popupKinds, popupState, rememberGroup } from "./popup-state.js";

const checkedApi = ["getChecked", "setChecked", "toggle", "focus"] as const;
const textApi = ["getValue", "setValue", "clear", "focus"] as const;

const textState = {
  value: {
    get: (api: any) => api.getValue(),
    set: (api: any, value: unknown) => api.setValue(value ?? ""),
  },
};

const liveValue = {
  value: {
    get: (api: any) => api.getValue(),
    set: (api: any, value: unknown) => api.setValue(value),
  },
};

const checkboxGroups = new WeakMap<Element, CheckboxGroupApi>();

createParts(checkboxGroup, {
  root: {
    tag: "ra-checkbox-group",
    self: "group",
    display: "block",
    formAssociated: true,
    state: {
      value: {
        get: (api: { getValue: () => string[] }) => api.getValue(),
        set: (api: { setValue: (value: string[]) => void }, value: string[]) => api.setValue(value ?? []),
      },
    },
    api: ["getValue", "setValue", "focus"],
    render: (el, instance) => {
      const api = (instance as { api?: CheckboxGroupApi }).api;
      if (api) checkboxGroups.set(el, api);
    },
  },
});

createParts(checkbox, {
  root: {
    tag: "ra-checkbox",
    formAssociated: true,
    kinds: { group: null },
    options: (el: HTMLElement) => ({
      group: () => {
        const owner = el.parentElement?.closest("ra-checkbox-group");
        return owner ? checkboxGroups.get(owner) : undefined;
      },
    }),
    state: {
      checked: {
        get: (api: any) => api.getChecked(),
        set: (api: any, checked: boolean) => api.setChecked(checked),
      },
    },
    api: [...checkedApi],
  },
  indicator: { tag: "ra-checkbox-indicator", display: "block" },
});

createParts(radioGroup, {
  root: {
    tag: "ra-radio-group",
    self: "group",
    display: "block",
    formAssociated: true,
    defaults: { loop: true },
    state: textState,
    api: ["getValue", "setValue", "focus"],
    render: (el, instance) => rememberGroup(el, instance as { api?: unknown }),
  },
  radio: { tag: "ra-radio", slot: "root", formAssociated: true },
  indicator: { tag: "ra-radio-indicator", display: "block" },
});

createParts(switchPrimitive, {
  root: {
    tag: "ra-switch",
    formAssociated: true,
    state: {
      checked: {
        get: (api: any) => api.getChecked(),
        set: (api: any, checked: boolean) => api.setChecked(!!checked),
      },
    },
    api: [...checkedApi],
  },
  thumb: { tag: "ra-switch-thumb", display: "block" },
});

createParts(slider, {
  root: {
    tag: "ra-slider",
    display: "block",
    formAssociated: true,
    kinds: { thumbInputId: null },
    state: {
      value: {
        get: (api: any) => api.getValue(),
        set: (api: any, value: number[]) => api.setValue(value),
      },
    },
    api: ["getValue", "setValue", "focus"],
  },
  control: { tag: "ra-slider-control", display: "block" },
  track: { tag: "ra-slider-track", display: "block" },
  indicator: { tag: "ra-slider-indicator", display: "block" },
  thumb: {
    tag: "ra-slider-thumb",
    display: "block",
    context: () => ({ index: 0, id: "0" }),
    render(el: HTMLElement) {
      if (el.querySelector("input")) return;
      const wrap = document.createElement("ra-slider-thumb-input");
      const input = document.createElement("input");
      input.setAttribute("aria-label", "Value");
      wrap.append(input);
      el.append(wrap);
    },
  },
  "thumb-input": {
    tag: "ra-slider-thumb-input",
    display: "contents",
    context: () => ({ index: 0, id: "0" }),
    target: (el: HTMLElement) => el.querySelector("input"),
  },
  value: { tag: "ra-slider-value", display: "block" },
});

createParts(select, {
  root: {
    tag: "ra-select",
    display: "block",
    defaults: { loop: true, dismissible: true },
    kinds: popupKinds,
    options: () => ({ container: undefined }),
    state: { ...textState, ...popupState },
    api: [...popupApi, "getValue", "setValue", "clear"],
    render: (el: HTMLElement) => followAnchor(el, "ra-select-content", "ra-select-trigger"),
  },
  label: { tag: "ra-select-label", display: "block" },
  trigger: { tag: "ra-select-trigger", display: "contents", target: wrappedButton },
  value: { tag: "ra-select-value", display: "block" },
  content: { tag: "ra-select-content", kinds: popupKinds },
  item: { tag: "ra-select-item", display: "block" },
});

createParts(combobox, {
  root: {
    tag: "ra-combobox",
    display: "block",
    defaults: { loop: true, dismissible: true },
    kinds: popupKinds,
    options: () => ({ container: undefined }),
    state: { ...textState, ...popupState },
    api: [...popupApi, "getValue", "setValue", "clear"],
    render: (el: HTMLElement) => followAnchor(el, "ra-combobox-content", "ra-combobox-input"),
  },
  input: { tag: "ra-combobox-input", display: "contents", target: wrappedChild("input") },
  trigger: { tag: "ra-combobox-trigger", display: "contents", target: wrappedChild("button") },
  content: { tag: "ra-combobox-content", kinds: popupKinds },
  item: { tag: "ra-combobox-item", display: "block" },
});

createParts(autocomplete, {
  root: {
    tag: "ra-autocomplete",
    display: "block",
    defaults: { loop: true, dismissible: true },
    kinds: popupKinds,
    options: () => ({ container: undefined }),
    state: { ...textState, ...popupState },
    api: [...popupApi, "getValue", "setValue", "clear"],
    render: (el: HTMLElement) => followAnchor(el, "ra-autocomplete-content", "ra-autocomplete-input"),
  },
  input: { tag: "ra-autocomplete-input", display: "contents", target: wrappedChild("input") },
  content: { tag: "ra-autocomplete-content", kinds: popupKinds },
  item: { tag: "ra-autocomplete-item", display: "block" },
});

createParts(listbox, {
  root: {
    tag: "ra-listbox",
    display: "block",
    formAssociated: true,
    defaults: { loop: true },
    state: textState,
    api: ["getValue", "setValue", "focus"],
  },
  item: { tag: "ra-listbox-item", display: "block" },
});

createParts(segmentedControl, {
  root: {
    tag: "ra-segmented-control",
    display: "block",
    formAssociated: true,
    defaults: { loop: true },
    state: textState,
    api: ["getValue", "setValue", "focus"],
  },
  item: { tag: "ra-segmented-control-item", formAssociated: true },
});

createParts(numberInput, {
  root: {
    tag: "ra-number-input",
    display: "block",
    formAssociated: true,
    kinds: { controlId: null },
    state: liveValue,
    api: ["getValue", "setValue", "increment", "decrement", "focus"],
  },
  group: { tag: "ra-number-input-group", display: "block" },
  control: {
    tag: "ra-number-input-control",
    display: "contents",
    target: (el: HTMLElement) => el.querySelector("input"),
  },
  increment: {
    tag: "ra-number-input-increment",
    display: "contents",
    target: (el: HTMLElement) => el.querySelector("button"),
  },
  decrement: {
    tag: "ra-number-input-decrement",
    display: "contents",
    target: (el: HTMLElement) => el.querySelector("button"),
  },
});

createParts(passwordInput, {
  root: {
    tag: "ra-password-input",
    display: "block",
    kinds: { controlId: null, autoComplete: null },
    children: { control: (el: HTMLElement) => el.querySelector("input") },
    state: {
      ...textState,
      visible: {
        get: (api: { isVisible: () => boolean }) => api.isVisible(),
        set: (api: { setVisible: (visible: boolean) => void }, visible: boolean) => api.setVisible(!!visible),
      },
    },
    api: ["getValue", "setValue", "clear", "isVisible", "setVisible", "toggleVisible", "focus"],
  },
  toggle: { tag: "ra-password-input-toggle", display: "contents", target: wrappedButton },
});

createParts(otpInput, {
  root: {
    tag: "ra-otp-input",
    display: "block",
    state: textState,
    api: [...textApi],
    render(el: HTMLElement) {
      if (el.querySelector("input")) return;
      const wrap = document.createElement("ra-otp-input-control");
      const input = document.createElement("input");
      input.setAttribute("aria-label", el.getAttribute("aria-label") || "One-time code");
      input.autocomplete = "one-time-code";
      wrap.append(input);
      el.prepend(wrap);
    },
  },
  control: {
    tag: "ra-otp-input-control",
    display: "contents",
    target: (el: HTMLElement) => el.querySelector("input"),
  },
  group: { tag: "ra-otp-input-group", display: "block" },
  slot: { tag: "ra-otp-input-slot", display: "block" },
});

createParts(fileInput, {
  root: {
    tag: "ra-file-input",
    display: "block",
    formAssociated: true,
    state: {
      value: {
        get: (api: any) => api.getValue(),
        set: (api: any, files: File[]) => api.setValue(files ?? []),
      },
    },
    api: ["getValue", "setValue", "clear", "open", "focus"],
    children: {
      input: (el: HTMLElement) => {
        const existing = el.querySelector(':scope > input[type="file"]');
        if (existing instanceof HTMLElement) return existing;
        const input = document.createElement("input");
        input.type = "file";
        el.append(input);
        return input;
      },
    },
    render(el: HTMLElement, instance) {
      const api = instance as unknown as {
        api: { getValue: () => readonly File[] };
        subscribe: (fn: () => void) => () => void;
      };
      const draw = () => {
        const list = el.querySelector("ra-file-input-list");
        if (!list) return;
        for (const child of [...list.children]) {
          if (child.tagName !== "TEMPLATE") child.remove();
        }
        for (const file of api.api.getValue() ?? []) {
          const item = document.createElement("ra-file-input-item");
          item.textContent = file.name;
          list.append(item);
        }
      };
      draw();
      return api.subscribe(draw);
    },
  },
  trigger: {
    tag: "ra-file-input-trigger",
    display: "contents",
    target: (el: HTMLElement) => el.querySelector("button"),
  },
  dropzone: { tag: "ra-file-input-dropzone", display: "block" },
  list: { tag: "ra-file-input-list", display: "block" },
  item: { tag: "ra-file-input-item", display: "block" },
  "item-remove": {
    tag: "ra-file-input-item-remove",
    display: "contents",
    target: (el: HTMLElement) => el.querySelector("button"),
  },
});

createParts(textarea, {
  root: {
    tag: "ra-textarea",
    display: "contents",
    children: { root: (el: HTMLElement) => el.querySelector(":scope > textarea") },
    silent: ["onSubmit"],
    state: textState,
    api: [...textApi],
  },
});

createParts(rating, {
  root: {
    tag: "ra-rating",
    display: "block",
    formAssociated: true,
    state: liveValue,
    api: ["getValue", "setValue", "focus"],
  },
  item: { tag: "ra-rating-item", display: "block" },
  radio: { tag: "ra-rating-radio", display: "block" },
});
