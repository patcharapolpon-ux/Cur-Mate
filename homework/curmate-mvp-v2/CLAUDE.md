# CLAUDE.md — homework/curmate-mvp-v2

ไฟล์นี้ให้บริบทเฉพาะโฟลเดอร์นี้แก่ Claude Code เวลาเปิดทำงานตรงๆ ในโฟลเดอร์การบ้าน (ไม่ผ่าน root ของ vault)

## นี่คืออะไร

แบบฝึกหัดการบ้าน Module 2 (Database) ต่อยอดจากสัปดาห์ที่ 6 — **ไม่ใช่แอปพลิเคชัน Curmate จริง** หน้าตา (HTML) นำมาจาก Prototype v1 จริงของ Curmate แล้วต่อ Firestore จริงแทนข้อมูลจำลอง รายละเอียดเต็มดูที่ [README.md](./README.md) และ [SCOPE.md](./SCOPE.md)

Stack: vanilla JS + Firebase JS SDK v10.13.0 (compat mode, `firebase.initializeApp` / `firebase.firestore()`) — ไม่มี build step, เปิดด้วย local static server (เช่น `npx serve .`)

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

## ข้อห้าม/ข้อควรระวัง

- **ห้ามใส่ secret จริงลงไฟล์ที่จะ push** — service account JSON, admin SDK credential, หรือ API key/token ส่วนตัวอื่นใด ห้ามฝังในโค้ดของโฟลเดอร์นี้เด็ดขาด
  - ข้อยกเว้นที่ตั้งใจ: `js/firebase-config.js` มี Firebase **Web API key** ฝังอยู่โดยตั้งใจ — ค่านี้ไม่ใช่ความลับ (ออกแบบมาให้เปิดเผยได้ ปลอดภัยจริงอยู่ที่ Firestore Security Rules ไม่ใช่ตัว key) จึง commit ได้ตามปกติ ไม่ต้องแจ้งเตือน
- Firestore project (`cur-mate`) อยู่โหมด test rules (อนุญาต read/write แบบเปิด) หมดอายุ 2026-10-04 — ถ้าเกินวันนี้แล้ว seed/เขียนข้อมูลจะ fail ให้แจ้งผู้ใช้ไปตั้ง rules ใหม่ใน Firebase Console แทนการพยายามแก้ไขปัญหาด้วยวิธีอื่น
