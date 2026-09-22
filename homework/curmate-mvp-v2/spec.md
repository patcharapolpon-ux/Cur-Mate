# spec.md — สเปกระบบสรุป (Curmate MVP v2)

เอกสารนี้รวบรวม [SCOPE.md](./SCOPE.md), [README.md](./README.md), [ACL.md](./ACL.md), [CLAUDE.md](./CLAUDE.md) ให้เป็นสเปกฉบับเดียวที่ครบสำหรับใช้:

1. เป็นฐานตัดสินใจแบ่งงาน AI agent 3 ตัว (`.claude/agents/`) ของการบ้านสัปดาห์ที่ 9
2. ตอบคำถาม "อธิบายระบบตัวเอง" (เกณฑ์ผ่านข้อ 5 ของโจทย์สัปดาห์ 9)

ต้นทางรายละเอียด/ประวัติการตัดสินใจแบบเต็มอยู่ใน 4 ไฟล์ข้างต้น เอกสารนี้เป็นแค่บทสรุปที่อ่านรวดเดียวจบ ไม่ใช่แหล่งข้อมูลใหม่

---

## 1. ภาพรวมระบบ

**Curmate** คือระบบตรวจสอบความสอดคล้องของเอกสารรายละเอียดหลักสูตร (มคอ.2) — แต่การบ้านนี้ทำแค่ **ฟีเจอร์เดียว**: **"การจัดการฐานความรู้เกณฑ์มาตรฐานหลักสูตร"** (criteria-knowledge-base) ไม่ใช่ทั้งระบบ Curmate จริง (ดูสเปกต้นทางที่ `docs/01-requirements/01-spec/20260823-02-criteria-knowledge-base.md` ของ vault หลัก)

**Flow ทางธุรกิจหลัก**: ADMIN อัปโหลดเอกสารเกณฑ์ (ไฟล์ `.md` ที่แปลงจาก PDF มาก่อนล่วงหน้า) → AI สกัดเป็น "กฎเกณฑ์" ทีละข้อ → ADMIN ตรวจสอบและอนุมัติ/ไม่อนุมัติทีละข้อ (หรือ bulk approve) → เมื่อกฎเกณฑ์ทุกข้อในชุดถูกตรวจครบแล้ว ADMIN กดเปิดใช้งาน → ชุดเกณฑ์เปลี่ยนสถานะเป็น "เปิดใช้งาน (active)" → STAFF เข้าดูได้แบบอ่านอย่างเดียวเพื่อศึกษา

**Stack**: vanilla JS + Firebase JS SDK v10.13.0 (compat mode, `firebase.initializeApp`/`firebase.firestore()`) — ไม่มี build step, ไม่มี `package.json`, ไม่มี automated test เดิม (เพิ่ง)) รันตรงบน browser ผ่าน local static server เท่านั้น (`file://` ใช้ไม่ได้)

**หน้าตา (HTML)**: ไม่ได้พิมพ์ขึ้นเอง — นำมาจาก **Prototype v1 จริงของ Curmate** (`docs/02-design/01-prototypes/20260823-prototype-v1/`) มาต่อ Firestore จริงแทนข้อมูลจำลอง เป็นการ "หยิบมา" ครั้งเดียว (snapshot) ไม่ sync กับต้นทาง

**Deploy จริง**: https://cur-mate.web.app/ (Firebase Hosting, project `cur-mate`) — เข้า root แล้ว redirect ไป `login.html` อัตโนมัติ

**AI**: เรียก **OpenRouter** โมเดล `google/gemini-2.5-flash-lite` ตรงจากฝั่ง client ผ่าน `js/ai-helper.js` (ไม่มี backend) — คีย์ของหลักสูตรเก็บใน `js/ai-config.local.js` ถูก `.gitignore` ไว้ (pattern `*.local.js`) **ห้ามใช้คีย์ส่วนตัวแทนเด็ดขาด**

