# Prototype v3 — 2026-09-15

## สโคป

ครอบคลุมฟีเจอร์ 10, 11, 14 ใน [[../../../01-requirements/02-plan/feature-list|feature-list]] ตาม spec [[../../../01-requirements/01-spec/20260904-04-executive-curriculum-dashboard|ระบบแดชบอร์ดวิเคราะห์ข้อมูลหลักสูตรสำหรับผู้บริหาร (Executive Curriculum Analytics Dashboard)]] ฉบับปรับปรุง 2026-09-13:

- 10. แอดมิน เพิ่ม/จัดการรายชื่อหลักสูตรและผูกเล่ม มคอ.2 ต่อสำนักวิชา (`Should have`)
- 11. ผู้บริหาร ดูแดชบอร์ดวิเคราะห์ข้อมูลหลักสูตรตามสำนักวิชา/หลักสูตร (ขยายขอบเขต 2026-09-13 — รวมวิเคราะห์สุขภาพหลักสูตร 4 มิติ) (`Should have`)
- 14. แอดมิน จัดการชุดกรอบทักษะอ้างอิง (ใหม่ 2026-09-13) (`Should have`)

### เหตุผลที่แยกเป็นเวอร์ชันใหม่แทนการแก้ไข [[../20260904-prototype-v2/index|Prototype v2]]

รอบนี้เปลี่ยน flow ของทั้ง 2 ฟีเจอร์เดิม (10, 11) หลายจุดพร้อมกัน ไม่ใช่การปรับแก้เล็กน้อย: ฟีเจอร์ 10 เปลี่ยนจากการอัปโหลดไฟล์แยกชุดเป็นการผูกเล่ม มคอ.2 ที่ผ่านการตรวจสอบความสอดคล้องแล้ว (FR ข้อ 5 ปรับปรุง + FR ข้อ 5.1 ใหม่), ฟีเจอร์ 11 เพิ่มหน้าสรุประดับสำนักวิชา (FR ข้อ 10), แทนที่สถิติเชิงปริมาณด้วยการวิเคราะห์สุขภาพหลักสูตร 4 มิติเป็นเนื้อหาหลัก (FR ข้อ 8-9), เพิ่มผลตรวจสอบความสอดคล้องคู่กัน (FR ข้อ 5), ปุ่ม export PDF (FR ข้อ 11) และกฎความน่าเชื่อถือของตัวเลข (FR ข้อ 12) — และฟีเจอร์ 14 เป็นฟีเจอร์ใหม่ทั้งหมด นอกจากนี้ไฟล์ของ v2 (`03-executive-select-school.html` ถึง `05-executive-dashboard-stats.html`, `02-admin-add-course-modal.html`) ถูกอ้างอิงไว้แล้วในเอกสาร `acceptance-criteria.md` (AC-10-01/02, AC-11-01/02/03) และ `test-cases/10-*.md`, `test-cases/11-*.md` ในฐานะ "หน้าจอเดิมที่ยังไม่ปรับปรุง" — การแก้ไข v2 ตรงๆ จะทำให้ประวัติการตัดสินใจที่อ้างอิงไว้ในเอกสารเหล่านั้นหายไป จึงสร้างโฟลเดอร์ใหม่ v3 แทน และคง v1/v2 ไว้ครบตามธรรมเนียมของ vault (ห้ามลบ/ย้ายเวอร์ชันเก่า)

อ้างอิง Design System: [[../DESIGN|DESIGN.md]] (ใช้ design tokens เดิมทั้งหมด ไม่มีการแก้ไข DESIGN.md ในรอบนี้)

User journey ที่อ้างอิง:

- [[../20260904-04-user-journey-admin-manage-executive-courses|แอดมิน จัดการรายชื่อหลักสูตรและผูกเล่ม มคอ.2 ต่อสำนักวิชา]]
- [[../20260904-05-user-journey-executive-view-dashboard|ผู้บริหาร ดูแดชบอร์ดวิเคราะห์ข้อมูลหลักสูตร]]
- [[../20260913-08-user-journey-admin-manage-skill-framework|แอดมิน จัดการชุดกรอบทักษะอ้างอิง]]

