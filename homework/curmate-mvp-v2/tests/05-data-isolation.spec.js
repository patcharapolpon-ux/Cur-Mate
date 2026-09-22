// tests/05-data-isolation.spec.js — เทสต์ข้อ 5: Data isolation ข้ามบัญชี (login เป็น STAFF)
// ส่วนที่ทดสอบได้โดยไม่ต้องมีบัญชี ADMIN จริง (สิทธิ์ STAFF ล้วนๆ):
//   5a. STAFF เข้าหน้า 06 (สร้างชุดเกณฑ์) ตรงๆ ไม่ได้ -> เจอ "ไม่มีสิทธิ์เข้าถึง"
//   5b. STAFF เข้าหน้า manage-users.html ตรงๆ ไม่ได้ -> เจอ "ไม่มีสิทธิ์เข้าถึง"
//   5c. หน้า 05 ของ STAFF ต้องไม่มีการ์ดสถานะ "รอตรวจสอบ" ปนมาเลย (เห็นเฉพาะ active)
// ส่วนที่ "ทำไม่ได้" ในรอบนี้ (ดูคอมเมนต์ใน test.skip ด้านล่าง + test-results.md หัวข้อ "หมายเหตุสำคัญ"):
//   5d. เปิด URL หน้า 07 ของชุดที่ยัง pending ตรงๆ (แก้ hash เอง) ต้องเจอข้อความปฏิเสธ
//       -> ต้องมี setId ของชุดที่สถานะ pending จริงมาทดสอบ ซึ่งต้องให้ ADMIN สร้างก่อน (ดูข้อ 1/2/3 ที่ยัง blocked เหมือนกัน)
const { test, expect } = require("@playwright/test");
const { login } = require("./helpers");
const { STAFF_ACCOUNT_1 } = require("./test-accounts");

test.describe.serial("ข้อ 5 — Data isolation ข้ามบัญชี (STAFF)", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, STAFF_ACCOUNT_1.email, STAFF_ACCOUNT_1.password);
  });

  test("5a. STAFF เปิดหน้า 06-create-criteria-set.html ตรงๆ ต้องเจอ \"ไม่มีสิทธิ์เข้าถึง\"", async ({ page }) => {
    await page.goto("/06-create-criteria-set.html");
    await expect(page.getByText("ไม่มีสิทธิ์เข้าถึงหน้านี้")).toBeVisible({ timeout: 10000 });
    // ต้องไม่เห็นฟอร์มสร้างชุดเกณฑ์จริง (ยืนยันว่าเนื้อหาเดิมถูกแทนที่ ไม่ใช่แค่ซ้อนทับ)
    await expect(page.locator("#extractBtn")).toHaveCount(0);
  });

  test("5b. STAFF เปิดหน้า manage-users.html ตรงๆ ต้องเจอ \"ไม่มีสิทธิ์เข้าถึง\"", async ({ page }) => {
    await page.goto("/manage-users.html");
    await expect(page.getByText("ไม่มีสิทธิ์เข้าถึงหน้านี้")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("#usersTableBody")).toHaveCount(0);
  });

  test("5c. หน้า 05 ของ STAFF ต้องไม่แสดงชุดเกณฑ์สถานะ \"รอตรวจสอบ\" เลย (เห็นเฉพาะ active)", async ({ page }) => {
    await page.goto("/05-criteria-dashboard.html");
    // รอให้โหลดเสร็จก่อน (ไม่ใช่ข้อความ "กำลังโหลด…" ค้างอยู่)
    await expect(page.locator("#criteriaList")).not.toContainText("กำลังโหลด", { timeout: 10000 });

    const pendingChips = page.locator("#criteriaList .status-chip.warning");
    await expect(pendingChips).toHaveCount(0);

    // ปุ่ม "สร้างชุดเกณฑ์ใหม่" ต้องถูกซ่อนสำหรับ STAFF ด้วย (สิทธิ์จัดการของ ADMIN เท่านั้น)
    await expect(page.locator("#createSetLink")).toBeHidden();

    const cardCount = await page.locator("#criteriaList .criteria-set-card").count();
    console.log(`[5c] STAFF เห็นชุดเกณฑ์ทั้งหมด ${cardCount} ชุด (ควรเป็น active ล้วน)`);
  });

  test(
    "5d. BLOCKED: ต้องมี criteriaSet สถานะ pending จริง (ADMIN เป็นคนสร้าง) ถึงจะทดสอบแก้ hash เปิดหน้า 07 ตรงๆ ได้",
    async () => {
      test.skip(
        true,
        "ยังไม่มีบัญชี ADMIN ทดสอบที่ใช้งานได้ในรอบนี้ — ไม่มี pending criteriaSet ให้ทดสอบ (ดู test-results.md หัวข้อ \"หมายเหตุสำคัญ\")"
      );
    }
  );
});
