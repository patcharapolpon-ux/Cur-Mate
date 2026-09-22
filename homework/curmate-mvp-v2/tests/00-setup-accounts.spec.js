// tests/00-setup-accounts.spec.js — เตรียมบัญชีทดสอบ (1 ADMIN-designate + 2 STAFF) ผ่าน signup.html จริง
// รันซ้ำได้ปลอดภัย (ถ้าบัญชีมีอยู่แล้วจะข้าม ไม่ error)
// สำคัญ: บัญชี ADMIN-designate ยังเป็น role "STAFF" หลังสมัคร (signup.html hardcode STAFF เสมอ) —
// ต้องมีคนเลื่อนบทบาทเป็น "ADMIN" ให้ด้วยมือผ่าน Firebase Console (Firestore > users > <uid> > role) ก่อน
// ถึงจะรันเทสต์ข้อ 1/2/3 และบางส่วนของข้อ 5 (ที่ต้องใช้สิทธิ์ ADMIN) ได้สำเร็จ — ดู test-results.md หัวข้อ "หมายเหตุสำคัญ"
const { test, expect } = require("@playwright/test");
const { signupIfNeeded } = require("./helpers");
const { ADMIN_ACCOUNT, STAFF_ACCOUNT_1, STAFF_ACCOUNT_2 } = require("./test-accounts");

test.describe.serial("เตรียมบัญชีทดสอบ", () => {
  for (const account of [ADMIN_ACCOUNT, STAFF_ACCOUNT_1, STAFF_ACCOUNT_2]) {
    test(`สมัครสมาชิกทดสอบ (ถ้ายังไม่มี): ${account.email}`, async ({ page }) => {
      const result = await signupIfNeeded(page, account);
      console.log(`[setup] ${account.email} -> ${result}`);
      expect(["created", "exists"]).toContain(result);
    });
  }
});