เวอร์ชันนี้เป็น prototype แบบ **interactive จิ้มเล่นได้จริง** เช่นเดียวกับ v1/v2 — ทุกหน้ามี vanilla JavaScript inline ให้คลิก/โต้ตอบได้จริง และเชื่อมโยงกันด้วยลิงก์ระหว่างไฟล์ `.html` ให้เดินหน้า-ถอยหลังได้จริงในเบราว์เซอร์ ทุกหน้าจอเป็นหน้าจอใหม่ทั้งหมด ไม่มีการแก้ไขไฟล์เดิมของ v1/v2

## หน้าจอ (Screens)

| ลำดับ | หน้าจอ | ไฟล์ | อ้างอิง |
| --- | --- | --- | --- |
| 01 | จัดการหลักสูตรสำหรับแดชบอร์ดผู้บริหาร (แอดมิน) | [[01-admin-manage-courses.html\|01-admin-manage-courses.html]] | [[../../../01-requirements/02-plan/feature-list\|feature-list]] (10. แอดมิน เพิ่ม/จัดการรายชื่อหลักสูตรและผูกเล่ม มคอ.2 ต่อสำนักวิชา) · [[../20260904-04-user-journey-admin-manage-executive-courses\|user journey แอดมิน จัดการรายชื่อหลักสูตรและผูกเล่ม มคอ.2 ต่อสำนักวิชา]] · [[../../../01-requirements/01-spec/20260904-04-executive-curriculum-dashboard\|executive-curriculum-dashboard]] FR ข้อ 3, 4, 5 (ปรับปรุง), 5.1 |
| 02 | เพิ่มหลักสูตรใหม่ — ผูกเล่ม มคอ.2 (แอดมิน) | [[02-admin-link-tqf2-modal.html\|02-admin-link-tqf2-modal.html]] | [[../../../01-requirements/02-plan/feature-list\|feature-list]] (10.) · [[../20260904-04-user-journey-admin-manage-executive-courses\|user journey แอดมิน จัดการรายชื่อหลักสูตรและผูกเล่ม มคอ.2 ต่อสำนักวิชา]] · [[../../../01-requirements/01-spec/20260904-04-executive-curriculum-dashboard\|executive-curriculum-dashboard]] FR ข้อ 4, 5 (ปรับปรุง), 5.1, 6 |
| 03 | เลือกสำนักวิชา (ผู้บริหาร, read-only) | [[03-executive-select-school.html\|03-executive-select-school.html]] | [[../../../01-requirements/02-plan/feature-list\|feature-list]] (11. ผู้บริหาร ดูแดชบอร์ดวิเคราะห์ข้อมูลหลักสูตรตามสำนักวิชา/หลักสูตร) · [[../20260904-05-user-journey-executive-view-dashboard\|user journey ผู้บริหาร ดูแดชบอร์ดวิเคราะห์ข้อมูลหลักสูตร]] · [[../../../01-requirements/01-spec/20260904-04-executive-curriculum-dashboard\|executive-curriculum-dashboard]] FR ข้อ 1, 3 |
| 04 | ภาพรวมหลักสูตรระดับสำนักวิชา (ผู้บริหาร, read-only) | [[04-executive-school-summary.html\|04-executive-school-summary.html]] | [[../../../01-requirements/02-plan/feature-list\|feature-list]] (11.) · [[../20260904-05-user-journey-executive-view-dashboard\|user journey ผู้บริหาร ดูแดชบอร์ดวิเคราะห์ข้อมูลหลักสูตร]] · [[../../../01-requirements/01-spec/20260904-04-executive-curriculum-dashboard\|executive-curriculum-dashboard]] FR ข้อ 10 (เพิ่ม 2026-09-13) · acceptance-criteria.md AC-11-04 |
| 05 | ผลวิเคราะห์สุขภาพหลักสูตร (ผู้บริหาร, read-only) | [[05-executive-program-health.html\|05-executive-program-health.html]] | [[../../../01-requirements/02-plan/feature-list\|feature-list]] (11.) · [[../20260904-05-user-journey-executive-view-dashboard\|user journey ผู้บริหาร ดูแดชบอร์ดวิเคราะห์ข้อมูลหลักสูตร]] · [[../../../01-requirements/01-spec/20260904-04-executive-curriculum-dashboard\|executive-curriculum-dashboard]] FR ข้อ 5 (ปรับปรุง), 8 (ปรับปรุง), 9, 12 · acceptance-criteria.md AC-11-05, AC-11-06, AC-11-07, AC-11-09 ถึง AC-11-12 |
| 06 | ความครอบคลุมทักษะที่ตลาดต้องการ (ผู้บริหาร, read-only) | [[06-executive-skill-coverage.html\|06-executive-skill-coverage.html]] | [[../../../01-requirements/02-plan/feature-list\|feature-list]] (11., 14.) · [[../20260913-08-user-journey-admin-manage-skill-framework\|user journey แอดมิน จัดการชุดกรอบทักษะอ้างอิง]] · [[../../../01-requirements/01-spec/20260904-04-executive-curriculum-dashboard\|executive-curriculum-dashboard]] FR ข้อ 9, 12 · acceptance-criteria.md AC-11-06, AC-14-07 |
| 07 | ตัวอย่างรายงานสรุป PDF แบบ A4 (ผู้บริหาร, read-only) | [[07-executive-report-preview.html\|07-executive-report-preview.html]] | [[../../../01-requirements/02-plan/feature-list\|feature-list]] (11.) · [[../20260904-05-user-journey-executive-view-dashboard\|user journey ผู้บริหาร ดูแดชบอร์ดวิเคราะห์ข้อมูลหลักสูตร]] · [[../../../01-requirements/01-spec/20260904-04-executive-curriculum-dashboard\|executive-curriculum-dashboard]] FR ข้อ 11 (เพิ่ม 2026-09-13), 12 · acceptance-criteria.md AC-11-08 |
| 08 | จัดการชุดกรอบทักษะอ้างอิง (แอดมิน) | [[08-admin-skill-framework-sets.html\|08-admin-skill-framework-sets.html]] | [[../../../01-requirements/02-plan/feature-list\|feature-list]] (14. แอดมิน จัดการชุดกรอบทักษะอ้างอิง) · [[../20260913-08-user-journey-admin-manage-skill-framework\|user journey แอดมิน จัดการชุดกรอบทักษะอ้างอิง]] · [[../../../01-requirements/01-spec/20260904-04-executive-curriculum-dashboard\|executive-curriculum-dashboard]] FR ข้อ 9 · acceptance-criteria.md AC-14-01, AC-14-07 |
| 09 | อัปโหลดเอกสารกรอบทักษะ (แอดมิน) | [[09-admin-skill-framework-upload.html\|09-admin-skill-framework-upload.html]] | [[../../../01-requirements/02-plan/feature-list\|feature-list]] (14.) · [[../20260913-08-user-journey-admin-manage-skill-framework\|user journey แอดมิน จัดการชุดกรอบทักษะอ้างอิง]] · [[../../../01-requirements/01-spec/20260904-04-executive-curriculum-dashboard\|executive-curriculum-dashboard]] FR ข้อ 9 · acceptance-criteria.md AC-14-02, AC-14-03 |
| 10 | ตรวจสอบและอนุมัติทักษะ (แอดมิน) | [[10-admin-skill-review.html\|10-admin-skill-review.html]] | [[../../../01-requirements/02-plan/feature-list\|feature-list]] (14.) · [[../20260913-08-user-journey-admin-manage-skill-framework\|user journey แอดมิน จัดการชุดกรอบทักษะอ้างอิง]] · [[../../../01-requirements/01-spec/20260904-04-executive-curriculum-dashboard\|executive-curriculum-dashboard]] FR ข้อ 9 · acceptance-criteria.md AC-14-04, AC-14-05, AC-14-06, AC-14-07 |

