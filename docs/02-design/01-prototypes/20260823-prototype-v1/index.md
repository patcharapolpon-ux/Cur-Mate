# Prototype v1 — 2026-08-23

## สโคป

ครอบคลุม user journey "[[../20260823-01-user-journey-course-coordinator-upload|ผู้จัดทำหลักสูตร อัปโหลดและตรวจสอบเอกสาร มคอ.2]]" ทั้ง flow ตั้งแต่อัปโหลดไฟล์ มคอ.2 → เลือกชุดเกณฑ์มาตรฐาน → ตรวจสอบความสอดคล้อง (ภายในเล่ม + ข้ามเล่ม) → ดูรายงานผลตรวจสอบ ตรงกับฟีเจอร์ใน [[../../../01-requirements/02-plan/feature-list|feature-list]] ดังนี้:

- 01. อัปโหลดและจัดการไฟล์ มคอ.2 (`Must have`)
- 02. เลือกชุดเกณฑ์มาตรฐานก่อนเริ่มตรวจสอบ/สนทนา (`Must have`)
- 03. ตรวจสอบความสอดคล้องภายในเล่มเดียวกัน (`Must have`)
- 04. ตรวจสอบความสอดคล้อง/ซ้ำซ้อนข้ามเล่มหลักสูตร (cross-document) (`Should have`)
- 05. รายงานผลตรวจสอบ (`Must have`)

Requirement ต้นทาง: [[../../../01-requirements/01-spec/20260812-01-tqf2-consistency-check|ระบบตรวจสอบความสอดคล้องของเอกสารรายละเอียดหลักสูตร (มคอ.2)]]

เวอร์ชันนี้เป็น prototype แบบ **interactive จิ้มเล่นได้จริง** — ทุกหน้ามี vanilla JavaScript inline ให้คลิก/โต้ตอบได้จริง (จำลองอัปโหลด, toggle เลือกชุดเกณฑ์, จำลองสถานะการตรวจสอบ, กรอง/ขยายรายการรายงานผล) และเชื่อมโยงกันด้วยลิงก์ระหว่างไฟล์ .html ให้เดินหน้า-ถอยหลังได้จริงในเบราว์เซอร์ ทุกหน้ามี stepper bar เดียวกัน 4 ขั้น (อัปโหลด → เลือกชุดเกณฑ์ → ตรวจสอบ → รายงานผล)

อ้างอิง Design System: [[../DESIGN|DESIGN.md]]

## หน้าจอ (Screens)

| ลำดับ | หน้าจอ | ไฟล์ | อ้างอิง |
| --- | --- | --- | --- |
| 01 | อัปโหลดไฟล์ มคอ.2 | [[01-upload-mco2.html\|01-upload-mco2.html]] | [[../../../01-requirements/02-plan/feature-list\|feature-list]] (01. อัปโหลดและจัดการไฟล์ มคอ.2) · [[../20260823-01-user-journey-course-coordinator-upload\|user journey อัปโหลดและตรวจสอบเอกสาร มคอ.2]] · [[../../../01-requirements/01-spec/20260812-01-tqf2-consistency-check\|tqf2-consistency-check]] FR ข้อ 1 |
| 02 | เลือกชุดเกณฑ์มาตรฐาน | [[02-select-criteria.html\|02-select-criteria.html]] | [[../../../01-requirements/02-plan/feature-list\|feature-list]] (02. เลือกชุดเกณฑ์มาตรฐานก่อนเริ่มตรวจสอบ/สนทนา) · [[../20260823-01-user-journey-course-coordinator-upload\|user journey อัปโหลดและตรวจสอบเอกสาร มคอ.2]] · [[../../../01-requirements/01-spec/20260812-01-tqf2-consistency-check\|tqf2-consistency-check]] FR ข้อ 3 |
| 03 | กำลังตรวจสอบ | [[03-processing.html\|03-processing.html]] | [[../../../01-requirements/02-plan/feature-list\|feature-list]] (03. ตรวจสอบความสอดคล้องภายในเล่มเดียวกัน, 04. ตรวจสอบความสอดคล้อง/ซ้ำซ้อนข้ามเล่มหลักสูตร) · [[../20260823-01-user-journey-course-coordinator-upload\|user journey อัปโหลดและตรวจสอบเอกสาร มคอ.2]] · [[../../../01-requirements/01-spec/20260812-01-tqf2-consistency-check\|tqf2-consistency-check]] FR ข้อ 2 และ FR ข้อ 4 |
| 04 | รายงานผลตรวจสอบ | [[04-report.html\|04-report.html]] | [[../../../01-requirements/02-plan/feature-list\|feature-list]] (05. รายงานผลตรวจสอบ) · [[../20260823-01-user-journey-course-coordinator-upload\|user journey อัปโหลดและตรวจสอบเอกสาร มคอ.2]] · [[../../../01-requirements/01-spec/20260812-01-tqf2-consistency-check\|tqf2-consistency-check]] FR ข้อ 5 |

## สมมติฐาน / คำถามที่เปิดไว้

- ชื่อไฟล์ตัวอย่าง มคอ.2, ชื่อชุดเกณฑ์ตัวอย่าง 4 ชุด, และรายการจุดไม่สอดคล้อง 4 ตัวอย่างในหน้ารายงานผล เป็นข้อมูลจำลอง (mock data) ที่คิดขึ้นเพื่อสาธิต UI เท่านั้น ไม่ใช่ข้อมูลจริง
- หน้า "กำลังตรวจสอบ" จำลองการเปลี่ยนสถานะทันทีต่อการคลิกปุ่ม "จำลองตรวจสอบ" โดยไม่มี delay/animation จริง เนื่องจากยังไม่มีข้อมูล performance จริงของระบบ (ตามคำถามเปิดใน [[../../../01-requirements/01-spec/20260812-01-tqf2-consistency-check|tqf2-consistency-check]] หัวข้อ NFR)
- ยังไม่ครอบคลุม journey อื่นที่มีอยู่แล้ว ([[../20260823-02-user-journey-course-coordinator-chatbot-advisory|แชทบอทให้คำแนะนำ]], [[../20260823-03-user-journey-admin-manage-criteria-knowledge-base|จัดการฐานความรู้เกณฑ์มาตรฐานของแอดมิน]]) — เป็นสโคปที่เปิดไว้สำหรับ prototype เวอร์ชันถัดไป

---
[[../index|01-prototypes]] · [[../DESIGN|DESIGN.md]] · [[../../../01-requirements/02-plan/feature-list|feature-list]]
