# CLAUDE.md — homework/curmate-mvp-v2

ไฟล์นี้ให้บริบทเฉพาะโฟลเดอร์นี้แก่ Claude Code เวลาเปิดทำงานตรงๆ ในโฟลเดอร์การบ้าน (ไม่ผ่าน root ของ vault)

## นี่คืออะไร

แบบฝึกหัดการบ้าน Module 2 (Database) ต่อยอดจากสัปดาห์ที่ 6 — **ไม่ใช่แอปพลิเคชัน Curmate จริง** หน้าตา (HTML) นำมาจาก Prototype v1 จริงของ Curmate แล้วต่อ Firestore จริงแทนข้อมูลจำลอง รายละเอียดเต็มดูที่ [README.md](./README.md) และ [SCOPE.md](./SCOPE.md)

Stack: vanilla JS + Firebase JS SDK v10.13.0 (compat mode, `firebase.initializeApp` / `firebase.firestore()`) — ไม่มี build step, เปิดด้วย local static server (เช่น `npx serve .`)

## คำสั่งที่ใช้บ่อย

ไม่มี build / lint / test ใดๆ ในโฟลเดอร์นี้ (ไม่มี `package.json`) — เป็น static HTML/CSS/JS ล้วนที่รันตรงบน browser ผ่าน Firebase compat SDK ที่โหลดจาก CDN

- รันดูผลจริง: `npx serve .` จากในโฟลเดอร์นี้ แล้วเปิด `05-criteria-dashboard.html` (ต้องผ่าน HTTP server เท่านั้น เปิดไฟล์ตรงๆ แบบ `file://` จะพังเพราะ Firebase SDK)
- ใส่ข้อมูลตัวอย่างครั้งแรก (หรือรีเซ็ตกลับค่าตั้งต้น): เปิด `seed.html` แล้วกดปุ่มเริ่ม — กดซ้ำได้ปลอดภัยเพราะเขียนทับด้วย id เดิมจาก `js/data.js`
- ไม่มี automated test — ตรวจสอบด้วยการเปิดหน้าจริงใน browser ตาม flow ในหัวข้อถัดไป แล้วดู error ผ่าน browser console

## สถาปัตยกรรม: หน้า ↔ script ↔ การไหลของ flow

แต่ละหน้า HTML โหลด Firebase compat SDK (2 script จาก gstatic CDN) + `js/firebase-config.js` (init app ตัวเดียว, ตัวแปร global `db`) ตามด้วย script เฉพาะหน้าตัวเดียว (IIFE, ไม่มี module bundler, พึ่งพาตัวแปร global `db` ที่ประกาศไว้ก่อนหน้า):

| หน้า | script | อ่าน/เขียน collection |
| --- | --- | --- |
| `05-criteria-dashboard.html` | `js/dashboard.js` | อ่าน `criteriaSets` ทั้งหมด, ลบพ่วง `rules`+`reviewLog` เมื่อลบชุดเกณฑ์ |
| `06-create-criteria-set.html` | `js/create-criteria-set.js` | เขียนเอกสารใหม่ลง `criteriaSets` (`status: pending`) — ไม่สร้าง `rules` ใดๆ (ดูหัวข้อ "จำลอง" ด้านล่าง) |
| `07-rule-review-approval.html` | `js/rule-review.js` | อ่าน `criteriaSets/{setId}` + `rules` ที่ `criteriaSetId == setId`, เขียน `rules.status` และ `criteriaSets.status`, เพิ่มแถว `reviewLog` |
| `manage-users.html` | `js/manage-users.js` | อ่าน `users` ทั้งหมด, เขียน `users/{uid}.role` (ยกเว้นแถวของตัวเอง) |
| `seed.html` | `js/seed.js` + `js/data.js` | เขียนข้อมูลตัวอย่างทั้ง 4 collection ครั้งเดียว |

การไหลระหว่างหน้า: `05 → 06` (ปุ่ม "สร้างชุดเกณฑ์ใหม่") → บันทึกเสร็จพากลับ `05` → คลิกการ์ดใน `05` พาไป `07` พร้อม id ของชุดเกณฑ์

**จุดที่ต้องรู้ก่อนแก้โค้ดที่ส่ง id ข้ามหน้า**: `05` ส่ง id ไปหน้า `07` ผ่าน **URL hash** (`07-rule-review-approval.html#setId=...`) ไม่ใช่ query string ทั่วไป เพราะ local static server บางตัว (เช่น `npx serve` ที่ redirect `.html` → clean URL) จะตัด query string ทิ้งระหว่าง redirect แต่ hash fragment ไม่ถูกส่งไปที่ server เลยจึงไม่มีปัญหานี้ — ถ้าจะเพิ่มหน้าใหม่ที่ต้องรับ id จากหน้าอื่น ให้ใช้ pattern เดียวกัน (`window.location.hash` + `URLSearchParams`) ไม่ใช้ `window.location.search`

