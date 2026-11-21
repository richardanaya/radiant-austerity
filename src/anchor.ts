// Popup placement for overlays the primitive leaves on the trigger.
// iOS Safari resolves CSS anchor(bottom) around the trigger's middle, and
// position:fixed top/left are not viewport coordinates when a transformed
// ancestor or the visual viewport is involved. Measure the box that top:0
// actually produces, then set top/left so the popup sits below the trigger
// (or above it when that side has more room) with a gap.
const margin = 8;
const gap = 6;

function shown(content: HTMLElement) {
  return !content.hidden && !content.hasAttribute("hidden") && content.getClientRects().length > 0;
}

function pin(content: HTMLElement, name: string, value: string) {
  content.style.setProperty(name, value, "important");
}

export function followAnchor(root: HTMLElement, contentTag: string, triggerTag: string) {
  const place = () => {
    const content = root.querySelector(contentTag);
    const triggerHost = root.querySelector(triggerTag);
    if (!(content instanceof HTMLElement) || !(triggerHost instanceof HTMLElement)) return;
    if (!shown(content)) return;
    const trigger = triggerHost.querySelector("button, a, input, textarea") ?? triggerHost;
    if (!(trigger instanceof HTMLElement)) return;

    const viewport = window.visualViewport;
    const viewportWidth = viewport?.width ?? document.documentElement.clientWidth;
    const viewportHeight = viewport?.height ?? window.innerHeight;
    const maxWidth = Math.max(0, viewportWidth - margin * 2);

    pin(content, "position", "fixed");
    pin(content, "position-anchor", "none");
    pin(content, "position-try-fallbacks", "none");
    pin(content, "translate", "none");
    pin(content, "transform", "none");
    pin(content, "right", "auto");
    pin(content, "bottom", "auto");
    pin(content, "z-index", "60");
    pin(content, "box-sizing", "border-box");
    pin(content, "max-width", `${maxWidth}px`);

    if (content.offsetHeight === 0 && content.dataset.clAnchorRetry !== "1") {
      content.dataset.clAnchorRetry = "1";
      requestAnimationFrame(place);
      return;
    }
    content.dataset.clAnchorRetry = "0";

    const styled = getComputedStyle(content);
    const measured = content.getBoundingClientRect();
    const styleTop = parseFloat(styled.top);
    const styleLeft = parseFloat(styled.left);
    const marginTop = parseFloat(styled.marginTop) || 0;
    const marginLeft = parseFloat(styled.marginLeft) || 0;
    const originTop = Number.isFinite(styleTop) ? measured.top - styleTop - marginTop : measured.top;
    const originLeft = Number.isFinite(styleLeft) ? measured.left - styleLeft - marginLeft : measured.left;
    const width = Math.min(measured.width || content.offsetWidth, maxWidth);
    const height = measured.height || content.offsetHeight;
    const box = trigger.getBoundingClientRect();
    const spaceBelow = viewportHeight - box.bottom - margin;
    const spaceAbove = box.top - margin;
    const placeAbove = height + gap > spaceBelow && spaceAbove > spaceBelow;
    let visualTop = placeAbove ? box.top - height - gap : box.bottom + gap;
    let visualLeft = box.left;
    if (visualLeft + width > viewportWidth - margin) visualLeft = viewportWidth - margin - width;
    if (visualLeft < margin) visualLeft = margin;
    if (placeAbove) {
      if (visualTop < margin) visualTop = margin;
    } else if (visualTop < box.bottom + gap) {
      visualTop = box.bottom + gap;
    }
    if (visualTop + height > viewportHeight - margin && placeAbove) {
      visualTop = Math.max(margin, box.top - height - gap);
    }

    const nextTop = `${Math.round(visualTop - originTop)}px`;
    const nextLeft = `${Math.round(visualLeft - originLeft)}px`;
    const nextMax = `${maxWidth}px`;
    const marginValue = content.style.getPropertyValue("margin");
    if (
      content.dataset.clAnchor === "1" &&
      content.style.getPropertyValue("top") === nextTop &&
      content.style.getPropertyValue("left") === nextLeft &&
      content.style.getPropertyValue("max-width") === nextMax &&
      (marginValue === "0" || marginValue === "0px")
    ) {
      return;
    }
    content.dataset.clAnchor = "1";
    pin(content, "margin", "0");
    pin(content, "top", nextTop);
    pin(content, "left", nextLeft);
  };

  const scheduled = () => requestAnimationFrame(place);
  const observer = new MutationObserver(scheduled);
  observer.observe(root, {
    subtree: true,
    attributes: true,
    attributeFilter: ["hidden", "data-open", "style", "popover"],
  });
  window.addEventListener("resize", scheduled);
  window.addEventListener("scroll", scheduled, true);
  viewportListen(scheduled);
  return () => {
    observer.disconnect();
    window.removeEventListener("resize", scheduled);
    window.removeEventListener("scroll", scheduled, true);
    viewportUnlisten(scheduled);
  };
}

function viewportListen(scheduled: () => void) {
  window.visualViewport?.addEventListener("resize", scheduled);
  window.visualViewport?.addEventListener("scroll", scheduled);
}

function viewportUnlisten(scheduled: () => void) {
  window.visualViewport?.removeEventListener("resize", scheduled);
  window.visualViewport?.removeEventListener("scroll", scheduled);
}
