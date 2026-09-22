# Test Results — Curmate MVP v2

วันที่รันล่าสุด: 2026-09-22 เวลา 21:25:24 – 21:26:57 (SEAST, UTC+8) — รอบที่ 3 (รันซ้ำเพื่อยืนยันผลจริงหลังรอบที่ 2 ที่เลื่อน role บัญชี `playwright-admin-w9@curmate-test.dev` เป็น `ADMIN` แล้ว ไม่มีการเปลี่ยนแปลงโค้ด/สิทธิ์เพิ่มเติมก่อนรอบนี้)
รันด้วย: agent tester (โมเดล Sonnet 5) — คำสั่ง `npx playwright test` ในโฟลเดอร์ `homework/curmate-mvp-v2/` รันจริงบน https://cur-mate.web.app/ (Firebase Hosting + Firestore + Auth จริง, ไม่ใช่ mock)

## สรุป

| # | สถานการณ์ | ผล | หมายเหตุ |
| --- | --- | --- | --- |
| 1 | เส้นทางหลักของฟีเจอร์หลัก | ✅ ผ่าน | `tests/01-happy-path.spec.js` — 16.6s |
| 2 | ปุ่มเปลี่ยนสถานะทำงานจริง | ✅ ผ่าน | `tests/02-state-machine.spec.js` — 18.9s รวม assertion หลัง reload หน้า |
| 3 | Validation | ✅ ผ่านครบ 3 เคส | `tests/03-validation.spec.js` — 3a/3b/3c |
| 4 | Authentication | ✅ ผ่านครบ 5 เคส | `tests/04-authentication.spec.js` — รวมเช็คที่ระดับ Firestore REST API ตรงๆ ด้วย |
| 5 | Data isolation ข้ามบัญชี | ✅ ผ่าน 3 เคส (5a/5b/5c), ⏭️ ข้าม 1 เคส (5d) | เหตุผลการข้ามเหมือนรอบก่อนหน้า ดูด้านล่าง |

**สรุปตัวเลขรอบนี้**: รันเทสต์ทั้งชุด (`npx playwright test`, 17 เคสย่อยรวม 3 เคสของ `00-setup-accounts.spec.js`) — **ผ่าน 16 เคสย่อย, ข้าม 1 เคสย่อย (5d, มีเหตุผลชัดเจน), ไม่มี fail แม้แต่เคสเดียว** ครบทั้ง 5 สถานการณ์หลักตามโจทย์สัปดาห์ 9 ไม่มีบั๊ก ไม่มีช่องโหว่ความปลอดภัยที่ต้องรายงานในรอบนี้

รายชื่อเคสย่อยทั้งหมดที่รันได้จริง (ลำดับตามที่ Playwright รายงาน):

| ลำดับ | ไฟล์ | เคสย่อย | ผล | เวลา |
| --- | --- | --- | --- | --- |
| 1 | `00-setup-accounts.spec.js` | สมัครสมาชิกทดสอบ (ถ้ายังไม่มี): `playwright-admin-w9@curmate-test.dev` → "exists" | ✅ | 4.5s |
| 2 | `00-setup-accounts.spec.js` | สมัครสมาชิกทดสอบ: `playwright-staff1-w9@curmate-test.dev` → "exists" | ✅ | 5.4s |
| 3 | `00-setup-accounts.spec.js` | สมัครสมาชิกทดสอบ: `playwright-staff2-w9@curmate-test.dev` → "exists" | ✅ | 7.4s |
| 4 | `01-happy-path.spec.js` | ข้อ 1 — ADMIN สร้างชุดเกณฑ์ใหม่แล้วเห็นปรากฏในหน้า 05 | ✅ | 16.6s |
| 5 | `02-state-machine.spec.js` | ข้อ 2 — อนุมัติครบทุกข้อแล้วเปิดใช้งานชุดเกณฑ์ สถานะเปลี่ยนเป็น active จริงใน Firestore | ✅ | 18.9s |
| 6 | `03-validation.spec.js` | 3a. กรอกชื่อชุดเกณฑ์แต่ไม่แนบไฟล์ .md → ปุ่มบันทึกต้อง disabled เสมอ | ✅ | 4.2s |
| 7 | `03-validation.spec.js` | 3b. ไม่กรอกชื่อชุดเกณฑ์เลย (แม้แนบไฟล์ .md) → ปุ่มบันทึกต้อง disabled | ✅ | 2.5s |
| 8 | `03-validation.spec.js` | 3c. กรอกลิงก์เอกสารต้นฉบับผิดรูปแบบ → แจ้ง error และบันทึกไม่ได้ | ✅ | 2.3s |
| 9 | `04-authentication.spec.js` | เปิด `05-criteria-dashboard.html` โดยไม่ login → เด้งไป `login.html` | ✅ | 822ms |
| 10 | `04-authentication.spec.js` | เปิด `06-create-criteria-set.html` โดยไม่ login → เด้งไป `login.html` | ✅ | 840ms |
| 11 | `04-authentication.spec.js` | เปิด `07-rule-review-approval.html#setId=dummy-id-for-auth-test` โดยไม่ login → เด้งไป `login.html` | ✅ | 785ms |
| 12 | `04-authentication.spec.js` | เปิด `manage-users.html` โดยไม่ login → เด้งไป `login.html` | ✅ | 886ms |
| 13 | `04-authentication.spec.js` | เรียก Firestore REST API ตรงๆ โดยไม่มี auth token → ต้องถูกปฏิเสธ (permission denied) ที่ระดับฐานข้อมูล | ✅ | 1.6s |
| 14 | `05-data-isolation.spec.js` | 5a. STAFF เปิดหน้า `06-create-criteria-set.html` ตรงๆ → เจอ "ไม่มีสิทธิ์เข้าถึง" | ✅ | 3.6s |
| 15 | `05-data-isolation.spec.js` | 5b. STAFF เปิดหน้า `manage-users.html` ตรงๆ → เจอ "ไม่มีสิทธิ์เข้าถึง" | ✅ | 4.1s |
| 16 | `05-data-isolation.spec.js` | 5c. หน้า 05 ของ STAFF ต้องไม่แสดงชุดเกณฑ์สถานะ "รอตรวจสอบ" เลย (เห็นเฉพาะ active) | ✅ | 4.1s |
| 17 | `05-data-isolation.spec.js` | 5d. STAFF แก้ hash เปิดหน้า 07 ของชุดที่ยัง `pending` ตรงๆ ต้องเจอข้อความปฏิเสธ | ⏭️ ข้าม | — |

