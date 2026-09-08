# Curmate MVP v2 — การบ้าน Module 2 (Database) ต่อยอดสัปดาห์ที่ 7

โฟลเดอร์นี้เป็นแบบฝึกหัดของคอร์ส ไม่ใช่แอปพลิเคชัน Curmate จริง — ดูรายละเอียดขอบเขตและสิ่งที่ต่างจาก `homework/curmate-mvp` เดิมใน [SCOPE.md](./SCOPE.md)

## URL ออนไลน์

https://cur-mate.web.app/ (deploy ผ่าน Firebase Hosting — เข้า root แล้ว redirect ไปหน้า `login.html` อัตโนมัติ)

จุดต่างหลักจากโฟลเดอร์เดิม: หน้าตา (HTML) นำมาจาก Prototype v1 จริงของ Curmate
(`docs/02-design/01-prototypes/20260823-prototype-v1/`) แล้วต่อ Firestore จริงแทนข้อมูลจำลอง
แทนที่จะพิมพ์หน้าตาขึ้นมาใหม่ทุกครั้ง

## วิธีเปิดดู

1. เปิดโฟลเดอร์นี้ด้วย local web server (เช่น `npx serve .`)
2. ใช้ Firebase project เดิม (`cur-mate`) ได้เลย — `js/firebase-config.js` ตั้งค่าไว้แล้ว (ต้องเปิด Email/Password provider ใน Firebase Console → Authentication → Sign-in method ไว้ก่อนด้วย)
3. เปิด `seed.html` แล้วกดปุ่มใส่ข้อมูลตัวอย่าง (กด seed ซ้ำได้อย่างปลอดภัย — เขียนทับด้วย id เดิม)
4. เปิด `signup.html` เพื่อสมัครสมาชิก (ไม่ต้องเลือกบทบาท — ทุกบัญชีใหม่ได้ role `STAFF` เสมอ) แล้ว **ตั้งบัญชีแรกให้เป็น `ADMIN` เองผ่าน Firebase Console** (Firestore Database → collection `users` → doc ของ uid ตัวเอง → แก้ field `role` เป็น `"ADMIN"`) จากนั้นเปิด `login.html` เพื่อเข้าสู่ระบบ
5. เข้าสู่ระบบสำเร็จจะพาไป `05-criteria-dashboard.html` เพื่อดูรายการชุดเกณฑ์ที่อ่านจาก Firestore จริง
   - **ADMIN**: คลิกชุดเกณฑ์สถานะ "รอตรวจสอบ" เพื่อไปหน้า `07-rule-review-approval.html` ตรวจสอบ/อนุมัติกฎเกณฑ์, กด "สร้างชุดเกณฑ์ใหม่" เพื่อไปหน้า `06-create-criteria-set.html`, กด "จัดการผู้ใช้" เพื่อไปหน้า `manage-users.html` เลื่อน/ลดบทบาทผู้ใช้คนอื่น (ยกเว้นตัวเอง)
   - **STAFF**: เห็นเฉพาะชุดเกณฑ์ที่ "เปิดใช้งาน" แล้ว คลิกดูกฎเกณฑ์ในหน้า 07 ได้แบบอ่านอย่างเดียว (ไม่มีปุ่มจัดการใดๆ) เข้าหน้า 06/manage-users.html ไม่ได้
   - ทุกหน้าต้อง login ก่อนเสมอ (เด้งไป `login.html` ถ้ายัง) — ดูสิทธิ์แบบเต็มใน [ACL.md](./ACL.md)

## โครงสร้างข้อมูล (เหมือนเดิมทุกประการ)

```
📁 users
📁 criteriaSets
📁 rules
   └ 📁 reviewLog
```

ดูรายละเอียด field แต่ละ collection และสิ่งที่ยังจำลองอยู่ใน [SCOPE.md](./SCOPE.md)

## ความคืบหน้าสัปดาห์ที่ 7

เพิ่ม Firebase Authentication (Email/Password) แล้ว — สมัครสมาชิก/เข้าสู่ระบบ/ออกจากระบบ, auth guard เด้งไป `login.html` ถ้ายังไม่ login, และบันทึก uid ผู้ login จริงตอนสร้างชุดเกณฑ์/อนุมัติกฎเกณฑ์ (แทนค่าฮาร์ดโค้ดเดิม) พร้อมระบบจัดการบทบาท 2 role (`ADMIN`/`STAFF`) รวมหน้าใหม่ `manage-users.html` ให้ ADMIN เปลี่ยนบทบาทผู้ใช้คนอื่นได้ ดูสิทธิ์แบบเต็มใน [ACL.md](./ACL.md) และรายละเอียดที่ [SCOPE.md](./SCOPE.md) หัวข้อ "ระบบ login"/"ระบบจัดการบทบาท"

## ความคืบหน้า 2026-09-08: Firestore Security Rules

เพิ่ม [firestore.rules](./firestore.rules) บังคับสิทธิ์ ADMIN/STAFF จริงที่ระดับฐานข้อมูล (ตรงตาม ACL.md ทุกจุด) แทน open test rules เดิม — ต้องก็อปเนื้อหาไปวางเองที่ Firebase Console → Firestore Database → Rules (ไม่มี Firebase CLI ตั้งค่าไว้ในโฟลเดอร์นี้) รายละเอียดครบที่ [SCOPE.md](./SCOPE.md) หัวข้อ "Firestore Security Rules" **สำคัญ**: หลัง publish แล้ว `seed.html` จะใช้ไม่ได้อีก (ต้องสลับกลับ test rules ชั่วคราวถ้าต้อง seed ใหม่)
