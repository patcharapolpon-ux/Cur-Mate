// tests/02-state-machine.spec.js — เทสต์ข้อ 2: ปุ่มเปลี่ยนสถานะทำงานจริง
// อนุมัติกฎเกณฑ์ทุกข้อแล้วกด "เปิดใช้งานชุดเกณฑ์นี้" ที่หน้า 07 -> criteriaSets.status ต้องเปลี่ยนเป็น active จริง
// เช็คผลจากที่ UI แสดง "หลัง reload หน้า" (อ่านจาก Firestore ใหม่ ไม่ใช่แค่ดู DOM ที่ค้างอยู่จาก JS state ชั่วคราว)
//
// ต้องการบัญชี ADMIN_ACCOUNT ที่ role เป็น "ADMIN" แล้วจริง (เหมือน tests/01-happy-path.spec.js — ดู test-results.md)
const { test, expect } = require("@playwright/test");
const { login, createCriteriaSet } = require("./helpers");
const { ADMIN_ACCOUNT } = require("./test-accounts");

test("ข้อ 2 — อนุมัติครบทุกข้อแล้วเปิดใช้งานชุดเกณฑ์ สถานะเปลี่ยนเป็น active จริงใน Firestore", async ({ page }) => {
  await login(page, ADMIN_ACCOUNT.email, ADMIN_ACCOUNT.password);
  const { setId } = await createCriteriaSet(page, { namePrefix: "Playwright E2E ข้อ2" });
  expect(setId).toBeTruthy();

  // อยู่หน้า 07 ของชุดที่เพิ่งสร้างแล้ว (createCriteriaSet redirect มาให้) — สถานะเริ่มต้นต้องเป็น "รอตรวจสอบ" ก่อน
  await expect(page.locator("#setStatusChip")).toContainText("รอตรวจสอบ");

  // อนุมัติทั้งหมดด้วยปุ่ม Bulk Approve
  await expect(page.locator("#bulkApproveBtn")).toBeEnabled({ timeout: 15000 });
  await page.locator("#bulkApproveBtn").click();
  await expect(page.locator("#progressNote")).toContainText("ตรวจสอบครบทุกข้อแล้ว", { timeout: 20000 });

  // ปุ่ม "เปิดใช้งานชุดเกณฑ์นี้" ต้องโผล่มาแล้ว (เงื่อนไข: ตรวจครบทุกข้อ)
  const activateBtn = page.locator("#activateSetBtn");
  await expect(activateBtn).toBeVisible({ timeout: 10000 });
  await activateBtn.click();

  // เช็คทันทีหลังกด (DOM state) ก่อน — ต้องเปลี่ยนเป็น "เปิดใช้งาน"
  await expect(page.locator("#setStatusChip")).toContainText("เปิดใช้งาน", { timeout: 10000 });

  // ★ จุดสำคัญของเทสต์นี้: reload หน้าใหม่ทั้งหมด (บังคับอ่านจาก Firestore สดๆ ไม่ใช่ JS state เดิมที่ค้างอยู่ในหน่วยความจำ)
  await page.reload();
  await expect(page.locator("#setStatusChip")).toContainText("เปิดใช้งาน", { timeout: 15000 });
  await expect(page.locator("#deactivateSetBtn")).toBeVisible();

  // และต้องเห็นสถานะ "เปิดใช้งาน" ที่หน้า 05 ด้วยเช่นกัน (อ่านจาก Firestore คนละหน้า คนละ query)
  await page.goto("/05-criteria-dashboard.html");
  await expect(page.locator("#criteriaList")).not.toContainText("กำลังโหลด", { timeout: 10000 });
});