---

## 2. โครงสร้างข้อมูล Firestore

```
📁 users
📁 criteriaSets
   └ 📁 extractionLog   (เพิ่มสัปดาห์ที่ 8)
📁 rules
   └ 📁 reviewLog
```

ไม่มี collection อื่นนอกจากนี้

| Collection | Field สำคัญ | หมายเหตุ |
| --- | --- | --- |
| `users/{uid}` (doc id = Firebase Auth UID จริง) | `name`, `email`, `role` (`"ADMIN"` \| `"STAFF"`) | บัญชีใหม่จาก signup ได้ `STAFF` เสมอ; ADMIN คนแรกตั้งเองผ่าน Firebase Console |
| `criteriaSets/{id}` | `status` (`"pending"` \| `"active"`), `uploadedBy`/`uploadedByName`, `sourceFileUrl` (ลิงก์ Google Drive ของ PDF ต้นฉบับ, ไม่บังคับ), `sourceMarkdownText` (เนื้อหาไฟล์ .md เต็ม), `degreeLevel` | สร้างได้เฉพาะ ADMIN |
| `criteriaSets/{id}/extractionLog/{logId}` | `action` (`"extract"` \| `"re-extract"`), `ruleCount`, `model`, `triggeredBy` | บันทึกทุกครั้งที่ AI สกัด/สกัดใหม่ |
| `rules/{id}` | `ruleText`, `status` (`"pending"` \| `"approved"` \| `"rejected"`), `criteriaSetId`, `criteriaSetName` (denormalized), `sourceRef` (อ้างอิงเลขข้อ/มาตราจากเอกสารต้นฉบับ, AI คัดลอกตรงห้ามแต่ง), `order` (ลำดับที่ปรากฏในเอกสาร, 0-based), `category` (จัดหมวดโดย AI, optional) | `sourceRef`/`criteriaSetName` เป็น read-only มาจาก AI เท่านั้น แก้ไม่ได้ผ่าน UI |
| `rules/{id}/reviewLog/{logId}` | `adminId`, `adminName`, การเปลี่ยนสถานะ | เขียนทุกครั้งที่อนุมัติ/ไม่อนุมัติ/แก้ไขสถานะ |

**จุดสำคัญทางเทคนิค**: หน้า 07 ดึง `rules` มาทั้งหมดแล้ว **sort ฝั่ง client** ด้วย field `order` (ไม่ใช้ Firestore `.orderBy()`) เพราะกฎเกณฑ์เก่าที่ไม่มี field นี้จะถูก query ตัดทิ้งไปเลยถ้าใช้ `orderBy` ตรงๆ

---

## 3. บทบาท/สิทธิ์ (ACL)

ค่า `role` เป็นโค้ดภาษาอังกฤษ มี 2 ค่า: `ADMIN`, `STAFF` — บังคับ 2 ชั้น: **UI** (`js/auth.js` + role-aware rendering) และ **Firestore Security Rules จริง** (`firestore.rules`)

| บทบาท | ทำได้ | ทำไม่ได้ |
| --- | --- | --- |
| **ADMIN** | จัดการชุดเกณฑ์ทั้งหมด (สร้าง/ตรวจสอบ/อนุมัติ/เปิดใช้งาน/ลบ), จัดการบทบาทผู้ใช้**คนอื่น** | เปลี่ยนบทบาทของ**ตัวเอง** (ล็อกด้วย UI) |
| **STAFF** | อ่านชุดเกณฑ์/กฎเกณฑ์ที่ `active` แล้วเพื่อศึกษา (อ่านอย่างเดียว) | เข้าหน้า `06`/`manage-users.html` ไม่ได้เลย, ปุ่มจัดการทั้งหมดถูกซ่อนในหน้า `05`/`07`, ไม่เห็นชุดที่ยัง `pending` |

