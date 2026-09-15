# 01 - Prototypes

เก็บ **ต้นแบบหน้าตาของระบบ (UI/UX Prototype)** เช่น

- Wireframe / mockup ของแต่ละหน้าจอ
- User flow และ navigation flow
- Design system เบื้องต้น เช่น สี ฟอนต์ คอมโพเนนต์หลัก

ใช้สำหรับสื่อสารและตกลงหน้าตาของระบบก่อนลงมือพัฒนาจริง โดยอ้างอิงความต้องการจาก [[../../01-requirements/01-spec/index|01-spec]] และส่งต่อรายละเอียดเชิงระบบให้ [[../02-technical/index|02-technical]]

## Design System

- [[DESIGN|DESIGN.md]] — brand identity, design tokens (สี/ฟอนต์/spacing), UI components และ UX guidelines ที่ mockup/user journey ทั้งหมดในโฟลเดอร์นี้ต้องอ้างอิง

## สารบัญหน้าจอปัจจุบันทั้งหมด

- [hub.html](hub.html) — **(เพิ่ม 2026-09-15)** เครื่องมือช่วยรีวิว รวมลิงก์ไปยังหน้าจอ prototype ที่ "ใช้งานอยู่จริง" ของทุกฟีเจอร์ ณ ปัจจุบัน จัดกลุ่มตามบทบาทผู้ใช้ในหน้าเดียว ไม่ต้องไล่เปิดทีละโฟลเดอร์เวอร์ชันเอง (ไม่ใช่ Markdown จึงใช้ลิงก์ปกติ ไม่ใช่ wikilink — เปิดตรงในเบราว์เซอร์ได้เลย) **ไม่ใช่หน้าจอของฟีเจอร์ใดฟีเจอร์หนึ่ง ไม่มี manifest/AC ผูกอยู่ ไม่ใช่ตัวแทนของ navigation ในระบบจริง** (งานออกแบบ navigation จริงเป็นหน้าที่ของ [[../02-technical/index|02-technical]]) เมื่อมี prototype เวอร์ชันใหม่มาแทนที่ฟีเจอร์ใดเพิ่มเติม ต้องอัปเดตรายการในไฟล์นี้ตามไปด้วย (ย้ายไปช่อง "เดิม" แทนการลบทิ้ง)

## User Journey

- [[20260823-01-user-journey-course-coordinator-upload|ผู้จัดทำหลักสูตร อัปโหลดและตรวจสอบเอกสาร มคอ.2]]
- [[20260823-02-user-journey-course-coordinator-chatbot-advisory|ผู้จัดทำหลักสูตร ขอคำแนะนำระหว่างร่างหลักสูตรผ่านแชทบอท]]
- [[20260823-03-user-journey-admin-manage-criteria-knowledge-base|แอดมิน จัดการฐานความรู้เกณฑ์มาตรฐานหลักสูตร]]
- [[20260904-04-user-journey-admin-manage-executive-courses|แอดมิน จัดการรายชื่อหลักสูตรและผูกเล่ม มคอ.2 ต่อสำนักวิชา]] **(แก้ label ให้ตรงกับชื่อ journey ที่ปรับปรุงแล้ว 2026-09-15)**
- [[20260904-05-user-journey-executive-view-dashboard|ผู้บริหาร ดูแดชบอร์ดวิเคราะห์ข้อมูลหลักสูตร]]
- [[20260912-06-user-journey-signup-login|ผู้ใช้สมัครสมาชิกและเข้าสู่ระบบ]]
- [[20260912-07-user-journey-admin-manage-user-roles|แอดมิน จัดการบทบาทผู้ใช้]]
- [[20260913-08-user-journey-admin-manage-skill-framework|แอดมิน จัดการชุดกรอบทักษะอ้างอิง]]

## Prototype

- [[20260823-prototype-v1/index|Prototype v1 — 2026-08-23]]
- [[20260904-prototype-v2/index|Prototype v2 — 2026-09-04]]
- [[20260915-prototype-v3/index|Prototype v3 — 2026-09-15]]
