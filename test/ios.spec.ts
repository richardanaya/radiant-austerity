import { cpSync, existsSync, mkdirSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

function publishShot(name: string) {
  if (!existsSync("/opt/cursor")) return;
  mkdirSync("/opt/cursor/artifacts", { recursive: true });
  cpSync(`test-results/${name}`, `/opt/cursor/artifacts/${name}`);
}

async function shot(page: Page, name: string) {
  mkdirSync("test-results", { recursive: true });
  await page.screenshot({ path: `test-results/${name}` });
  publishShot(name);
}

async function hiddenBox(page: Page, selector: string) {
  return page.locator(selector).first().evaluate(el => {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return {
      width: rect.width,
      height: rect.height,
      overflow: style.overflow,
      clip: style.clip,
      clipPath: style.clipPath,
    };
  });
}

function expectClipped(box: { width: number; height: number; overflow: string; clip: string; clipPath: string }) {
  expect(box.width).toBeLessThanOrEqual(2);
  expect(box.height).toBeLessThanOrEqual(2);
  expect(box.overflow === "hidden" || box.clip !== "auto" || box.clipPath !== "none").toBe(true);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    (globalThis as { __UI_SDK_STRICT__?: boolean }).__UI_SDK_STRICT__ = true;
  });
});

test("iPhone WebKit keeps icon labels clipped and the plate readable", async ({ page }) => {
  await page.goto("/gallery.html");
  await expect(page.locator("ra-sheet")).toBeVisible();

  const scroll = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scroll.scrollWidth).toBeLessThanOrEqual(scroll.clientWidth);

  const navTops = await page.locator(".nav a").evaluateAll(els => els.map(el => el.getBoundingClientRect().top));
  expect(navTops.length).toBe(3);
  expect(Math.max(...navTops) - Math.min(...navTops)).toBeLessThan(8);

  const margin = page.locator("[data-slot='ra-sheet-margin'][data-side='start']");
  await expect(margin).toContainText("Gallery");
  const marginStyle = await margin.evaluate(el => {
    const style = getComputedStyle(el);
    return { transform: style.transform, writingMode: style.writingMode };
  });
  expect(marginStyle.transform).toBe("none");
  expect(marginStyle.writingMode).toBe("horizontal-tb");

  await page.locator(".nav").scrollIntoViewIfNeeded();
  await shot(page, "iphone-after-header.png");
  await page.locator("[data-slot='ra-sheet-margin'][data-side='start']").scrollIntoViewIfNeeded();
  await shot(page, "iphone-after-strip.png");

  for (const name of ["Previous month", "Next month"]) {
    const button = page.locator("ra-calendar").getByRole("button", { name, exact: true });
    await expect(button).toHaveAccessibleName(name);
    expectClipped(await hiddenBox(page, `ra-calendar [data-slot='calendar-${name === "Previous month" ? "previous" : "next"}'] [data-slot='visually-hidden']`));
  }

  const weekdays = page.locator("ra-calendar ra-calendar-weekdays [data-slot='calendar-weekday']");
  await expect(weekdays).toHaveCount(7);
  const weekdayBoxes = await weekdays.evaluateAll(els =>
    els.map(el => {
      const rect = el.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
    }),
  );
  const columns = await page.locator("ra-calendar ra-calendar-weekdays").evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length);
  expect(columns).toBe(7);
  const rowWidth = await page.locator("ra-calendar ra-calendar-weekdays").evaluate(el => el.getBoundingClientRect().width);
  expect(rowWidth).toBeGreaterThan(240);
  for (let i = 0; i < weekdayBoxes.length; i += 1) {
    for (let j = i + 1; j < weekdayBoxes.length; j += 1) {
      const a = weekdayBoxes[i];
      const b = weekdayBoxes[j];
      const overlap = a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
      expect(overlap).toBe(false);
    }
  }
  const days = page.locator("ra-calendar ra-calendar-week").first().locator("[data-slot='calendar-day']");
  await expect(days).toHaveCount(7);
  const dayBoxes = await days.evaluateAll(els => els.map(el => el.getBoundingClientRect().left));
  const unique = new Set(dayBoxes.map(left => Math.round(left)));
  expect(unique.size).toBe(7);

  await page.locator("ra-calendar").scrollIntoViewIfNeeded();
  await shot(page, "iphone-after-dates.png");

  const month = page.locator("ra-date-input input").first();
  const hour = page.locator("ra-time-input input").first();
  await expect(month).toHaveAttribute("placeholder", "MM");
  await expect(hour).toHaveAttribute("placeholder", "HH");
  expect((await month.boundingBox())?.width ?? 0).toBeGreaterThan(12);
  expect((await hour.boundingBox())?.width ?? 0).toBeGreaterThan(12);
  const timeBox = await page.locator("ra-time-input").boundingBox();
  const footer = await page.locator("[data-slot='ra-sheet-margin'][data-side='end']").boundingBox();
  expect(timeBox && footer).toBeTruthy();
  expect(timeBox!.y + timeBox!.height).toBeLessThanOrEqual(footer!.y + 1);

  const radio = page.getByRole("radio", { name: /1/ }).first();
  await expect(radio).toBeVisible();
  expectClipped(await hiddenBox(page, "ra-rating [data-slot='visually-hidden']"));

  for (const glyph of ["−", "+"]) {
    const button = page.locator("ra-number-input").getByRole("button", { name: glyph });
    await expect(button).toHaveAccessibleName(glyph);
  }
  expectClipped(await hiddenBox(page, "[data-slot='number-input-decrement'] [data-slot='visually-hidden']"));
  expectClipped(await hiddenBox(page, "[data-slot='number-input-increment'] [data-slot='visually-hidden']"));

  const input = page.locator("ra-password-input input");
  const toggle = page.locator("ra-password-input").getByRole("button", { name: "Show" });
  await expect(toggle).toHaveAccessibleName("Show");
  const inputBox = await input.boundingBox();
  const toggleBox = await toggle.boundingBox();
  expect(inputBox && toggleBox).toBeTruthy();
  const inputMid = inputBox!.y + inputBox!.height / 2;
  const toggleMid = toggleBox!.y + toggleBox!.height / 2;
  expect(Math.abs(inputMid - toggleMid)).toBeLessThan(10);
  expect(toggleBox!.x).toBeGreaterThan(inputBox!.x + inputBox!.width - 4);
  expect(inputBox!.height).toBeLessThan(72);

  const checkbox = await page.locator("ra-checkbox").first().boundingBox();
  const radioItem = await page.locator("ra-radio").first().boundingBox();
  expect(checkbox && radioItem).toBeTruthy();
  expect(Math.abs(checkbox!.x - radioItem!.x)).toBeLessThan(12);

  const switchLook = await page.locator("ra-switch").evaluate(el => {
    const style = getComputedStyle(el);
    const thumb = el.querySelector("ra-switch-thumb");
    const thumbStyle = thumb ? getComputedStyle(thumb) : null;
    return {
      radius: parseFloat(style.borderRadius),
      height: parseFloat(style.height),
      thumbRadius: thumbStyle ? parseFloat(thumbStyle.borderRadius) : 0,
    };
  });
  expect(switchLook.radius).toBe(0);
  expect(switchLook.thumbRadius).toBe(0);
  expect(switchLook.height).toBeGreaterThan(20);

  await page.locator("#forms").scrollIntoViewIfNeeded();
  await shot(page, "iphone-after-forms.png");
  await page.locator("ra-rating").scrollIntoViewIfNeeded();
  await shot(page, "iphone-after-rating.png");
  await page.locator("ra-number-input").scrollIntoViewIfNeeded();
  await shot(page, "iphone-after-number.png");
  await page.locator("ra-password-input").scrollIntoViewIfNeeded();
  await shot(page, "iphone-after-password.png");
  await page.locator("ra-radio-group").scrollIntoViewIfNeeded();
  await shot(page, "iphone-after-radios.png");

  await page.locator("#post-note").click();
  const dismiss = page.getByRole("button", { name: "Dismiss" });
  await expect(dismiss).toBeVisible();
  await expect(dismiss).toHaveAccessibleName("Dismiss");
  expectClipped(await hiddenBox(page, "[data-slot='toast-close'] [data-slot='visually-hidden']"));
  await shot(page, "iphone-after-toast.png");
});

