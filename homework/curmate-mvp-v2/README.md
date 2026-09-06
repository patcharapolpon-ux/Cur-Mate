# Curmate MVP v2 — การบ้าน Module 2 (Database) ต่อยอดสัปดาห์ที่ 7

โฟลเดอร์นี้เป็นแบบฝึกหัดของคอร์ส ไม่ใช่แอปพลิเคชัน Curmate จริง — ดูรายละเอียดขอบเขตและสิ่งที่ต่างจาก `homework/curmate-mvp` เดิมใน [SCOPE.md](./SCOPE.md)

จุดต่างหลักจากโฟลเดอร์เดิม: หน้าตา (HTML) นำมาจาก Prototype v1 จริงของ Curmate
(`docs/02-design/01-prototypes/20260823-prototype-v1/`) แล้วต่อ Firestore จริงแทนข้อมูลจำลอง
แทนที่จะพิมพ์หน้าตาขึ้นมาใหม่ทุกครั้ง

## วิธีเปิดดู

1. เปิดโฟลเดอร์นี้ด้วย local web server (เช่น `npx serve .`)
2. ใช้ Firebase project เดิม (`cur-mate`) ได้เลย — `js/firebase-config.js` ตั้งค่าไว้แล้ว
3. เปิด `seed.html` แล้วกดปุ่มใส่ข้อมูลตัวอย่าง (กด seed ซ้ำได้อย่างปลอดภัย — เขียนทับด้วย id เดิม)
4. เปิด `05-criteria-dashboard.html` เพื่อดูรายการชุดเกณฑ์ที่อ่านจาก Firestore จริง
   - คลิกชุดเกณฑ์สถานะ "รอตรวจสอบ" เพื่อไปหน้า `07-rule-review-approval.html` ตรวจสอบ/อนุมัติกฎเกณฑ์
   - กด "สร้างชุดเกณฑ์ใหม่" เพื่อไปหน้า `06-create-criteria-set.html` บันทึกชุดเกณฑ์ใหม่ลง Firestore จริง

## โครงสร้างข้อมูล (เหมือนเดิมทุกประการ)

```
📁 users
📁 criteriaSets
📁 rules
   └ 📁 reviewLog
```

ดูรายละเอียด field แต่ละ collection และสิ่งที่ยังจำลองอยู่ใน [SCOPE.md](./SCOPE.md)

## แผนต่อไป (สัปดาห์ที่ 7)

โฟลเดอร์นี้จะถูกใช้ต่อยอดสำหรับการบ้านสัปดาห์ที่ 7 (เพิ่ม CRUD ให้ครบ + login) — ผู้เรียนจะทำต่อเอง
