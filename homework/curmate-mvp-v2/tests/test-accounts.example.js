// tests/test-accounts.example.js — ต้นแบบสำหรับสร้าง tests/test-accounts.js ของตัวเอง
// ไฟล์ tests/test-accounts.js ตัวจริงถูก .gitignore ไว้ (ไม่ push ขึ้น GitHub) เพราะมีรหัสผ่านจริง
// ของบัญชีทดสอบที่มีสิทธิ์ ADMIN บนเว็บจริง — คัดลอกไฟล์นี้เป็น test-accounts.js แล้วแก้ค่าด้านล่างเอง
//
// ขั้นตอน:
// 1. สมัครสมาชิก 3 บัญชีจริงผ่าน signup.html (ได้ role "STAFF" เสมอ)
// 2. เลื่อน role บัญชี ADMIN ด้วยมือผ่าน Firebase Console (ดู README.md/SCOPE.md)
// 3. คัดลอกไฟล์นี้เป็น tests/test-accounts.js แล้วใส่อีเมล/รหัสผ่านจริงที่สมัครไว้

const RUN_SUFFIX = "w9"; // เปลี่ยนค่านี้ถ้าต้องการสร้างชุดบัญชีทดสอบใหม่อีกชุด (กันชนกับที่เคยสมัครไว้)

const ADMIN_ACCOUNT = {
  name: "Playwright Test Admin",
  email: `playwright-admin-${RUN_SUFFIX}@curmate-test.dev`,
  password: "เปลี่ยนเป็นรหัสผ่านจริงของบัญชีที่สมัครไว้",
};

const STAFF_ACCOUNT_1 = {
  name: "Playwright Test Staff One",
  email: `playwright-staff1-${RUN_SUFFIX}@curmate-test.dev`,
  password: "เปลี่ยนเป็นรหัสผ่านจริงของบัญชีที่สมัครไว้",
};

const STAFF_ACCOUNT_2 = {
  name: "Playwright Test Staff Two",
  email: `playwright-staff2-${RUN_SUFFIX}@curmate-test.dev`,
  password: "เปลี่ยนเป็นรหัสผ่านจริงของบัญชีที่สมัครไว้",
};

module.exports = { ADMIN_ACCOUNT, STAFF_ACCOUNT_1, STAFF_ACCOUNT_2 };
