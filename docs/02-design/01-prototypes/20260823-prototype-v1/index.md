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

เพิ่มเติม (2026-08-24): ขยายสโคปให้ครอบคลุมฝั่ง **แอดมิน** ตาม journey "[[../20260823-03-user-journey-admin-manage-criteria-knowledge-base|แอดมิน จัดการฐานความรู้เกณฑ์มาตรฐานหลักสูตร]]" เฉพาะฟีเจอร์ 06 และ 07 (ไม่รวมฟีเจอร์ 08 เนื่องจากเป็นพฤติกรรมระบบที่ integrate อยู่ในหน้า 03-processing.html/04-report.html เดิมแล้ว ไม่ใช่หน้าจอฝั่งแอดมินใหม่):

- 06. จัดการฐานความรู้เกณฑ์มาตรฐานหลักสูตร (สร้างชุดเกณฑ์ + อัปโหลดเอกสาร) (`Must have`)
- 07. ตรวจสอบ แก้ไข และอนุมัติกฎเกณฑ์ที่ AI สกัดมา (`Must have`)

Requirement ต้นทางของส่วนที่เพิ่ม: [[../../../01-requirements/01-spec/20260823-02-criteria-knowledge-base|ระบบจัดการฐานความรู้เกณฑ์มาตรฐานหลักสูตร (Knowledge Base) สำหรับแอดมิน]]

หน้าจอฝั่งแอดมิน (05-07) ใช้ breadcrumb + admin zone badge แทน stepper 4 ขั้นของฝั่งผู้ใช้งานทั่วไป เพื่อสื่อว่าเป็นคนละบทบาท คนละ flow กัน

อ้างอิง Design System: [[../DESIGN|DESIGN.md]]

## หน้าจอ (Screens)

| ลำดับ | หน้าจอ | ไฟล์ | อ้างอิง |
| --- | --- | --- | --- |
| 01 | อัปโหลดไฟล์ มคอ.2 | [[01-upload-mco2.html\|01-upload-mco2.html]] | [[../../../01-requirements/02-plan/feature-list\|feature-list]] (01. อัปโหลดและจัดการไฟล์ มคอ.2) · [[../20260823-01-user-journey-course-coordinator-upload\|user journey อัปโหลดและตรวจสอบเอกสาร มคอ.2]] · [[../../../01-requirements/01-spec/20260812-01-tqf2-consistency-check\|tqf2-consistency-check]] FR ข้อ 1 |
| 02 | เลือกชุดเกณฑ์มาตรฐาน | [[02-select-criteria.html\|02-select-criteria.html]] | [[../../../01-requirements/02-plan/feature-list\|feature-list]] (02. เลือกชุดเกณฑ์มาตรฐานก่อนเริ่มตรวจสอบ/สนทนา) · [[../20260823-01-user-journey-course-coordinator-upload\|user journey อัปโหลดและตรวจสอบเอกสาร มคอ.2]] · [[../../../01-requirements/01-spec/20260812-01-tqf2-consistency-check\|tqf2-consistency-check]] FR ข้อ 3 |
| 03 | กำลังตรวจสอบ | [[03-processing.html\|03-processing.html]] | [[../../../01-requirements/02-plan/feature-list\|feature-list]] (03. ตรวจสอบความสอดคล้องภายในเล่มเดียวกัน, 04. ตรวจสอบความสอดคล้อง/ซ้ำซ้อนข้ามเล่มหลักสูตร, 08. ตรวจสอบเนื้อหาจริงของหลักสูตรเทียบกับเกณฑ์มาตรฐาน) · [[../20260823-01-user-journey-course-coordinator-upload\|user journey อัปโหลดและตรวจสอบเอกสาร มคอ.2]] · [[../../../01-requirements/01-spec/20260812-01-tqf2-consistency-check\|tqf2-consistency-check]] FR ข้อ 2 และ FR ข้อ 4 · [[../../../01-requirements/01-spec/20260823-02-criteria-knowledge-base\|criteria-knowledge-base]] FR ข้อ 5 |
| 04 | รายงานผลตรวจสอบ | [[04-report.html\|04-report.html]] | [[../../../01-requirements/02-plan/feature-list\|feature-list]] (05. รายงานผลตรวจสอบ, 08. ตรวจสอบเนื้อหาจริงของหลักสูตรเทียบกับเกณฑ์มาตรฐาน) · [[../20260823-01-user-journey-course-coordinator-upload\|user journey อัปโหลดและตรวจสอบเอกสาร มคอ.2]] · [[../../../01-requirements/01-spec/20260812-01-tqf2-consistency-check\|tqf2-consistency-check]] FR ข้อ 5 · [[../../../01-requirements/01-spec/20260823-02-criteria-knowledge-base\|criteria-knowledge-base]] FR ข้อ 5 |
| 05 | รายการชุดเกณฑ์มาตรฐาน (แอดมิน) | [[05-criteria-dashboard.html\|05-criteria-dashboard.html]] | [[../../../01-requirements/02-plan/feature-list\|feature-list]] (06. จัดการฐานความรู้เกณฑ์มาตรฐานหลักสูตร) · [[../20260823-03-user-journey-admin-manage-criteria-knowledge-base\|user journey แอดมิน จัดการฐานความรู้เกณฑ์มาตรฐานหลักสูตร]] · [[../../../01-requirements/01-spec/20260823-02-criteria-knowledge-base\|criteria-knowledge-base]] FR ข้อ 1 และ FR ข้อ 2 |
| 06 | สร้างชุดเกณฑ์ใหม่และอัปโหลดเอกสาร (แอดมิน) | [[06-create-criteria-set.html\|06-create-criteria-set.html]] | [[../../../01-requirements/02-plan/feature-list\|feature-list]] (06. จัดการฐานความรู้เกณฑ์มาตรฐานหลักสูตร) · [[../20260823-03-user-journey-admin-manage-criteria-knowledge-base\|user journey แอดมิน จัดการฐานความรู้เกณฑ์มาตรฐานหลักสูตร]] · [[../../../01-requirements/01-spec/20260823-02-criteria-knowledge-base\|criteria-knowledge-base]] FR ข้อ 2 และ FR ข้อ 3 |
| 07 | ตรวจสอบและอนุมัติกฎเกณฑ์ (แอดมิน) | [[07-rule-review-approval.html\|07-rule-review-approval.html]] | [[../../../01-requirements/02-plan/feature-list\|feature-list]] (07. ตรวจสอบ แก้ไข และอนุมัติกฎเกณฑ์ที่ AI สกัดมา) · [[../20260823-03-user-journey-admin-manage-criteria-knowledge-base\|user journey แอดมิน จัดการฐานความรู้เกณฑ์มาตรฐานหลักสูตร]] · [[../../../01-requirements/01-spec/20260823-02-criteria-knowledge-base\|criteria-knowledge-base]] FR ข้อ 4 |