**ยังไม่ implement** (บันทึกไว้เป็นความตั้งใจใน ACL.md เท่านั้น): STAFF "นำหลักสูตรเข้าตรวจสอบความสอดคล้อง" และ "เลือกใช้ชุดเกณฑ์" — เป็นคนละฟีเจอร์กับที่การบ้านนี้ทำ (นั่นคือฟีเจอร์ tqf2-consistency-check ของโปรเจกต์หลัก)

---

## 4. หน้าจอ ↔ script ↔ Flow

| หน้า | Script | อ่าน/เขียน | Role เข้าได้ |
| --- | --- | --- | --- |
| `login.html` / `signup.html` | `js/login.js` / `js/signup.js` | `users` | ไม่ต้อง login |
| `05-criteria-dashboard.html` | `js/dashboard.js` | อ่าน `criteriaSets`, ลบพ่วง cascade `rules`+`reviewLog`+`extractionLog` | ADMIN (ทุกสถานะ+ปุ่มสร้าง/ลบ), STAFF (เฉพาะ `active`, อ่านอย่างเดียว) |
| `06-create-criteria-set.html` | `js/create-criteria-set.js` | เขียน `criteriaSets` ใหม่ (`status: pending`), เรียก AI สกัด → เขียน `rules` หลายเอกสาร, เพิ่ม `extractionLog` | ADMIN ล้วน |
| `07-rule-review-approval.html` | `js/rule-review.js` | อ่าน `criteriaSets/{setId}` + `rules` ของชุดนั้น, เขียน `rules.status`/`.ruleText`/`.category`, `criteriaSets.status`, เพิ่ม `reviewLog`/`extractionLog` | ADMIN (จัดการเต็ม), STAFF (อ่าน badge สถานะอย่างเดียว, ปฏิเสธถ้าชุดยัง `pending`) |
| `manage-users.html` | `js/manage-users.js` | อ่าน `users` ทั้งหมด, เขียน `role` (ยกเว้นแถวตัวเอง) | ADMIN ล้วน |
| `seed.html` | `js/seed.js`+`js/data.js` | เขียนข้อมูลตัวอย่างทั้ง 4 collection | — (dev only, เขียนตรงไม่ผ่าน auth) |

**การส่ง id ข้ามหน้า**: `05 → 07` ส่ง `setId` ผ่าน **URL hash** (`#setId=...`) ไม่ใช่ query string — เพราะ local static server บางตัวตัด query string ทิ้งตอน redirect หน้าใหม่ที่ต้องรับ id ต้องใช้ pattern เดียวกัน

**Auth guard**: ทุก script ที่ query Firestore ต้อง `.then()` บน `window.CURMATE_AUTH_READY` (global Promise) ก่อนเสมอ ห้าม query ตอนไฟล์โหลด — หน้า ADMIN ล้วน (`06`, `manage-users`) เรียก `window.CURMATE_REQUIRE_ADMIN(currentUser)` เพิ่มอีกชั้น

### State machine: `criteriaSets.status`

```
pending ──[ADMIN กด "เปิดใช้งานชุดเกณฑ์นี้"]──> active
   ^                                              │
   └──────[ADMIN กด "แก้ไขชุดเกณฑ์นี้อีกครั้ง"]───┘
```

ปุ่ม "เปิดใช้งาน" จะปรากฏก็ต่อเมื่อกฎเกณฑ์ย่อยทุกข้อถูกตรวจแล้ว (approved หรือ rejected ครบ ไม่บังคับว่าต้อง approved ทั้งหมด) — **ไม่มีการคำนวณอัตโนมัติ** ต้องกดเองเสมอ

### State machine: `rules.status`

```
pending ──[อนุมัติ]──> approved ─┐
   ^                             │[แก้ไข ปุ่ม "แก้ไข" ต่อข้อ]
   │  ┌──────────────────────────┘
   └──┴[ไม่อนุมัติ]──> rejected
```

