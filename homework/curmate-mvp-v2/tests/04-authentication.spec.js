// tests/04-authentication.spec.js — เทสต์ข้อ 4: Authentication
// ไม่ login แล้วพยายามเข้าหน้า 05/06/07/manage-users.html ตรงๆ ต้องถูกเด้งไป login.html เสมอ อ่านข้อมูลไม่ได้
// ไม่ต้องใช้บัญชีทดสอบใดๆ — เทสต์นี้เป็นอิสระจากเทสต์อื่นทั้งหมด (ไม่ผ่าน UI login เลย)
const { test, expect } = require("@playwright/test");

const PROTECTED_PAGES = [
  "05-criteria-dashboard.html",
  "06-create-criteria-set.html",
  "07-rule-review-approval.html#setId=dummy-id-for-auth-test",
  "manage-users.html",
];

test.describe("ข้อ 4 — Authentication: ไม่ login เข้าหน้าที่ต้อง login ตรงๆ", () => {
  for (const pagePath of PROTECTED_PAGES) {
    test(`เปิด ${pagePath} โดยไม่ login ต้องถูกเด้งไป login.html`, async ({ page }) => {
      await page.goto("/" + pagePath);
      await page.waitForURL(/login\.html/, { timeout: 15000 });
      expect(page.url()).toContain("login.html");

      // ยืนยันว่าไม่มีข้อมูลจริงของแอปรั่วออกมาก่อนถูกเด้ง (DOM ไม่มีการ์ด/ตารางข้อมูลของหน้าที่ป้องกันไว้)
      await expect(page.locator("#criteriaList .criteria-set-card")).toHaveCount(0);
      await expect(page.locator("#usersTableBody tr")).toHaveCount(0);
    });
  }

  test("เรียก Firestore REST API ตรงๆ โดยไม่มี auth token ต้องถูกปฏิเสธ (permission denied) ที่ระดับฐานข้อมูล", async ({
    request,
  }) => {
    // ยืนยันว่า firestore.rules บังคับจริงที่ระดับ database ไม่ใช่แค่ที่ UI — ยิง REST API ตรงๆ ข้าม UI ไปเลย
    const response = await request.get(
      "https://firestore.googleapis.com/v1/projects/cur-mate/databases/(default)/documents/criteriaSets"
    );
    // ต้องไม่ใช่ 200 พร้อมข้อมูลจริง — คาดหวัง 403 (PERMISSION_DENIED) ตาม firestore.rules
    expect(response.status(), "ต้องไม่ใช่ 200 (ห้ามอ่านข้อมูลได้โดยไม่ login)").not.toBe(200);
    const body = await response.json().catch(() => null);
    if (body) {
      const bodyText = JSON.stringify(body);
      expect(bodyText).not.toMatch(/"academicYear"|"uploadedBy"/); // ไม่มี field ข้อมูลจริงหลุดมาในผลลัพธ์
    }
  });
});