## สมมติฐาน / คำถามที่เปิดไว้

- ชื่อไฟล์ตัวอย่าง มคอ.2, ชื่อชุดเกณฑ์ตัวอย่าง 4 ชุด, และรายการจุดไม่สอดคล้อง 4 ตัวอย่างในหน้ารายงานผล เป็นข้อมูลจำลอง (mock data) ที่คิดขึ้นเพื่อสาธิต UI เท่านั้น ไม่ใช่ข้อมูลจริง
- หน้า "กำลังตรวจสอบ" จำลองการเปลี่ยนสถานะทันทีต่อการคลิกปุ่ม "จำลองตรวจสอบ" โดยไม่มี delay/animation จริง เนื่องจากยังไม่มีข้อมูล performance จริงของระบบ (ตามคำถามเปิดใน [[../../../01-requirements/01-spec/20260812-01-tqf2-consistency-check|tqf2-consistency-check]] หัวข้อ NFR)
- ครอบคลุม journey "[[../20260823-03-user-journey-admin-manage-criteria-knowledge-base|จัดการฐานความรู้เกณฑ์มาตรฐานของแอดมิน]]" แล้วในหน้า 05-07 (เพิ่มเมื่อ 2026-08-24) เฉพาะฟีเจอร์ 06 และ 07 — ยังไม่ครอบคลุม journey "[[../20260823-02-user-journey-course-coordinator-chatbot-advisory|แชทบอทให้คำแนะนำ]]" เป็นสโคปที่เปิดไว้สำหรับ prototype เวอร์ชันถัดไป
- รายชื่อชุดเกณฑ์ตัวอย่างในหน้า 05 (dashboard), ชื่อกฎเกณฑ์ตัวอย่าง 5 ข้อในหน้า 07, และชื่อเอกสารตัวอย่างที่อัปโหลดในหน้า 06 เป็นข้อมูลจำลอง (mock data) เพื่อสาธิต UI เท่านั้น ไม่ใช่ข้อมูลจริง
- ปุ่ม "ปฏิเสธ (Reject)" ในหน้า 07 แสดงเป็นตัวอย่างต้นแบบ (คลิกแล้วแสดงข้อความอธิบายเท่านั้น ไม่มีผลลัพธ์จริง) เนื่องจาก spec ต้นทาง [[../../../01-requirements/01-spec/20260823-02-criteria-knowledge-base|criteria-knowledge-base]] ยังเปิดคำถามไว้ว่าการปฏิเสธกฎเกณฑ์ควรมีผลลัพธ์อย่างไร — รอการตัดสินใจเพิ่มเติมก่อนออกแบบ interaction จริง
- หน้า 06 จำลองการ "สกัดกฎเกณฑ์ด้วย AI" ด้วย toast + delay สั้น (700ms) ก่อนพาไปหน้า 07 เพื่อสื่อสารว่าเป็นกระบวนการที่ต้องใช้เวลาจริงในระบบจริง โดยไม่ผูกกับตัวเลข performance จริงใดๆ (ยังไม่มีข้อมูล NFR ของเวลาสกัดกฎเกณฑ์)

---
[[../index|01-prototypes]] · [[../DESIGN|DESIGN.md]] · [[../../../01-requirements/02-plan/feature-list|feature-list]]
