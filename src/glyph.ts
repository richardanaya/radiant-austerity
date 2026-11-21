/** Orange reticle: 2×13 corner brackets. The kit mark. */
export function reticleSvg(): string {
  return `<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M2 13V2h11M35 2h11v11M46 35v11H35M13 46H2V35"/></svg>`;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