รวมเวลารันทั้งชุด: ประมาณ 1.4 นาที (worker เดียว รันเรียงกันตาม `playwright.config.js`)

---

## รายละเอียดเคสที่ข้ามไป (5d) — ไม่ใช่ fail

**ทำอะไร**: ตั้งใจ login เป็น STAFF แล้วแก้ URL hash เปิดหน้า 07 ของชุดเกณฑ์ที่สถานะยัง `pending` ตรงๆ (`07-rule-review-approval.html#setId=<pending-set-id>`) เพื่อยืนยันว่า STAFF เจอข้อความปฏิเสธ ไม่ใช่ข้อมูลจริง

**ติดตรงไหน**: `tests/05-data-isolation.spec.js` บรรทัด 46 — เคสนี้ยังเขียนเป็น `test.skip(...)` (ข้อความ "BLOCKED: ต้องมี criteriaSet สถานะ pending จริง (ADMIN เป็นคนสร้าง) ถึงจะทดสอบแก้ hash เปิดหน้า 07 ตรงๆ ได้") เพราะไฟล์เทสต์ยังไม่มี step ที่ให้ ADMIN สร้าง criteriaSet ทิ้งไว้เป็น `pending` (ไม่ approve/activate) ก่อนแล้วส่ง `setId` นั้นให้ฝั่ง STAFF ทดสอบ — เป็นข้อจำกัดของไฟล์เทสต์เอง ไม่ใช่บั๊กของแอป และ**ไม่อยู่ในขอบเขตงานของรอบนี้** (งานที่ได้รับมอบหมายคือรันเทสต์ชุดที่มีอยู่ซ้ำ ไม่ใช่แก้ไขไฟล์เทสต์) เคสอื่นในไฟล์เดียวกัน (5a/5b/5c) ที่ไม่ต้องพึ่ง precondition นี้ผ่านครบแล้ว ให้ความมั่นใจบางส่วนว่าการแยกสิทธิ์ STAFF ทำงานถูกต้อง

**ถ้าต้องการให้ครบ 100%**: ต้องแก้ `tests/05-data-isolation.spec.js` เพิ่ม step ให้ ADMIN สร้างชุดเกณฑ์ใหม่แล้วปล่อยไว้ที่สถานะ `pending` (ไม่กด "เปิดใช้งาน") ก่อนสลับไป STAFF แล้วแก้ hash ตรงๆ — เป็นการแก้ไฟล์เทสต์ (ได้รับอนุญาตตามกฎเหล็ก เพราะไม่ใช่การบังคับให้ผ่านโดยไม่ตรงพฤติกรรมจริง) แต่ไม่ได้ทำในรอบนี้เพราะอยู่นอกขอบเขตงานที่ได้รับมอบหมาย

---

## ข้อมูลทดสอบที่ล้างออกหลังรันจบ

รอบนี้เทสต์สร้างชุดเกณฑ์ทดสอบใหม่ 2 ชุดจริงใน Firestore ระหว่างรัน:
- `Playwright E2E ข้อ1 1790087153292` (จากข้อ 1 — คงสถานะ `pending`)
- `Playwright E2E ข้อ2 1790087168747` (จากข้อ 2 — ถูกเปิดใช้งานเป็น `active` ระหว่างเทสต์)

