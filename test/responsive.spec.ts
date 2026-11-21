import { cpSync, existsSync, mkdirSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";

function publishShot(name: string) {
  if (!existsSync("/opt/cursor")) return;
  mkdirSync("/opt/cursor/artifacts", { recursive: true });
  cpSync(`test-results/${name}`, `/opt/cursor/artifacts/${name}`);
}

const pages = [
  { path: "/", name: "home" },
  { path: "/gallery.html", name: "gallery" },
  { path: "/app.html", name: "app" },
];

const viewports = [
  { width: 360, height: 740 },
  { width: 390, height: 844 },
];

async function expectNoHorizontalScroll(page: Page) {
  const box = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(box.scrollWidth).toBeLessThanOrEqual(box.clientWidth);
}

async function expectInsideViewport(page: Page, locator: Locator) {
  await expect(locator).toBeVisible();
  const bounds = await locator.evaluate(el => {
    const rect = el.getBoundingClientRect();
    return { x: rect.left, y: rect.top, right: rect.right, bottom: rect.bottom };
  });
  const viewport = page.viewportSize();
  expect(viewport).toBeTruthy();
  expect(bounds.x).toBeGreaterThanOrEqual(-1);
  expect(bounds.y).toBeGreaterThanOrEqual(-1);
  expect(bounds.right).toBeLessThanOrEqual((viewport?.width ?? 0) + 1);
  expect(bounds.bottom).toBeLessThanOrEqual((viewport?.height ?? 0) + 1);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    (globalThis as { __UI_SDK_STRICT__?: boolean }).__UI_SDK_STRICT__ = true;
  });
});

for (const viewport of viewports) {
  for (const entry of pages) {
    test(`${entry.name} stays within ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(entry.path);
      await expect(page.locator("ra-sheet")).toBeVisible();
      await expectNoHorizontalScroll(page);
      if (viewport.width === 390) {
        const file = `mobile-${entry.name}-390.png`;
        await page.screenshot({ path: `test-results/${file}`, fullPage: true });
        publishShot(file);
      }
    });
  }
}

test("overlays stay inside a 360px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/gallery.html");
  await expectNoHorizontalScroll(page);

  const mark = page.getByRole("button", { name: "Mark the plate" });
  await expect(mark).toBeVisible();
  const markBox = await mark.boundingBox();
  expect(markBox?.height ?? 0).toBeGreaterThanOrEqual(44);

  await page.getByRole("button", { name: "Open popover" }).click();
  await expectInsideViewport(page, page.getByRole("dialog", { name: "Callout" }));
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Open menu" }).click();
  await expectInsideViewport(page, page.getByRole("menu"));
  await page.keyboard.press("Escape");

  await page.locator("ra-select button").click();
  await expectInsideViewport(page, page.locator("ra-select-content"));
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Open plate" }).click();
  const dialog = page.getByRole("dialog", { name: "Plate notes" });
  await expectInsideViewport(page, dialog);
  await page.screenshot({ path: "test-results/mobile-overlay-360.png", fullPage: false });
  publishShot("mobile-overlay-360.png");
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Post a note" }).click();
  await expectInsideViewport(page, page.locator("ra-toast"));
});

test("narrow sheet gives the plate its width back", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const ratio = await page.evaluate(() => {
    const sheet = document.querySelector("ra-sheet");
    const margin = document.querySelector("ra-sheet-margin");
    const header = sheet?.querySelector("header");
    const writing = margin instanceof HTMLElement ? getComputedStyle(margin).writingMode : "";
    const content = header instanceof HTMLElement ? header.getBoundingClientRect().width : 0;
    return { writing, content: content / document.documentElement.clientWidth };
  });
  expect(ratio.writing).toBe("horizontal-tb");
  expect(ratio.content).toBeGreaterThan(0.75);
});
