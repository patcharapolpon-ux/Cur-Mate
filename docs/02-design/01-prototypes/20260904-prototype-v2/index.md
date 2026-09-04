# Prototype v2 — 2026-09-04

## สโคป

ครอบคลุม 2 user journey ที่เกี่ยวข้องกับ "ระบบแดชบอร์ดวิเคราะห์ข้อมูลหลักสูตรสำหรับผู้บริหาร" — เป็นคนละ persona และคนละชุดข้อมูลจาก [[../20260823-prototype-v1/index|Prototype v1]] โดยสิ้นเชิง จึงแยกเป็นเวอร์ชันใหม่แทนการแก้ไข v1 เดิม ตรงกับฟีเจอร์ใน [[../../../01-requirements/02-plan/feature-list|feature-list]] ดังนี้:

- 10. แอดมิน เพิ่ม/จัดการรายชื่อหลักสูตรและไฟล์ที่จะเสนอเข้าที่ประชุมต่อสำนักวิชา (`Should have`)
- 11. ผู้บริหาร ดูแดชบอร์ดวิเคราะห์ข้อมูลหลักสูตรตามสำนักวิชา/หลักสูตร (`Should have`)

Requirement ต้นทาง: [[../../../01-requirements/01-spec/20260904-04-executive-curriculum-dashboard|ระบบแดชบอร์ดวิเคราะห์ข้อมูลหลักสูตรสำหรับผู้บริหาร (Executive Curriculum Analytics Dashboard)]]

User journey ที่อ้างอิง:

- [[../20260904-04-user-journey-admin-manage-executive-courses|แอดมิน จัดการรายชื่อหลักสูตรและไฟล์ที่จะเสนอเข้าที่ประชุม]]
- [[../20260904-05-user-journey-executive-view-dashboard|ผู้บริหาร ดูแดชบอร์ดวิเคราะห์ข้อมูลหลักสูตร]]

เวอร์ชันนี้เป็น prototype แบบ **interactive จิ้มเล่นได้จริง** เช่นเดียวกับ v1 — ทุกหน้ามี vanilla JavaScript inline ให้คลิก/โต้ตอบได้จริง (จำลองเลือกสำนักวิชา, แสดง/ซ่อนรายชื่อหลักสูตรตามสำนักวิชาที่เลือก, จำลองแนบไฟล์และ validate ประเภทไฟล์, สลับดูตัวอย่างสถานะว่างเปล่า) และเชื่อมโยงกันด้วยลิงก์ระหว่างไฟล์ .html ให้เดินหน้า-ถอยหลังได้จริงในเบราว์เซอร์

หน้าจอฝั่งแอดมิน (01-02) ใช้ admin zone badge + breadcrumb แบบเดียวกับหน้าจอแอดมินใน v1 (05-07) เพื่อสื่อความต่อเนื่องของบทบาท ส่วนหน้าจอฝั่งผู้บริหาร (03-05) ใช้ badge ใหม่ "มุมมองผู้บริหาร (ดูอย่างเดียว)" สีโทน Info เพื่อสื่อสิทธิ์ read-only อย่างชัดเจน และไม่มี element ใดๆ ที่สื่อถึงการแก้ไข/อัปโหลด/อนุมัติบนหน้าจอเหล่านี้เลย

อ้างอิง Design System: [[../DESIGN|DESIGN.md]]

## หน้าจอ (Screens)

| ลำดับ | หน้าจอ | ไฟล์ | อ้างอิง |
| --- | --- | --- | --- |
| 01 | จัดการหลักสูตรสำหรับแดชบอร์ดผู้บริหาร (แอดมิน) | [[01-admin-select-school-courses.html\|01-admin-select-school-courses.html]] | [[../../../01-requirements/02-plan/feature-list\|feature-list]] (10. แอดมิน เพิ่ม/จัดการรายชื่อหลักสูตรและไฟล์ที่จะเสนอเข้าที่ประชุมต่อสำนักวิชา) · [[../20260904-04-user-journey-admin-manage-executive-courses\|user journey แอดมิน จัดการรายชื่อหลักสูตรและไฟล์ที่จะเสนอเข้าที่ประชุม]] · [[../../../01-requirements/01-spec/20260904-04-executive-curriculum-dashboard\|executive-curriculum-dashboard]] FR ข้อ 3 และ FR ข้อ 4 |
| 02 | เพิ่มหลักสูตรใหม่ — แนบไฟล์ (แอดมิน) | [[02-admin-add-course-modal.html\|02-admin-add-course-modal.html]] | [[../../../01-requirements/02-plan/feature-list\|feature-list]] (10. แอดมิน เพิ่ม/จัดการรายชื่อหลักสูตรและไฟล์ที่จะเสนอเข้าที่ประชุมต่อสำนักวิชา) · [[../20260904-04-user-journey-admin-manage-executive-courses\|user journey แอดมิน จัดการรายชื่อหลักสูตรและไฟล์ที่จะเสนอเข้าที่ประชุม]] · [[../../../01-requirements/01-spec/20260904-04-executive-curriculum-dashboard\|executive-curriculum-dashboard]] FR ข้อ 4, FR ข้อ 5 และ FR ข้อ 6 |
| 03 | เลือกสำนักวิชา (ผู้บริหาร, read-only) | [[03-executive-select-school.html\|03-executive-select-school.html]] | [[../../../01-requirements/02-plan/feature-list\|feature-list]] (11. ผู้บริหาร ดูแดชบอร์ดวิเคราะห์ข้อมูลหลักสูตรตามสำนักวิชา/หลักสูตร) · [[../20260904-05-user-journey-executive-view-dashboard\|user journey ผู้บริหาร ดูแดชบอร์ดวิเคราะห์ข้อมูลหลักสูตร]] · [[../../../01-requirements/01-spec/20260904-04-executive-curriculum-dashboard\|executive-curriculum-dashboard]] FR ข้อ 1 และ FR ข้อ 3 |
| 04 | เลือกหลักสูตร (ผู้บริหาร, read-only) | [[04-executive-select-course.html\|04-executive-select-course.html]] | [[../../../01-requirements/02-plan/feature-list\|feature-list]] (11. ผู้บริหาร ดูแดชบอร์ดวิเคราะห์ข้อมูลหลักสูตรตามสำนักวิชา/หลักสูตร) · [[../20260904-05-user-journey-executive-view-dashboard\|user journey ผู้บริหาร ดูแดชบอร์ดวิเคราะห์ข้อมูลหลักสูตร]] · [[../../../01-requirements/01-spec/20260904-04-executive-curriculum-dashboard\|executive-curriculum-dashboard]] FR ข้อ 2 |
| 05 | สถิติภาพรวมของหลักสูตร (ผู้บริหาร, read-only) | [[05-executive-dashboard-stats.html\|05-executive-dashboard-stats.html]] | [[../../../01-requirements/02-plan/feature-list\|feature-list]] (11. ผู้บริหาร ดูแดชบอร์ดวิเคราะห์ข้อมูลหลักสูตรตามสำนักวิชา/หลักสูตร) · [[../20260904-05-user-journey-executive-view-dashboard\|user journey ผู้บริหาร ดูแดชบอร์ดวิเคราะห์ข้อมูลหลักสูตร]] · [[../../../01-requirements/01-spec/20260904-04-executive-curriculum-dashboard\|executive-curriculum-dashboard]] FR ข้อ 1, FR ข้อ 7 และ FR ข้อ 8 |

