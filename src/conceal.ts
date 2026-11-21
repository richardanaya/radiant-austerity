const iconSlots = [
  "calendar-previous",
  "calendar-next",
  "date-picker-trigger",
  "password-input-toggle",
  "toast-close",
  "number-input-increment",
  "number-input-decrement",
  "rating-radio",
];

const started = Symbol.for("radiant-austerity.conceal-labels");

function concealHost(host: HTMLElement) {
  if (host.querySelector(":scope > [data-slot='visually-hidden']")) return;
  const texts = [...host.childNodes].filter(
    (node): node is Text => node.nodeType === Node.TEXT_NODE && !!node.textContent?.trim(),
  );
  if (texts.length === 0) return;
  const label = document.createElement("span");
  label.setAttribute("data-slot", "visually-hidden");
  label.textContent = texts.map(node => node.textContent ?? "").join("");
  for (const node of texts) node.remove();
  host.append(label);
}

export function concealLabels(root: ParentNode = document) {
  const selector = iconSlots.map(slot => `[data-slot="${slot}"]`).join(",");
  for (const host of root.querySelectorAll<HTMLElement>(selector)) concealHost(host);
}

export function watchConcealedLabels(root: Document | HTMLElement = document) {
  const flag = root as Document & { [started]?: boolean };
  if (flag[started]) return () => {};
  flag[started] = true;
  const run = () => concealLabels(root);
  const observer = new MutationObserver(run);
  observer.observe(root instanceof Document ? root.documentElement : root, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  run();
  return () => observer.disconnect();
}
