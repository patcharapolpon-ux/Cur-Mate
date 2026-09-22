// tests/helpers.js — ฟังก์ชันช่วยใช้ร่วมกันหลายไฟล์เทสต์ (login/signup ผ่าน UI จริง ไม่แตะโค้ดแอป)
const { expect } = require("@playwright/test");

async function login(page, email, password) {
  await page.goto("/login.html");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.locator("#submitBtn").click();
  await page.waitForURL(/05-criteria-dashboard\.html/, { timeout: 15000 });
}

// สมัครสมาชิกจริงผ่าน signup.html — คืนค่า "created" ถ้าสมัครใหม่สำเร็จ, "exists" ถ้ามีบัญชีนี้อยู่แล้ว (ปลอดภัย รันซ้ำได้)
async function signupIfNeeded(page, { name, email, password }) {
  await page.goto("/signup.html");
  await page.locator("#name").fill(name);
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.locator("#confirmPassword").fill(password);
  await page.locator("#submitBtn").click();

  const result = await Promise.race([
    page
      .waitForURL(/login\.html#signup=success/, { timeout: 15000 })
      .then(() => "created"),
    page
      .locator("#errorBox")
      .waitFor({ state: "visible", timeout: 15000 })
      .then(() => "error"),
  ]);

  if (result === "error") {
    const message = await page.locator("#errorBox").innerText();
    if (message.includes("มีบัญชีอยู่แล้ว")) {
      return "exists";
    }
    throw new Error("signup ไม่สำเร็จ: " + message);
  }
  return "created";
}

async function logout(page) {
  const logoutBtn = page.locator("#logoutBtn");
  if (await logoutBtn.isVisible().catch(() => false)) {
    await logoutBtn.click();
    await page.waitForURL(/login\.html/, { timeout: 15000 });
  }
}

const path = require("path");
const MD_FIXTURE = path.join(__dirname, "fixtures", "sample-criteria.md");

// สร้างชุดเกณฑ์ใหม่จริงผ่านหน้า 06 (ต้อง login เป็น ADMIN มาก่อนแล้ว) — เรียก AI จริง (OpenRouter) สกัดกฎเกณฑ์จริง
// ใช้ไฟล์ fixture สั้นๆ (tests/fixtures/sample-criteria.md, 2 ข้อ) เพื่อประหยัดโควตา AI ของหลักสูตร
// คืนค่า { setId, setName } — redirect ไปหน้า 07 ให้เองหลังสกัดสำเร็จ (พฤติกรรมจริงของ create-criteria-set.js)
async function createCriteriaSet(page, { namePrefix = "Playwright Test Set" } = {}) {
  const setName = `${namePrefix} ${Date.now()}`;
  await page.goto("/06-create-criteria-set.html");
  await page.locator("#setName").fill(setName);
  await page.locator("#setScope").fill("ทดสอบระบบอัตโนมัติ (Playwright)");
  await page.locator("#mdInput").setInputFiles(MD_FIXTURE);

  await expect(page.locator("#extractBtn")).toBeEnabled({ timeout: 10000 });
  await page.locator("#extractBtn").click();

  // รอ AI สกัดจริงเสร็จแล้ว redirect ไปหน้า 07 พร้อม setId ใน hash — ให้เวลานานหน่อยเพราะเรียก AI จริง
  await page.waitForURL(/07-rule-review-approval\.html#setId=/, { timeout: 45000 });
  const url = new URL(page.url());
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
  const setId = hashParams.get("setId");
  return { setId, setName };
}

module.exports = { login, signupIfNeeded, logout, createCriteriaSet, expect };
