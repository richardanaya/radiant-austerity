import { cpSync, existsSync, mkdirSync } from "node:fs";
import { expect, test } from "@playwright/test";

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

test("gallery widgets answer the keyboard", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/gallery.html");

  const star = page.getByRole("checkbox", { name: "Mark" });
  await star.focus();
  await star.press(" ");
  await expect(star).toHaveAttribute("aria-checked", "true");

  const bold = page.getByRole("radio", { name: "Bold weight" });
  await page.getByRole("radio", { name: "Regular" }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(bold).toBeChecked();

  const published = page.getByRole("switch", { name: "Published" });
  await published.focus();
  await published.press(" ");
  await expect(published).toHaveAttribute("aria-checked", "true");

  await page.getByRole("button", { name: "Open popover" }).click();
  await expect(page.getByRole("dialog", { name: "Callout" })).toBeVisible();
  await page.screenshot({ path: "test-results/overlays.png", fullPage: false });
  publishShot("overlays.png");
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Open menu" }).click();
  const fileItem = page.getByRole("menuitem", { name: "File the plate" });
  await expect(fileItem).toBeVisible();
  await fileItem.press("ArrowDown");
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Ink" }).click();
  await expect(page.getByText("Ink field, cream type.")).toBeVisible();

  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByRole("button", { name: "2" })).toHaveAttribute("aria-current", "page");

  const day = page.locator("ra-calendar ra-calendar-day").first();
  await expect(day).toBeVisible();
  await day.click();

  await page.getByRole("button", { name: "Post a note" }).click();
  const note = page.locator("ra-toast-description");
  await expect(note).toBeVisible();
  await expect(note).toHaveText("The plate note is on the sheet.");

  expect(errors).toEqual([]);
  await page.screenshot({ path: "test-results/gallery.png", fullPage: true });
  publishShot("gallery.png");
});

test("press desk is a screen of kit parts", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/app.html");
  await expect(page.getByRole("heading", { name: "Press desk" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Operator" })).toBeVisible();
  const night = page.getByRole("switch", { name: "Night shift" });
  await night.focus();
  await night.press(" ");
  await expect(night).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "More copies" }).click();
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(page.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
  expect(errors).toEqual([]);
  await page.screenshot({ path: "test-results/app.png", fullPage: true });
  publishShot("app.png");
});