## สมมติฐาน / คำถามที่เปิดไว้

### การตัดสินใจเชิงออกแบบที่ยืนยันในรอบนี้ (ปิดคำถามเปิดของ spec)

- **รูปแบบผลลัพธ์ของมิติ (ก) คุณภาพหลักสูตร, (ข) ศักยภาพการจัดการเรียนการสอน, (ค) ความเป็นนานาชาติ**: ใช้รูปแบบเดียวกับมิติ (ง) คือป้ายระดับข้อความ + หลักฐานอ้างอิงกลับไปยังจุด/หมวดในเล่ม มคอ.2 + ร้อยละความครบถ้วนของข้อมูล **ไม่มีคะแนนตัวเลข 0-100 หรือเปอร์เซ็นต์คะแนนในทั้ง 4 มิติ** ตามที่ผู้ใช้ยืนยันในรอบ prototype นี้ — ปิดคำถามเปิดที่ spec (FR ข้อ 9), user journey ฝั่งผู้บริหาร และ manifest v2 เคยฝากไว้
- **หน้าจอของมิติ (ง) "ครอบคลุม X จาก Y ทักษะ"**: อยู่ในหน้าจอแยกของตัวเอง (ไฟล์ 06) ไม่ใช่ accordion/drawer ในหน้าแดชบอร์ดหลัก (ไฟล์ 05) ซึ่งแสดงเพียงการ์ดสรุปพร้อมปุ่มลิงก์
- **ปุ่ม export รายงาน PDF**: พาไปหน้า preview รายงานแบบ A4 print-friendly (ไฟล์ 07) ที่มี `@media print` และ `window.print()` ทำงานจริง ไม่ใช่ toast จำลองและไม่ใช่โมดัลเลือกส่วนที่จะ export