สลับ `approved ↔ rejected` ได้ผ่านปุ่ม "แก้ไข" **เฉพาะตอนที่ชุดเกณฑ์แม่ไม่ใช่ `active`** เท่านั้น — ถ้า active แล้วต้องกด "แก้ไขชุดเกณฑ์นี้อีกครั้ง" ที่ `criteriaSets` ก่อน

**การลบ**: ไม่มี soft-delete/undo — ลบ `criteriaSets` cascade ลบ `rules`+`reviewLog`+`extractionLog` ทั้งหมด (ทุกสถานะ), ลบ `rules` เดี่ยว cascade ลบ `reviewLog` (ล็อกตอนชุดแม่ `active` เหมือนปุ่มแก้ไข) — ทุกปุ่มลบมี `confirm()` ก่อนเสมอ

---

## 5. ฟีเจอร์ AI

### ระดับ 2 (agentic) — สกัดกฎเกณฑ์จากเอกสารจริง

- **อินพุต**: ไฟล์ `.md` ที่แปลงจาก PDF มาก่อนล่วงหน้า (**บังคับ**, ผู้ใช้แปลงเองนอกระบบ) — เลือกทางนี้แทน `pdf.js` เพราะ markdown สะอาดกว่า ประหยัด token, ลดอาการ AI หลอน
- **เอาต์พุต**: JSON array `{text, sourceRef}` ต่อกฎเกณฑ์ 1 ข้อ → เขียนเป็น `rules` ใหม่ (`status: pending`) พร้อม `order` (ลำดับ 0-based)
- **จุด**: หน้า 06 (สกัดครั้งแรก, พาไปหน้า 07 ทันที) และหน้า 07 ปุ่ม "สกัดใหม่ด้วย AI" (ลบเฉพาะ `rules` ที่ยัง `pending` แล้วสกัดซ้ำจาก `sourceMarkdownText` เดิม — ข้อที่ตัดสินใจแล้ว **ไม่ถูกแตะ**)
- **กฎสำคัญของ prompt**: `sourceRef` ต้องคัดลอกตรงจากเอกสาร ห้ามแต่งขึ้นเอง (ว่างได้ถ้าหาไม่เจอ), ยึด "เลขข้อย่อยที่ลึกที่สุด" เป็น 1 กฎเกณฑ์เสมอ (ไม่รวม/ไม่แตกเอง), `temperature: 0` เพื่อความเสถียร

### ระดับ 1 (single call) — จัดหมวดหมู่กฎเกณฑ์

- ต่อการ์ดกฎเกณฑ์ 1 ใบ (ADMIN ล้วน) ปุ่ม "ให้ AI ช่วยจัดหมวดหมู่" — เรียก AI ครั้งเดียวไม่ agentic ส่ง `ruleText` ข้อเดียว
- หมวดหมู่เป็น**ชุดปิดตายตัว 8 หมวด** (`CLASSIFY_CATEGORIES`) ไม่ให้ AI ตั้งชื่อเอง — ส่งชื่อชุดเกณฑ์+`degreeLevel` เป็นบริบทนำหน้าด้วยกัน AI สับสนระดับการศึกษา
- **ต้องกดยืนยันก่อนเขียน** `rules.category` จริง (ยกเลิกได้)

### แก้ไขคำที่ AI สกัดผิด

ปุ่ม "แก้ไขคำ" หน้า 07 แก้ได้เฉพาะ `ruleText` (ไม่ใช่ `sourceRef`) และ**เฉพาะตอนสถานะยัง `pending`** เท่านั้น

---

## 6. Security

**Firestore Security Rules** (`firestore.rules`) บังคับที่ระดับฐานข้อมูลจริง ไม่ใช่แค่ผ่าน UI — ต้อง publish เองที่ Firebase Console (ไม่มี Firebase CLI/`firebase.json` deploy อัตโนมัติในโฟลเดอร์นี้)