## สมมติฐาน / คำถามที่เปิดไว้

- รายชื่อหลักสูตรตัวอย่าง (เช่น "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิทยาการคอมพิวเตอร์ (ปรับปรุง พ.ศ. 2569)"), ชื่อไฟล์แนบตัวอย่าง, วันที่เพิ่มตัวอย่าง และตัวเลขสถิติทั้งหมดในหน้า 05 (จำนวนหลักสูตร 8/62, หน่วยกิตรวม 132, สัดส่วนหมวดวิชา 30/96/6, กราฟแท่ง 5 อันดับสำนักวิชา) เป็นข้อมูลจำลอง (mock data) ที่คิดขึ้นเพื่อสาธิต UI เท่านั้น ไม่ใช่ข้อมูลจริง
- หน้า 01: การเลือกสำนักวิชาอื่นนอกเหนือจาก 2 สำนักวิชาที่มีข้อมูลตัวอย่าง (สำนักวิชาเทคโนโลยีดิจิทัลประยุกต์ และสำนักวิชาวิทยาศาสตร์) จะแสดงสถานะว่างเปล่าโดยอัตโนมัติ เพื่อจำลองพฤติกรรมจริงที่สำนักวิชาส่วนใหญ่ยังไม่มีหลักสูตรถูกเพิ่ม
- หน้า 02 จำลองเป็นโมดัลที่ซ้อนทับหน้า 01 ด้วยการวาดพื้นหลังเนื้อหาของหน้า 01 (เบลอเล็กน้อย) ไว้ใต้ overlay + modal dialog ในไฟล์เดียวกัน แทนการใช้ JavaScript เปิด/ปิดโมดัลข้ามไฟล์จริง เนื่องจากแต่ละหน้าจอต้อง self-contained และเปิดตรงได้จากไฟล์ใดก็ได้
- หน้า 04: สถานะว่างเปล่า ("ยังไม่มีหลักสูตรในสำนักวิชานี้") ถูกใส่ไว้เป็นทางเลือกในหน้าเดียวกัน สลับดูได้ด้วยปุ่ม "ทดสอบสถานะว่างเปล่า" (ไม่ได้อยู่คนละไฟล์) ตามดุลยพินิจในสไตล์เดียวกับปุ่มทดสอบ error case ของ v1 (เช่น `testRejectBtn` ในหน้า 01-upload-mco2.html)
- กลไกการดึงข้อมูล/คำนวณสถิติจากไฟล์ที่อัปโหลดจริง (อัตโนมัติเต็มรูปแบบหรือกึ่งอัตโนมัติที่ต้องแอดมินยืนยันก่อน) ยังไม่ยืนยันจากผู้ใช้ ตามคำถามเปิดที่สืบทอดมาจาก [[../../../01-requirements/01-spec/20260904-04-executive-curriculum-dashboard|executive-curriculum-dashboard]] และ 2 journey ต้นทาง — หน้า 05 ในเวอร์ชันนี้แสดงผลลัพธ์สถิติสำเร็จรูปเป็นตัวอย่างเท่านั้น ไม่ได้จำลองขั้นตอนดึงข้อมูล/ยืนยันตัวเลขก่อนแสดงผล
- Authentication/บัญชีผู้ใช้ของบทบาท "ผู้บริหาร" ยังไม่ปรากฏในหน้าจอชุดนี้ (ยังไม่มีหน้า login แยก) ตามคำถามเปิดที่ส่งต่อให้ [[../../02-technical/index|02-technical]] ตัดสินใจ

---
[[../index|01-prototypes]] · [[../DESIGN|DESIGN.md]] · [[../../../01-requirements/02-plan/feature-list|feature-list]]