test("iPhone menu, checkbox, toast, and stepper keep their boxes", async ({ page }) => {
  await page.goto("/gallery.html");

  const trigger = page.getByRole("button", { name: "Parts" });
  await trigger.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 140));
  await trigger.click();
  await expect.poll(async () => {
    return page.evaluate(() => {
      const content = document.querySelector("[data-slot='navigation-menu-content']");
      const button = document.querySelector("[data-slot='navigation-menu-trigger']");
      if (!(content instanceof HTMLElement) || !(button instanceof HTMLElement)) return -1;
      return content.getBoundingClientRect().top - button.getBoundingClientRect().bottom;
    });
  }).toBeGreaterThanOrEqual(0);
  await shot(page, "iphone-after-menu.png");
  await page.keyboard.press("Escape");

  const select = page.locator("ra-select button");
  await select.scrollIntoViewIfNeeded();
  await select.click();
  await expect.poll(async () => {
    return page.evaluate(() => {
      const content = document.querySelector("ra-select-content");
      const button = document.querySelector("ra-select button");
      if (!(content instanceof HTMLElement) || !(button instanceof HTMLElement)) return -1;
      if (content.hidden) return -1;
      return content.getBoundingClientRect().top - button.getBoundingClientRect().bottom;
    });
  }).toBeGreaterThanOrEqual(0);
  await page.keyboard.press("Escape");

  await page.locator("label", { hasText: "Seal" }).click();
  const glyph = await page.locator("ra-checkbox[value='seal']").evaluate(el => {
    const indicator = el.querySelector("[data-slot='checkbox-indicator']");
    if (!(indicator instanceof HTMLElement)) return null;
    const box = el.getBoundingClientRect();
    const mark = indicator.getBoundingClientRect();
    const before = getComputedStyle(indicator, "::before");
    return {
      dx: Math.abs(mark.x + mark.width / 2 - (box.x + box.width / 2)),
      dy: Math.abs(mark.y + mark.height / 2 - (box.y + box.height / 2)),
      beforeWidth: parseFloat(before.width),
      background: getComputedStyle(indicator).backgroundColor,
    };
  });
  expect(glyph).toBeTruthy();
  expect(glyph!.dx).toBeLessThan(4);
  expect(glyph!.dy).toBeLessThan(4);
  expect(glyph!.beforeWidth).toBeGreaterThan(0);
  expect(["rgba(0, 0, 0, 0)", "transparent"]).toContain(glyph!.background);
  await page.locator("ra-checkbox[value='seal']").scrollIntoViewIfNeeded();
  await shot(page, "iphone-after-checkbox.png");
  const indeterminate = await page.locator("ra-checkbox[value='seal']").evaluate(el => {
    const indicator = el.querySelector("[data-slot='checkbox-indicator']");
    if (!(indicator instanceof HTMLElement)) return null;
    indicator.setAttribute("data-indeterminate", "");
    const box = el.getBoundingClientRect();
    const mark = indicator.getBoundingClientRect();
    const before = getComputedStyle(indicator, "::before");
    return {
      dx: Math.abs(mark.x + mark.width / 2 - (box.x + box.width / 2)),
      dy: Math.abs(mark.y + mark.height / 2 - (box.y + box.height / 2)),
      icon: before.getPropertyValue("--ui-icon"),
    };
  });
  expect(indeterminate).toBeTruthy();
  expect(indeterminate!.dx).toBeLessThan(4);
  expect(indeterminate!.dy).toBeLessThan(4);
  expect(indeterminate!.icon).toContain("M5 12h14");
  await page.locator("ra-checkbox[value='seal'] [data-slot='checkbox-indicator']").evaluate(el => {
    el.removeAttribute("data-indeterminate");
  });

  await page.locator("ra-number-input").scrollIntoViewIfNeeded();
  const borderTop = await page.locator("ra-number-input input").evaluate(el => parseFloat(getComputedStyle(el).borderTopWidth));
  const borderBottom = await page.locator("ra-number-input input").evaluate(el => parseFloat(getComputedStyle(el).borderBottomWidth));
  expect(borderTop).toBeGreaterThan(0);
  expect(borderBottom).toBeGreaterThan(0);
  await shot(page, "iphone-after-stepper.png");

  await page.locator("#post-note").click();
  const toast = page.locator("ra-toast");
  await expect(toast).toBeVisible();
  const inset = await toast.evaluate(el => {
    const rect = el.getBoundingClientRect();
    return {
      x: rect.x,
      right: window.innerWidth - rect.right,
      bottom: window.innerHeight - rect.bottom,
      pad: parseFloat(getComputedStyle(el).paddingLeft),
      border: parseFloat(getComputedStyle(el).borderLeftWidth),
    };
  });
  expect(inset.x).toBeGreaterThanOrEqual(8);
  expect(inset.right).toBeGreaterThanOrEqual(8);
  expect(inset.bottom).toBeGreaterThanOrEqual(8);
  expect(inset.pad).toBeGreaterThan(0);
  expect(inset.border).toBeGreaterThan(0);
  await shot(page, "iphone-after-toast.png");
});
