// playwright.config.js — เพิ่มสัปดาห์ที่ 9 (การบ้าน Module 2, agent tester)
// รันเทสต์ตรงกับเว็บที่ deploy จริง https://cur-mate.web.app/ (Firebase Hosting, project cur-mate)
// ไม่มี local static server / build step — ไฟล์นี้เป็น dev config สำหรับเทสต์เท่านั้น ไม่ใช่โค้ดแอป
const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false, // เทสต์บางตัวเขียนข้อมูลจริงลง Firestore เดียวกัน รันเรียงกันปลอดภัยกว่า
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "https://cur-mate.web.app/",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
