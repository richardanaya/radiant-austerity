import { cpSync, existsSync, mkdirSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { components } from "../src/catalog.ts";

function publishShot(name: string) {
  if (!existsSync("/opt/cursor")) return;
  mkdirSync("/opt/cursor/artifacts", { recursive: true });
  cpSync(`test-results/${name}`, `/opt/cursor/artifacts/${name}`);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    (globalThis as { __UI_SDK_STRICT__?: boolean }).__UI_SDK_STRICT__ = true;
  });
});

test("release sheet is a plate of the kit", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Radiant Austerity", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: /Radiant Austerity UI Kit 0.1.0/ })).toBeVisible();
  await expect(page.getByRole("img", { name: "Version 0.1.0" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Release specification" })).toContainText("0.1.0");
  await expect(page.getByRole("list", { name: /0\.1\.0/ })).toBeVisible();
  await expect(page.getByRole("img", { name: "Code 128 RADIANT-AUSTERITY-0.1.0" })).toBeVisible();
  await expect(page.locator("ra-barcode svg rect").first()).toBeVisible();
  await expect(page.locator("ra-qr svg")).toBeVisible();
  await expect(page.getByRole("img", { name: /RADIANT AUSTERITY UI KIT/ })).toBeVisible();
  const paper = await page.locator("ra-sheet").evaluate(el => getComputedStyle(el).backgroundColor);
  expect(paper).toBe("rgb(241, 240, 219)");
  expect(errors).toEqual([]);
  await page.screenshot({ path: "test-results/poster.png", fullPage: true });
  publishShot("poster.png");
});

test("release sheet fits a narrow screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Radiant Austerity", exact: true })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThan(8);
  await page.screenshot({ path: "test-results/poster-mobile.png", fullPage: true });
  publishShot("poster-mobile.png");
});

test("gallery controls are named and keyboard reachable", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/gallery.html");

  await page.getByRole("button", { name: "Mark the plate" }).click();
  await expect(page.locator("#mark-log")).toHaveText("Plate marked");

  const title = page.getByRole("textbox", { name: "Plate title" });
  await title.fill("RM-01");
  await expect(title).toHaveValue("RM-01");

  const bold = page.getByRole("button", { name: "Bold" });
  await bold.click();
  await expect(bold).toHaveAttribute("aria-pressed", "true");
  await bold.press("ArrowLeft");
  await expect(page.getByRole("button", { name: "Regular" })).toBeFocused();

  await page.getByRole("tab", { name: "Parts" }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Sheet, callout");

  await page.getByRole("button", { name: "Open plate" }).click();
  const dialog = page.getByRole("dialog", { name: "Plate notes" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: "Open plate" })).toBeFocused();

  await page.getByRole("button", { name: "Hint" }).focus();
  await expect(page.getByRole("tooltip")).toHaveText("Orange reticle");

  const defined = await page.evaluate(tags => tags.every(tag => customElements.get(tag) !== undefined), [
    ...components,
  ]);
  expect(defined).toBe(true);
  expect(errors).toEqual([]);
  await page.screenshot({ path: "test-results/gallery.png", fullPage: true });
  publishShot("gallery.png");
});