ล้างออกจาก Firestore เรียบร้อยแล้วผ่าน UI จริง (ปุ่ม "ลบชุดเกณฑ์นี้" ที่หน้า `05-criteria-dashboard.html`, login เป็น ADMIN แล้วลบทีละการ์ด — cascade ลบ `rules`/`reviewLog`/`extractionLog` ของชุดนั้นไปด้วยตามพฤติกรรมจริงของ `dashboard.js`) ไม่ได้แก้ไข Firestore ตรงๆ ไม่ได้แตะโค้ดแอป ตรวจสอบซ้ำแล้วว่าไม่มีชุดเกณฑ์ชื่อขึ้นต้นด้วย "Playwright E2E" ค้างอยู่ในระบบหลังล้างเสร็จ — ไม่ได้ลบบัญชีผู้ใช้ทดสอบใดๆ (ยังใช้ซ้ำได้ในรอบถัดไป)

### บัญชีทดสอบที่ใช้ (คงอยู่ ไม่ได้ลบ)

| บัญชี | อีเมล | role ปัจจุบัน |
| --- | --- | --- |
| ADMIN | `playwright-admin-w9@curmate-test.dev` | `ADMIN` |
| STAFF 1 | `playwright-staff1-w9@curmate-test.dev` | `STAFF` |
| STAFF 2 | `playwright-staff2-w9@curmate-test.dev` | `STAFF` |

**รหัสผ่านจริงไม่แสดงในเอกสารนี้โดยตั้งใจ** (บัญชี ADMIN ข้างต้นมีสิทธิ์จัดการข้อมูลจริงบนเว็บ) — เก็บไว้เฉพาะใน `tests/test-accounts.js` ซึ่งถูก `.gitignore` ไว้ ไม่ push ขึ้น GitHub ดูวิธีสร้างไฟล์นี้เองได้ที่ `tests/test-accounts.example.js`

---

## ไฟล์ที่เกี่ยวข้อง

- `package.json`, `playwright.config.js` — ตั้งค่า Playwright (ชี้ `baseURL` ไปที่ https://cur-mate.web.app/ จริง)
- `tests/test-accounts.js` — ข้อมูลบัญชีทดสอบ (อีเมล/รหัสผ่านจริง) **ถูก `.gitignore` ไว้ ไม่อยู่ใน repo บน GitHub** ดู `tests/test-accounts.example.js` เป็นต้นแบบ
- `tests/helpers.js` — ฟังก์ชันช่วย (login/signup/สร้างชุดเกณฑ์) ใช้ร่วมกันทุกไฟล์เทสต์
- `tests/fixtures/sample-criteria.md` — ไฟล์ .md ตัวอย่างขนาดสั้น (2 กฎเกณฑ์) ใช้ประหยัดโควตา AI ของหลักสูตร
- `tests/00-setup-accounts.spec.js` — เตรียมบัญชีทดสอบ (✅ ผ่านทั้ง 3 เคส)
- `tests/01-happy-path.spec.js` — ข้อ 1 (✅ ผ่าน)
- `tests/02-state-machine.spec.js` — ข้อ 2 (✅ ผ่าน)
- `tests/03-validation.spec.js` — ข้อ 3 (✅ ผ่านครบ 3 เคส)
- `tests/04-authentication.spec.js` — ข้อ 4 (✅ ผ่านครบ 5 เคส)
- `tests/05-data-isolation.spec.js` — ข้อ 5 (✅ ผ่าน 3/4, ⏭️ ข้าม 1 — เคส 5d)

ไม่มีการแก้ไขไฟล์โค้ดแอปพลิเคชันใดๆ (`.html`, `js/*.js`, `firestore.rules`) หรือไฟล์เทสต์ตลอดการทำงานรอบนี้ — รันเทสต์ที่มีอยู่ซ้ำและล้างข้อมูลทดสอบที่เกิดขึ้นระหว่างรันผ่าน UI จริงเท่านั้น (สคริปต์ล้างข้อมูลชั่วคราวที่ใช้เรียก UI ผ่าน Playwright ถูกลบทิ้งหลังใช้งานเสร็จ ไม่ได้ commit เข้า repo)

---

## ประวัติการรันก่อนหน้า

ดูรายละเอียดรอบที่ 1 (ก่อนเลื่อน role เป็น ADMIN — ข้อ 1/2/5d ติด precondition) และรอบที่ 2 (หลังเลื่อน role — ผ่านครบเป็นครั้งแรก พบเคสหลุด (flaky) 2 ครั้งระหว่างตรวจสอบความเสถียรซึ่งไม่เกี่ยวกับ role/ACL) ได้จาก git history ของไฟล์นี้ — สรุปสั้น: ผลของรอบที่ 3 (รอบนี้) สอดคล้องกับรอบที่ 2 ทุกจุด ไม่มีเคสหลุดเพิ่มเติมระหว่างรันครั้งเดียวนี้
