export const popupKinds = { container: "string" as const };

export const popupState = {
  open: {
    get: (api: any) => api.isOpen(),
    set: (api: any, open: boolean) => api.setOpen(!!open),
  },
};

export const popupApi = ["isOpen", "setOpen", "open", "close", "toggle", "focus"] as const;

type GroupApi = { api?: unknown };

const groups = new WeakMap<Element, unknown>();

export function rememberGroup(el: HTMLElement, instance: GroupApi) {
  if (instance.api) groups.set(el, instance.api);
}

export function groupApi(el: HTMLElement, tag: string) {
  const owner = el.parentElement?.closest(tag);
  return owner ? groups.get(owner) : undefined;
}