### ข้อมูลจำลอง (mock data)

ทุกชุดข้อมูลต่อไปนี้เป็นข้อมูลจำลองที่คิดขึ้นเพื่อสาธิต UI เท่านั้น ไม่ใช่ข้อมูลจริง: ชื่อหลักสูตรทั้งหมด (เช่น "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิทยาการคอมพิวเตอร์", "สาขาเทคโนโลยีสารสนเทศ", "สาขาเคมีประยุกต์"), ชื่อไฟล์เล่ม มคอ.2 (เช่น `curriculum-comsci-2569.pdf`, `curriculum-it-2568.docx`, `curriculum-nursing-2569.pdf`), สถานะความสอดคล้องและจำนวนข้อสังเกต, ป้ายระดับและคำอธิบายทั้ง 4 มิติ, ตัวเลขสถิติเชิงปริมาณ (หน่วยกิตรวม 132, สัดส่วนหมวดวิชา 30/96/6, จำนวนหลักสูตร 8/62), ชื่อ/metadata ชุดกรอบทักษะทั้งสองชุด ("กรอบทักษะอนาคตแรงงานดิจิทัล (WEF Future of Jobs 2023)", "กรอบทักษะที่ตลาดต้องการ (ไทยมีงานทำ 2568)"), รายการทักษะทั้ง 7 ข้อและระดับความครอบคลุม, รายวิชา/CLO ที่ใช้เป็นหลักฐานอ้างอิง (เช่น 04204451 ปัญญาประดิษฐ์เบื้องต้น, 04204310 วิศวกรรมซอฟต์แวร์, 04204201 การเขียนโปรแกรมเชิงวัตถุ, 04204512 วิทยาศาสตร์ข้อมูลเบื้องต้น) — ทั้งหมดเดินเรื่องด้วยชุดข้อมูลตัวอย่างเดียวกันต่อเนื่องตลอด flow (สำนักวิชา → หลักสูตร → มิติ (ง) → รายงาน) เพื่อให้จิ้มไล่ดูแล้วสมเหตุสมผล

### สิ่งที่ยังไม่ทำในรอบนี้

