// tests/01-happy-path.spec.js — เทสต์ข้อ 1: เส้นทางหลักของฟีเจอร์หลัก
// ADMIN login -> สร้างชุดเกณฑ์ใหม่ (หน้า 06) -> เห็นชุดเกณฑ์ปรากฏในหน้า 05
//
// ต้องการบัญชี ADMIN_ACCOUNT (tests/test-accounts.js) ที่ role เป็น "ADMIN" แล้วจริงใน Firestore
// (signup.html สร้างให้แค่ role "STAFF" เสมอ — ต้องเลื่อนบทบาทด้วยมือผ่าน Firebase Console ก่อนรันไฟล์นี้
// ดู tests/00-setup-accounts.spec.js และ test-results.md หัวข้อ "หมายเหตุสำคัญ")
const { test, expect } = require("@playwright/test");
const { login, createCriteriaSet } = require("./helpers");
const { ADMIN_ACCOUNT } = require("./test-accounts");

test("ข้อ 1 — ADMIN สร้างชุดเกณฑ์ใหม่แล้วเห็นปรากฏในหน้า 05", async ({ page }) => {
  await login(page, ADMIN_ACCOUNT.email, ADMIN_ACCOUNT.password);

  const { setId, setName } = await createCriteriaSet(page, { namePrefix: "Playwright E2E ข้อ1" });
  expect(setId, "ต้องได้ setId จริงหลังสกัดกฎเกณฑ์สำเร็จ").toBeTruthy();

  // หน้า 07 ต้องแสดงชื่อชุดเกณฑ์ที่เพิ่งสร้าง + มีกฎเกณฑ์อย่างน้อย 1 ข้อที่ AI สกัดมาจริง
  await expect(page.locator("#setName")).toContainText(setName);
  await expect(page.locator("#ruleList .rule-card").first()).toBeVisible({ timeout: 15000 });

  // กลับไปหน้า 05 (reload สดๆ ไม่ใช้ cache) แล้วต้องเห็นการ์ดชุดเกณฑ์ที่เพิ่งสร้าง ปรากฏจริงจาก Firestore
  await page.goto("/05-criteria-dashboard.html");
  await expect(page.locator("#criteriaList")).not.toContainText("กำลังโหลด", { timeout: 10000 });
  await expect(page.getByText(setName, { exact: false })).toBeVisible();
});
