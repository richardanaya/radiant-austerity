import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "test",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:4173",
  },
  projects: [
    {
      name: "chromium",
      testIgnore: "**/ios.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 900 },
      },
    },
    {
      name: "webkit-iphone",
      testMatch: "**/ios.spec.ts",
      use: {
        ...devices["iPhone 13"],
        browserName: "webkit",
      },
    },
  ],
  webServer: [
    {
      command: "npm run dev",
      url: "http://127.0.0.1:4173",
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: "node scripts/serve-site.mjs",
      url: "http://127.0.0.1:4174/cdn-test.html",
      reuseExistingServer: false,
      timeout: 30_000,
    },
  ],
});