- ฟีเจอร์ 15 (ผู้ใช้งานทั่วไป ดูฐานความรู้แบบอ่านอย่างเดียว) — ยังไม่มีหน้าจอในโฟลเดอร์นี้
- การปรับหน้าจอแชทบอท `08-select-criteria-chatbot.html` / `09-chatbot-advisory.html` ของ [[../20260823-prototype-v1/index|Prototype v1]] ตาม FR ข้อ 11-13 ใหม่ของ advisory-chatbot (ปุ่มดูข้อความต้นฉบับ, ป้ายกำกับเอกสารสแกน OCR, ~~หน้าดูขอบเขตชุดเกณฑ์~~ ฯลฯ) — **(ปรับปรุงสถานะ 2026-09-15)**: ส่วน "หน้าดูขอบเขตชุดเกณฑ์" ทำเสร็จไปแล้วในวันเดียวกันนี้ ดูรายละเอียดในบรรทัดถัดไป ส่วนที่**ยังไม่ได้ทำจริง**ตามที่ระบุไว้เดิมคือ ปุ่มดูข้อความต้นฉบับ (verbatim) และป้ายกำกับเอกสารสแกน OCR ในแถบอ้างอิงของแชทบอท (FR ข้อ 9-10 ของ advisory-chatbot) เท่านั้น
- **ทำแล้วเมื่อ 2026-09-15** (แยกออกมาจากรายการข้างต้นเพื่อความชัดเจน — ไม่ใช่ส่วนหนึ่งของ "สิ่งที่ยังไม่ทำ" อีกต่อไป): หน้าดูขอบเขต/รายการเอกสารของชุดเกณฑ์ที่เลือกไว้ ทำผ่านปุ่ม "ดูขอบเขต/รายการเอกสารของชุดเกณฑ์ที่เลือกไว้" ที่เพิ่มเข้าไปในแถบ "กำลังอ้างอิง" ของ `09-chatbot-advisory.html` และหน้าจอใหม่ `13-knowledge-base-view.html` ที่สร้างขึ้นในโฟลเดอร์ [[../20260823-prototype-v1/index|Prototype v1]] (รองรับฟีเจอร์ 15 ผู้ใช้งานทั่วไป ดูฐานความรู้แบบอ่านอย่างเดียว) ดูรายละเอียดหน้าจอและอ้างอิงเต็มในตาราง Screens ของ manifest v1 ดังกล่าว
- หน้า `07-rule-review-approval.html` ของ Prototype v1 ตาม FR ข้อ 10-11 ใหม่ของ criteria-knowledge-base (แสดงตำแหน่งต้นทาง/ข้อความต้นฉบับ/ป้ายกำกับ OCR)

ทั้ง 3 ข้อข้างต้นรอให้ผู้ใช้เรียก skill `prototype-builder` อีกรอบเพื่อจัดการ (อาจสร้างโฟลเดอร์เวอร์ชันใหม่ต่อจาก v3 หรือแก้ไข v1 โดยตรงตามการตัดสินใจของผู้ใช้ตอนนั้น)

### คำถามเปิดที่ยังไม่ได้รับคำตอบ (ไม่ตัดสินใจแทนผู้ใช้)

- กลไกสกัดข้อมูลจากเล่ม มคอ.2 เป็นแบบอัตโนมัติเต็มรูปแบบ หรือกึ่งอัตโนมัติที่แอดมินต้องยืนยันก่อนแสดงผลจริง (สืบทอดจาก FR ข้อ 7 ของ spec และคำถามเปิดข้อ 2 ใน [[../20260904-04-user-journey-admin-manage-executive-courses|user journey แอดมิน จัดการรายชื่อหลักสูตรและผูกเล่ม มคอ.2 ต่อสำนักวิชา]]) — หน้าจอ 01/09 ในรอบนี้แสดงผลลัพธ์สำเร็จรูปเป็นตัวอย่างเท่านั้น ไม่ได้จำลองขั้นตอนยืนยันข้อมูลก่อนแสดงผล
- ชุดกรอบทักษะจะใช้โครงสร้างข้อมูล/หน้าจอร่วมกับชุดเกณฑ์มาตรฐานโดยแยกด้วย type หรือแยกคนละส่วนต่างหาก — ส่งต่อให้ [[../../02-technical/index|02-technical]] ตัดสินใจ ไม่กระทบหน้าตา UI ของ prototype นี้
- ตัวชี้วัด/เกณฑ์ตัดช่วงรายมิติที่ Curmate ใช้จริง ต้องได้รับการรับรองจากใคร (เช่น คณะกรรมการวิชาการ) ก่อนนำไปอ้างอิงในที่ประชุมหรือไม่ (FR ข้อ 13)

---
[[../index|01-prototypes]] · [[../DESIGN|DESIGN.md]] · [[../../../01-requirements/02-plan/feature-list|feature-list]]