## โครงสร้าง Firestore (ชื่อ collection ทั้งหมดที่ใช้จริง)

```
📁 users
📁 criteriaSets
📁 rules
   └ 📁 reviewLog     (subcollection ของ rules/{ruleId})
```

- ไม่มี collection อื่นนอกจากนี้ — ก่อนเพิ่ม field/collection ใหม่ ให้เช็ค [SCOPE.md](./SCOPE.md) ก่อนว่าอยู่ในขอบเขตที่ตกลงไว้หรือเปล่า

## สถานะที่ใช้จริงในระบบ

- `criteriaSets.status`: `"pending"` (ยังไม่เปิดใช้งาน, ซ่อนจากผู้ใช้ทั่วไป) ↔ `"active"` (เปิดใช้งานแล้ว) — **ไม่ได้คำนวณอัตโนมัติจากโค้ด** เขียนกลับ Firestore ได้ต่อเมื่อแอดมินกดปุ่ม "เปิดใช้งานชุดเกณฑ์นี้" ที่หน้า 07 เท่านั้น (เพิ่มเมื่อ 2026-09-06) ปุ่มนี้ enable เมื่อกฎเกณฑ์ย่อยทุกข้อในชุดถูกตรวจแล้ว (approved หรือ rejected ครบ ไม่บังคับว่าต้อง approved ทั้งหมด) — กดปุ่ม "แก้ไขชุดเกณฑ์นี้อีกครั้ง" (เพิ่มเมื่อ 2026-09-06) เพื่อย้อนกลับเป็น `pending` ได้ทุกเมื่อที่สถานะเป็น `active`
- `rules.status`: `"pending"` (รอตรวจสอบ) → `"approved"` (อนุมัติแล้ว) หรือ `"rejected"` (ไม่อนุมัติ) — ปุ่ม "อนุมัติ"/"ไม่อนุมัติ" ในหน้า 07 เขียนสถานะจริงกลับ Firestore ทั้งคู่ (แก้เฉพาะ field `status` เท่านั้น) พร้อมบันทึกแถวใน `reviewLog` เหมือนกัน — แก้ไขสถานะกลับ (approved ↔ rejected) ได้ด้วยปุ่ม "แก้ไข" ต่อข้อ แต่**ทำได้เฉพาะตอนที่ `criteriaSets.status` ของชุดนั้นไม่ใช่ `active`** (เพิ่มเมื่อ 2026-09-06) ถ้าเปิดใช้งานชุดแล้วต้องกด "แก้ไขชุดเกณฑ์นี้อีกครั้ง" ที่ criteriaSets ก่อนถึงจะแก้ไขข้อย่อยได้
- **ลบข้อมูลจริง (เพิ่มเมื่อ 2026-09-06, ไม่มี soft-delete/ถังขยะ)** — หน้า 05 มีปุ่ม "ลบชุดเกณฑ์นี้" ต่อการ์ด (ลบพ่วง cascade ทั้ง `rules`/`reviewLog` ของชุดนั้น, ลบได้ทุกสถานะ), หน้า 07 มีปุ่ม "ลบ" ต่อกฎเกณฑ์ย่อย (ลบพ่วง `reviewLog` ของข้อนั้น, **ล็อกตอน `criteriaSets.status` เป็น `active`** เหมือนปุ่ม "แก้ไข") ทั้งสองปุ่มเปิด `confirm()` ถามยืนยันก่อนทุกครั้ง ยกเลิกแล้วไม่ลบ — ลบแล้วกู้คืนไม่ได้ (ไม่มี trash/undo ใน Firestore test mode)

## ระบบ login + role (เพิ่มเมื่อ 2026-09-07)

มี Firebase Authentication (Email/Password) จริงแล้ว — `signup.html`/`login.html` เป็นหน้าเดียวที่ไม่ต้อง login มาก่อน ส่วนหน้า 05/06/07/manage-users ทั้งหมด gate ด้วย `js/auth.js` (shared, โหลดก่อน script เฉพาะหน้าเสมอ):

- ยังไม่ login → เด้งไป `login.html` ทันที (`onAuthStateChanged`)
- login แล้ว → resolve `window.CURMATE_AUTH_READY` (Promise, global) พร้อม `{uid, email, name, role}` เสมอ ไม่ว่า role อะไรก็ตาม — **`js/auth.js` เองไม่ปิดกั้นตาม role แล้ว** (ต่างจากตอนแรกที่ทำ) เพราะหน้า 05/07 เปิดให้ทั้ง 2 role เข้าดูได้ (ต่างกันที่ปุ่ม/ขอบเขตข้อมูล ดู ACL.md)
- หน้าที่เป็น ADMIN ล้วน (06, manage-users) เรียก **`window.CURMATE_REQUIRE_ADMIN(currentUser)`** เอง (คืนค่า `true`/`false`, แทนที่ `document.body.innerHTML` ด้วยข้อความ "ไม่มีสิทธิ์เข้าถึง" ให้เองถ้าไม่ผ่าน) — ดูตัวอย่างใน `js/create-criteria-set.js`/`js/manage-users.js` ต้นไฟล์
- **ทุก script เฉพาะหน้าที่ query Firestore ต้อง `.then()` บน `window.CURMATE_AUTH_READY` ก่อนเสมอ** ห้าม query ตรงๆ ตอนไฟล์โหลด

