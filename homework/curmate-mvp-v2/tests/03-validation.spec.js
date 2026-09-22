// tests/03-validation.spec.js — เทสต์ข้อ 3: Validation
// กรอกฟอร์มไม่ครบ (หน้า 06 ไม่แนบไฟล์ .md ที่บังคับ) แล้วกดบันทึก ต้องห้ามบันทึกสำเร็จ
// หน้า 06 เป็น ADMIN ล้วน (CURMATE_REQUIRE_ADMIN บล็อก role อื่นทันที) จึงต้องใช้บัญชี ADMIN_ACCOUNT ที่ role
// เป็น "ADMIN" แล้วจริง (เหมือนไฟล์ 01/02 — ดู test-results.md หัวข้อ "หมายเหตุสำคัญ")
const { test, expect } = require("@playwright/test");
const { login } = require("./helpers");
const { ADMIN_ACCOUNT } = require("./test-accounts");

test.describe("ข้อ 3 — Validation หน้า 06 (สร้างชุดเกณฑ์ใหม่)", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ADMIN_ACCOUNT.email, ADMIN_ACCOUNT.password);
    await page.goto("/06-create-criteria-set.html");
  });

  test("3a. กรอกชื่อชุดเกณฑ์แต่ไม่แนบไฟล์ .md -> ปุ่มบันทึกต้อง disabled เสมอ (บันทึกไม่ได้)", async ({ page }) => {
    await page.locator("#setName").fill("Playwright Validation Test — ไม่แนบไฟล์ .md");
    // ไม่แตะ #mdInput เลย
    await expect(page.locator("#extractBtn")).toBeDisabled();

    // ยิงคลิกตรงๆ ที่ปุ่ม (force ทะลุ disabled state ของ browser) ก็ต้องไม่มีอะไรเกิดขึ้น —
    // ยืนยันว่าไม่มี criteriaSets เอกสารใหม่ถูกสร้างขึ้นจริง (ไม่ redirect ไปหน้า 07)
    await page.locator("#extractBtn").click({ force: true });
    await page.waitForTimeout(1500);
    expect(page.url()).toContain("06-create-criteria-set.html");
  });

  test("3b. ไม่กรอกชื่อชุดเกณฑ์เลย (แม้จะแนบไฟล์ .md) -> ปุ่มบันทึกต้อง disabled", async ({ page }) => {
    const path = require("path");
    await page.locator("#mdInput").setInputFiles(path.join(__dirname, "fixtures", "sample-criteria.md"));
    // #setName ปล่อยว่างไว้
    await expect(page.locator("#extractBtn")).toBeDisabled();
  });

  test("3c. กรอกลิงก์เอกสารต้นฉบับผิดรูปแบบ (ไม่ใช่ http/https) -> แจ้ง error และบันทึกไม่ได้", async ({ page }) => {
    await page.locator("#setName").fill("Playwright Validation Test — ลิงก์ผิดรูปแบบ");
    await page.locator("#pdfLinkInput").fill("ไม่ใช่ลิงก์");
    await expect(page.locator("#pdfLinkError")).toContainText("ลิงก์ไม่ถูกต้อง");
    await expect(page.locator("#extractBtn")).toBeDisabled();
  });
});
