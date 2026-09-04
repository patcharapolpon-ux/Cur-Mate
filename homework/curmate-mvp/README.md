# Curmate MVP — การบ้าน Module 2 (Database)

โฟลเดอร์นี้เป็นแบบฝึกหัดของคอร์ส ไม่ใช่แอปพลิเคชัน Curmate จริง — ดูรายละเอียดขอบเขตที่เลือกทำใน [SCOPE.md](./SCOPE.md)

## วิธีเปิดดู

1. เปิดโฟลเดอร์นี้ด้วย local web server (เช่น `npx serve .`)
2. สร้างโปรเจกต์ Firebase ของตัวเอง เปิด Firestore แบบ Test mode แล้วคัดลอก `firebaseConfig` มาใส่ใน `js/firebase-config.js`
3. เปิด `seed.html` แล้วกดปุ่มใส่ข้อมูลตัวอย่าง
4. เปิด `index.html` หรือ `rules-list.html` เพื่อดูรายการกฎเกณฑ์ที่อ่านจาก Firestore จริง

## โครงสร้างข้อมูล

```
📁 users
📁 criteriaSets
📁 rules
   └ 📁 reviewLog
```

ดูรายละเอียด field แต่ละ collection ใน [SCOPE.md](./SCOPE.md)