role มี 2 ค่า (เก็บใน `users/{uid}.role` เป็นโค้ดภาษาอังกฤษ ไม่ใช่ข้อความไทยแล้ว): **`"ADMIN"`** (จัดการเกณฑ์+จัดการ role ผู้ใช้อื่น ยกเว้นตัวเอง) และ **`"STAFF"`** (อ่านเกณฑ์ที่ `active` แล้วเพื่อศึกษา, อ่านอย่างเดียว) — ดูตารางสิทธิ์เต็มใน [ACL.md](./ACL.md)

- `signup.html` ไม่มี dropdown เลือก role แล้ว — บัญชีใหม่ทุกบัญชีได้ `STAFF` เสมอ (`js/signup.js` hardcode) ADMIN คนแรกของระบบต้องตั้งค่าด้วยมือผ่าน Firebase Console เอง (ไม่มี auto-bootstrap ในโค้ด) ADMIN คนถัดไปเลื่อน role ให้กันเองผ่าน `manage-users.html`
- `manage-users.html` (+ `js/manage-users.js`): ADMIN ล้วน แสดงตาราง `users` พร้อม dropdown เปลี่ยน role รายคน เขียนกลับ Firestore ทันที (`db.collection("users").doc(uid).update({role})`) — **แถวของบัญชีตัวเอง (uid ตรงกับ `currentUser.uid`) ไม่มี dropdown ให้แก้** บังคับด้วย UI เท่านั้น
- หน้า 05 (`dashboard.js`): ADMIN เห็นทุกสถานะ + ปุ่มสร้าง/ลบ; STAFF เห็นเฉพาะ `criteriaSets.status == "active"` (query filter คนละตัวกับ ADMIN) ไม่มีปุ่มสร้าง/ลบ
- หน้า 07 (`rule-review.js`): ADMIN ทำได้ทุกอย่างเหมือนเดิม; STAFF เห็นแค่ badge สถานะของแต่ละกฎเกณฑ์ (ไม่มีปุ่มใดๆ) และถ้า `criteriaSets.status !== "active"` จะเจอข้อความปฏิเสธแทนรายการกฎเกณฑ์ (กันเข้าดูชุดที่ยัง `pending` ผ่านการแก้ hash เอง)

`users` document id เปลี่ยนจาก id สมมติ (`u001`/`u002`) เป็น **Firebase Auth UID จริง** ตั้งแต่จุดนี้ — ผู้ใช้ที่มาจาก `seed.html` ไม่มีบัญชี Firebase Auth คู่กัน (login ด้วย id พวกนั้นไม่ได้) ต้องสมัครผ่าน `signup.html` เพื่อได้ uid จริง

`reviewLog.adminId`/`adminName` (หน้า 07) และ `criteriaSets.uploadedBy`/`uploadedByName` (หน้า 06) มาจากผู้ login อยู่จริงแล้ว ไม่ใช่ค่าคงที่อีกต่อไป

**ยังไม่ทำ**: Firestore Security Rules ที่บังคับ auth/role ก่อน read/write จริง (ยังเป็น open test rules) — การล็อกอิน + สิทธิ์ตอนนี้ป้องกันได้แค่ผ่านหน้าเว็บ (UI) ไม่ได้กันการยิง Firestore API ตรงๆ ข้ามหน้าเว็บไปเลย

## ข้อห้าม/ข้อควรระวัง

- **ห้ามใส่ secret จริงลงไฟล์ที่จะ push** — service account JSON, admin SDK credential, หรือ API key/token ส่วนตัวอื่นใด ห้ามฝังในโค้ดของโฟลเดอร์นี้เด็ดขาด
  - ข้อยกเว้นที่ตั้งใจ: `js/firebase-config.js` มี Firebase **Web API key** ฝังอยู่โดยตั้งใจ — ค่านี้ไม่ใช่ความลับ (ออกแบบมาให้เปิดเผยได้ ปลอดภัยจริงอยู่ที่ Firestore Security Rules ไม่ใช่ตัว key) จึง commit ได้ตามปกติ ไม่ต้องแจ้งเตือน
- Firestore project (`cur-mate`) อยู่โหมด test rules (อนุญาต read/write แบบเปิด) หมดอายุ 2026-10-04 — ถ้าเกินวันนี้แล้ว seed/เขียนข้อมูลจะ fail ให้แจ้งผู้ใช้ไปตั้ง rules ใหม่ใน Firebase Console แทนการพยายามแก้ไขปัญหาด้วยวิธีอื่น