- ผู้ไม่ login: ทำอะไรกับทุก collection ไม่ได้เลย
- `users`: อ่านได้เฉพาะของตัวเองหรือ ADMIN อ่านของใครก็ได้; `create` บังคับ `role: "STAFF"` เสมอ (กัน payload โกงตอนสมัคร); แก้ role คนอื่นได้เฉพาะ ADMIN ห้ามแก้ของตัวเอง
- `criteriaSets`: ADMIN เต็มสิทธิ์; STAFF อ่านได้เฉพาะ `status == "active"`; สร้างได้เฉพาะ ADMIN และ `uploadedBy` ต้องตรงกับ uid ตัวเอง
- `rules`: ADMIN เต็มสิทธิ์; STAFF อ่านได้เฉพาะเมื่อชุดแม่ (`criteriaSets`) เป็น `active` แล้ว (เช็คด้วย `get()` ข้าม document)
- `reviewLog`/`extractionLog`: ADMIN ล้วน, บังคับ `adminId`/`triggeredBy` ต้องตรงผู้ login จริง
- **จุดที่ตั้งใจไม่ล็อกซ้ำ**: แก้ไข/ลบ `rules` ตอนชุดแม่ `active` ไม่ถูกบังคับซ้ำระดับ rules (ต่างจาก UI) เพราะจะทำให้ cascade delete พัง — ยังจำกัดแค่ ADMIN ทำได้อยู่ดี ไม่ใช่ช่องโหว่

**Secrets**: `js/firebase-config.js` มี Firebase Web API key ฝังไว้โดยตั้งใจ (ไม่ใช่ความลับ ปลอดภัยจริงที่ rules) commit ได้ปกติ — `js/ai-config.local.js` เก็บคีย์ OpenRouter ของหลักสูตร ถูก `.gitignore` ด้วย pattern `*.local.js` **ห้าม push ขึ้น GitHub เด็ดขาด**

**ผลข้างเคียง**: หลัง publish `firestore.rules` แล้ว `seed.html` จะใช้ไม่ได้ (เขียนตรงไม่ผ่าน auth/uid) ต้องสลับกลับ test rules ชั่วคราวถ้าต้อง seed ใหม่

---

## 7. ขอบเขตที่ยังไม่ทำ (out of scope ของการบ้านนี้)

- STAFF: "นำหลักสูตรเข้าตรวจสอบความสอดคล้อง", "เลือกใช้ชุดเกณฑ์" (คนละฟีเจอร์กับ criteria-knowledge-base)
- Soft-delete / ถังขยะ / undo การลบ
- Firebase Storage (เคยเพิ่มแล้วถอดออก — ใช้ลิงก์ Google Drive แทนสำหรับ PDF ต้นฉบับ เพราะ Storage ต้องแผน Blaze)
- Automated test ใดๆ (จะเพิ่มในสัปดาห์ที่ 9 นี้ด้วย Playwright)

---

## 8. ใช้เอกสารนี้ต่ออย่างไร (สัปดาห์ที่ 9)

สเปกนี้เป็นฐานสำหรับ 3 งานที่เหลือของสัปดาห์ 9:

1. **แบ่งงาน AI agent 3 ตัว** (`.claude/agents/`, โมเดลต่างกัน คนละไฟล์) — อ้างอิงหมวด 4/5/6 ด้านบนเพื่อแบ่งขอบเขตความรับผิดชอบ
2. **ชุดทดสอบ Playwright** อย่างน้อย 5 ตัว — เส้นทางหลัก (หมวด 1/4), เปลี่ยนสถานะ (หมวด 4 state machine), validation, authentication + data isolation (หมวด 3/6) รันโดย agent tester โมเดล Sonnet
3. **อธิบายระบบตัวเอง** — ใช้เนื้อหาหมวด 1-7 ของเอกสารนี้ตอบได้ครบ
