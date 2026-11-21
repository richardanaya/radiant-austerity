import { partState } from "@ui-sdk/core/renderer";

type Segment = { key: string; type?: string; text?: string; editable?: boolean };

type SegmentInstance = {
  part: (slot: string, props?: Record<string, unknown>) => unknown;
  subscribe: (listener: () => void) => () => void;
};

const hints: Record<string, string> = {
  month: "MM",
  day: "DD",
  year: "YYYY",
  hour: "HH",
  minute: "MM",
  second: "SS",
  dayPeriod: "AM",
};

const watchers = new WeakMap<HTMLElement, MutationObserver[]>();

function pinPlaceholder(root: HTMLElement, input: HTMLInputElement, type: string | undefined) {
  const hint = type ? hints[type] : undefined;
  if (!hint) return;
  const apply = () => {
    if (input.placeholder !== hint) input.placeholder = hint;
  };
  apply();
  const observer = new MutationObserver(apply);
  observer.observe(input, { attributes: true, attributeFilter: ["placeholder"] });
  const list = watchers.get(root) ?? [];
  list.push(observer);
  watchers.set(root, list);
}

export function paintSegments(root: HTMLElement, instance: SegmentInstance, tag: string) {
  let signature = "";
  const draw = () => {
    const state = partState(instance.part("root", {}) as never) as { segments?: Segment[] };
    const segments = state.segments ?? [];
    const next = segments
      .map(segment => (segment.editable ? segment.key : `${segment.key}:${segment.text ?? ""}`))
      .join("|");
    if (next === signature) return;
    signature = next;
    for (const observer of watchers.get(root) ?? []) observer.disconnect();
    watchers.set(root, []);
    const template = root.querySelector(":scope > template");
    for (const child of [...root.querySelectorAll(`:scope > ${tag}`)]) child.remove();
    for (const segment of segments) {
      const node =
        template instanceof HTMLTemplateElement
          ? (template.content.firstElementChild?.cloneNode(true) as HTMLElement | null)
          : null;
      const part = node?.localName === tag ? node : document.createElement(tag);
      part.setAttribute("segment", segment.key);
      if (!segment.editable) {
        part.textContent = segment.text ?? "";
        root.append(part);
        continue;
      }
      let input = part.querySelector("input");
      if (!(input instanceof HTMLInputElement)) {
        input = document.createElement("input");
        input.inputMode = "numeric";
        input.setAttribute("aria-label", segment.key);
        part.append(input);
      }
      root.append(part);
      pinPlaceholder(root, input, segment.type);
    }
  };
  draw();
  return instance.subscribe(draw);
}
