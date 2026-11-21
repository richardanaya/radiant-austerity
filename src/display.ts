import { definePrimitive } from "@ui-sdk/core";

const quiet = () => ({});

export const card = definePrimitive({
  name: "ra-card",
  options: { label: "string" },
  state: (options: { label?: string }) => ({ label: options.label ?? "" }),
  sync: options => (options.label === undefined ? {} : { label: options.label }),
  api: quiet,
  slots: slot => ({
    root: slot({
      attrs: state => ({
        role: "region",
        "aria-label": state.label || undefined,
      }),
    }),
  }),
});

export const breadcrumb = definePrimitive({
  name: "ra-breadcrumb",
  options: { label: "string" },
  state: (options: { label?: string }) => ({ label: options.label ?? "Breadcrumb" }),
  sync: options => (options.label === undefined ? {} : { label: options.label }),
  api: quiet,
  slots: slot => ({
    root: slot({
      attrs: state => ({
        role: "navigation",
        "aria-label": state.label,
      }),
    }),
  }),
});

export const breadcrumbItem = definePrimitive({
  name: "ra-breadcrumb-item",
  state: quiet,
  api: quiet,
  slots: slot => ({
    root: slot({
      attrs: () => ({ role: "listitem" }),
    }),
  }),
});

export const alertBanner = definePrimitive({
  name: "ra-alert",
  state: quiet,
  api: quiet,
  slots: slot => ({
    root: slot({
      attrs: () => ({ role: "status" }),
    }),
  }),
});

export const spinner = definePrimitive({
  name: "ra-spinner",
  options: { label: "string" },
  state: (options: { label?: string }) => ({ label: options.label ?? "Loading" }),
  sync: options => (options.label === undefined ? {} : { label: options.label }),
  api: quiet,
  slots: slot => ({
    root: slot({
      attrs: state => ({
        role: "status",
        "aria-label": state.label,
      }),
    }),
  }),
});

export const skeleton = definePrimitive({
  name: "ra-skeleton",
  state: quiet,
  api: quiet,
  slots: slot => ({
    root: slot({
      attrs: () => ({ "aria-hidden": "true" }),
    }),
  }),
});
