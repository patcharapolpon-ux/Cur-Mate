# Test Plan

แผนการทดสอบภาพรวมของทั้งโปรเจกต์ Curmate อ้างอิงจาก [[../../01-requirements/backlog|backlog]], [[../../01-requirements/01-spec/index|01-spec]] (โดยเฉพาะหัวข้อ Non-functional Requirements) และ [[acceptance-criteria|acceptance-criteria]] รายละเอียด test case แบบ step-by-step ต่อฟีเจอร์ดูได้ที่ [[test-cases/index|test-cases]]

## 1. ภาพรวมและวัตถุประสงค์

Curmate เป็นระบบที่ช่วยผู้จัดทำหลักสูตร (เจ้าหน้าที่/อาจารย์) ตรวจสอบความสอดคล้องของเอกสารรายละเอียดหลักสูตร (มคอ.2) กับเกณฑ์มาตรฐานหลักสูตร โดยมีแอดมินเป็นผู้ดูแลฐานความรู้เกณฑ์มาตรฐานที่ใช้อ้างอิง และมีแชทบอทช่วยให้คำแนะนำระหว่างร่างหลักสูตรเป็นความสามารถเสริม นอกจากนี้ยังมีแดชบอร์ดวิเคราะห์ข้อมูลหลักสูตรสำหรับผู้บริหาร และระบบยืนยันตัวตน/จัดการบทบาทผู้ใช้ โปรเจกต์นี้ปัจจุบันมี **5 Backlog Item / 13 ฟีเจอร์** ตาม [[../../01-requirements/02-plan/feature-list|feature-list]]

วัตถุประสงค์ของการทดสอบรอบนี้คือยืนยันว่าทั้ง 13 ฟีเจอร์ (5 Backlog Item ลำดับ 01-05) ที่มี Acceptance Criteria พร้อมแล้ว ทำงานตรงตาม Acceptance Criteria ที่กำหนดไว้ใน [[acceptance-criteria|acceptance-criteria]] ครอบคลุมทั้งกรณีปกติ (happy path), negative case, และ edge case ที่ระบุไว้ในเอกสาร spec ต้นทาง รวมถึงตรวจสอบประเด็นด้าน data integrity/encoding ของภาษาไทยและสิทธิ์การเข้าถึงตามบทบาท (role-based access) ที่ spec ระบุไว้อย่างชัดเจน ส่วนประเด็นด้าน performance ยังไม่สามารถวางแผนทดสอบได้ในรอบนี้เนื่องจากยังไม่มีข้อมูลเป้าหมายที่ชัดเจน (ดูหัวข้อ Risk Management) Backlog ลำดับ 04 (ฟีเจอร์ 10-11) ที่เข้าสโคปโปรเจกต์เมื่อ 2026-09-04 ปัจจุบันมี Acceptance Criteria ครบแล้ว (AC-10-01, AC-10-02, AC-11-01, AC-11-02, AC-11-03 ใน [[acceptance-criteria|acceptance-criteria]]) และมี Test Case ครบแล้วที่ [[test-cases/10-admin-manage-executive-courses|10-admin-manage-executive-courses]] และ [[test-cases/11-executive-view-dashboard|11-executive-view-dashboard]] จึงถือว่าครบทั้ง 4 Backlog Item / 11 ฟีเจอร์ในการทดสอบรอบนี้แล้ว (ดูหัวข้อ 2.1) ส่วน Backlog ลำดับ 05 (ฟีเจอร์ 12-13 — ระบบยืนยันตัวตนและจัดการบทบาทผู้ใช้) ที่เข้าสโคปโปรเจกต์เมื่อ 2026-09-12 ปัจจุบันมี **Acceptance Criteria ครบแล้วเช่นกัน** (AC-12-01 ถึง AC-12-05 สำหรับฟีเจอร์ 12 และ AC-13-01 ถึง AC-13-03 สำหรับฟีเจอร์ 13 ใน [[acceptance-criteria|acceptance-criteria]]) รวมถึงฟีเจอร์ 07 ที่ได้รับ Acceptance Criteria เพิ่มเติมครอบคลุม flow ปฏิเสธ (reject)/ลบ/นำชุดเกณฑ์กลับไปเป็น pending ของกฎเกณฑ์ (AC-07-07 ถึง AC-07-12) จึงถือว่าครบทั้ง **5 Backlog Item / 13 ฟีเจอร์** ที่มี Acceptance Criteria แล้วในรอบนี้ อย่างไรก็ตาม Test Case แบบ step-by-step ของฟีเจอร์ 12-13 และของส่วนขยายฟีเจอร์ 07 (AC-07-07 ถึง AC-07-12) **ยังไม่ถูกสร้าง** — รอ agent `test-case-writer` ดำเนินการต่อจากนี้ก่อนจึงจะเข้าเงื่อนไข Entry Criteria ครบตามหัวข้อ 7

## 2. ขอบเขตการทดสอบ (Scope)

### 2.1 สิ่งที่ทดสอบ (In scope)

| ลำดับ Backlog | Backlog Item | ฟีเจอร์ที่ทดสอบ | Test Case อ้างอิง |
| --- | --- | --- | --- |
| 01 | [[../../01-requirements/01-spec/20260812-01-tqf2-consistency-check\|ระบบตรวจสอบความสอดคล้องของเอกสารรายละเอียดหลักสูตร (มคอ.2)]] | 01. อัปโหลดและจัดการไฟล์ มคอ.2 · 02. เลือกชุดเกณฑ์มาตรฐานก่อนเริ่มตรวจสอบ/สนทนา (มุมมองผู้จัดทำหลักสูตร) · 03. ตรวจสอบความสอดคล้องภายในเล่มเดียวกัน · 04. ตรวจสอบความสอดคล้อง/ซ้ำซ้อนข้ามเล่มหลักสูตร (cross-document) · 05. รายงานผลตรวจสอบ | [[test-cases/index\|test-cases]] |
| 02 | [[../../01-requirements/01-spec/20260823-02-criteria-knowledge-base\|ระบบจัดการฐานความรู้เกณฑ์มาตรฐานหลักสูตร (Knowledge Base) สำหรับแอดมิน]] | 02. เลือกชุดเกณฑ์มาตรฐานก่อนเริ่มตรวจสอบ/สนทนา (มุมมองแอดมิน/สถานะ) · 06. จัดการฐานความรู้เกณฑ์มาตรฐานหลักสูตร (สร้างชุดเกณฑ์ + อัปโหลดเอกสาร) · 07. ตรวจสอบ แก้ไข และอนุมัติกฎเกณฑ์ที่ AI สกัดมา · 08. ตรวจสอบเนื้อหาจริงของหลักสูตรเทียบกับเกณฑ์มาตรฐาน | [[test-cases/index\|test-cases]] |
| 03 | [[../../01-requirements/01-spec/20260823-03-advisory-chatbot\|ระบบแชทบอทให้คำแนะนำระหว่างจัดทำหลักสูตร (Advisory Chatbot)]] | 02. เลือกชุดเกณฑ์มาตรฐานก่อนเริ่มตรวจสอบ/สนทนา (มุมมองแชทบอท) · 09. แชทบอทให้คำแนะนำระหว่างจัดทำหลักสูตร (รวม Q&A เกณฑ์มาตรฐาน) | [[test-cases/index\|test-cases]] |
| 04 | [[../../01-requirements/01-spec/20260904-04-executive-curriculum-dashboard\|ระบบแดชบอร์ดวิเคราะห์ข้อมูลหลักสูตรสำหรับผู้บริหาร (Executive Curriculum Analytics Dashboard)]] | 10. แอดมิน เพิ่ม/จัดการรายชื่อหลักสูตรและไฟล์ที่จะเสนอเข้าที่ประชุมต่อสำนักวิชา · 11. ผู้บริหาร ดูแดชบอร์ดวิเคราะห์ข้อมูลหลักสูตรตามสำนักวิชา/หลักสูตร | มี Acceptance Criteria ครบแล้ว (AC-10-01, AC-10-02, AC-11-01, AC-11-02, AC-11-03 ใน [[acceptance-criteria\|acceptance-criteria]]) และมี Test Case ครบแล้วที่ [[test-cases/10-admin-manage-executive-courses\|10-admin-manage-executive-courses]] และ [[test-cases/11-executive-view-dashboard\|11-executive-view-dashboard]] |
| 05 | [[../../01-requirements/01-spec/20260912-05-authentication-user-roles\|ระบบยืนยันตัวตนและจัดการบทบาทผู้ใช้ (Authentication & User Role Management)]] | 12. สมัครสมาชิกและเข้าสู่ระบบ · 13. แอดมินจัดการบทบาทผู้ใช้ | มี Acceptance Criteria ครบแล้ว (AC-12-01 ถึง AC-12-05, AC-13-01 ถึง AC-13-03 ใน [[acceptance-criteria\|acceptance-criteria]]) — Test Case ยังไม่ถูกสร้าง รอ agent `test-case-writer` ดำเนินการต่อ |

> หมายเหตุ: ฟีเจอร์ 02 ถูกใช้งานจากมุมมองต่างกันในทั้ง 3 Backlog Item แรก (เช่นเดียวกับที่ระบุไว้ใน [[acceptance-criteria|acceptance-criteria]]) จึงปรากฏซ้ำในตารางนี้ 3 ครั้งตามมุมมองที่ทดสอบ ไม่ใช่การนับซ้ำเป็นฟีเจอร์คนละตัว
>
> หมายเหตุ: Backlog ลำดับ 04 (ฟีเจอร์ 10-11) อยู่ในขอบเขต scope ของโปรเจกต์แล้ว และตอนนี้มี **Acceptance Criteria ครบแล้ว** (AC-10-01, AC-10-02, AC-11-01, AC-11-02, AC-11-03 ใน [[acceptance-criteria|acceptance-criteria]]) และมี **Test Case ครบแล้ว** ที่ [[test-cases/10-admin-manage-executive-courses|10-admin-manage-executive-courses]] (TC-10-001, TC-10-002) และ [[test-cases/11-executive-view-dashboard|11-executive-view-dashboard]] (TC-11-001 ถึง TC-11-003) ครอบคลุม AC ครบทุกข้อ — อย่าเพิ่งตีความว่าฟีเจอร์นี้ผ่านการทดสอบจริงแล้วจนกว่าจะมีผลทดสอบครบตาม Entry/Exit Criteria (หัวข้อ 7-8)
>
> หมายเหตุ: Backlog ลำดับ 05 (ฟีเจอร์ 12-13) เข้าสโคปโปรเจกต์เมื่อ 2026-09-12 ปัจจุบันมี **Acceptance Criteria ครบแล้ว** (AC-12-01 ถึง AC-12-05 สำหรับฟีเจอร์ 12, AC-13-01 ถึง AC-13-03 สำหรับฟีเจอร์ 13 ใน [[acceptance-criteria|acceptance-criteria]]) จึงถือว่าอยู่ในรอบทดสอบนี้แล้วในระดับ Acceptance Criteria — แต่**ยังไม่มี Test Case** แบบ step-by-step รอ agent `test-case-writer` สร้างต่อจากนี้ก่อนจึงจะเริ่มลงมือทดสอบจริงได้ (เช่นเดียวกับส่วนขยายของฟีเจอร์ 07 — AC-07-07 ถึง AC-07-12 — ที่มี Acceptance Criteria ครบแล้วแต่ยังไม่มี test case เช่นกัน)

### 2.2 สิ่งที่ไม่ทดสอบรอบนี้ (Out of scope)

รวบรวมจากหัวข้อ "สิ่งที่ไม่ทำ (Out of scope)" ของแต่ละ spec ที่เกี่ยวข้อง:

จาก [[../../01-requirements/01-spec/20260812-01-tqf2-consistency-check|tqf2-consistency-check]]:

- การแก้ไขเอกสารต้นฉบับ มคอ.2 ให้อัตโนมัติ (ระบบตรวจจับและรายงานเท่านั้น)
- การเทียบความสอดคล้องกับเอกสารระดับอื่นในชุด มคอ. (เช่น มคอ.3) หรือระบบทะเบียน
- สิทธิ์ผู้ใช้งานหลายระดับ เช่น มุมมองของกรรมการ/ผู้ตรวจสอบภายนอก

จาก [[../../01-requirements/01-spec/20260823-02-criteria-knowledge-base|criteria-knowledge-base]]:

- การแก้ไขเนื้อหาเกณฑ์ในเอกสารต้นฉบับให้อัตโนมัติ
- การให้สิทธิ์ผู้ใช้งานทั่วไปอัปโหลด/แก้ไขฐานความรู้เกณฑ์มาตรฐาน (จำกัดเฉพาะแอดมิน)
- กลไกทางเทคนิคของการทำ retrieval/RAG หรือรายละเอียดสถาปัตยกรรมการค้นคืนเอกสาร (ส่งต่อให้ [[../../02-design/02-technical/index|02-technical]] ตัดสินใจ)

จาก [[../../01-requirements/01-spec/20260823-03-advisory-chatbot|advisory-chatbot]]:

- แชทบอทไม่มีสิทธิ์แก้ไขไฟล์ร่างหลักสูตรของผู้ใช้โดยตรง ทำหน้าที่ให้คำแนะนำเท่านั้น
- การเก็บเนื้อหาร่างที่ผู้ใช้พิมพ์/วางเข้ามาเป็นส่วนหนึ่งของฐานความรู้ถาวร (ถือเป็นข้อความสนทนาชั่วคราวเท่านั้น)
- การทดแทนขั้นตอนตรวจสอบความสอดคล้องแบบเต็มเล่ม (ผู้ใช้ยังต้องอัปโหลดเล่มเต็มตามปกติ)
- การตอบคำถามที่อยู่นอกเหนือขอบเขตฐานความรู้เกณฑ์มาตรฐาน (เช่น ความรู้ทั่วไปอื่นๆ)

## 3. กลยุทธ์การทดสอบ (Test Types & Levels)

- **Functional Testing**: ทดสอบตามจำนวนสถานการณ์ทั้งหมดที่ระบุไว้ใน [[acceptance-criteria|acceptance-criteria]] (ปัจจุบันมี Acceptance Criteria ครบทั้ง 13 ฟีเจอร์แล้ว — รวมฟีเจอร์ 12-13 จาก spec ใหม่ [[../../01-requirements/01-spec/20260912-05-authentication-user-roles|20260912-05-authentication-user-roles]] (Backlog ลำดับ 05, AC-12-01 ถึง AC-12-05, AC-13-01 ถึง AC-13-03) และส่วนขยายของฟีเจอร์ 07 (AC-07-07 ถึง AC-07-12 ครอบคลุม flow ปฏิเสธ/ลบ/นำชุดเกณฑ์กลับไปเป็น pending) รวมทั้งหมด 52 สถานการณ์) และ test case ใน [[test-cases/index|test-cases]] ครบทุกฟีเจอร์ที่มี Test Case สร้างเสร็จแล้วทั้ง 11 ฟีเจอร์ (ฟีเจอร์ 01-11 ของ Backlog ลำดับ 01-04 รวมฟีเจอร์ 10-11 ที่มี Test Case ครบแล้วที่ [[test-cases/10-admin-manage-executive-courses|10-admin-manage-executive-courses]] และ [[test-cases/11-executive-view-dashboard|11-executive-view-dashboard]] — ดูหัวข้อ 2.1) ครอบคลุม happy path, negative case (เช่น อัปโหลดไฟล์ที่ดึงข้อความไม่ได้, พยายามเริ่มตรวจสอบโดยไม่เลือกชุดเกณฑ์, แอดมินแนบไฟล์ผิดประเภทในหน้าจัดการหลักสูตรผู้บริหาร, เข้าสู่ระบบด้วยรหัสผ่านผิด) และ edge case (เช่น กฎการจับคู่ข้อมูลทนทานต่อรหัสวิชา placeholder, วิชาทางเลือก "หรือ" กัน, สำนักวิชาที่ยังไม่มีหลักสูตรใดถูกเพิ่มไว้เลย, แอดมินพยายามแก้ไขบทบาทของบัญชีตัวเอง) — Test Case ของฟีเจอร์ 12-13 และของส่วนขยายฟีเจอร์ 07 (AC-07-07 ถึง AC-07-12) ยังไม่ถูกสร้างในรอบนี้ รอ agent `test-case-writer` ดำเนินการต่อจากนี้
- **Data Integrity / Encoding Testing**: ทดสอบว่าการดึงข้อความภาษาไทยจากไฟล์ มคอ.2 (PDF/Word) เข้ารหัสถูกต้อง (UTF-8) และมีการ normalize ตัวอักษรที่มีปัญหาการแยกส่วนประกอบผิดลำดับ (เช่น สระ ำ) ก่อนนำไปเปรียบเทียบ/จับคู่ข้อมูล เพื่อป้องกันข้อความภาษาไทยสูญหายหรือผิดเพี้ยนแบบเงียบๆ ระหว่างขั้นตอนดึงข้อมูล — เกี่ยวข้องกับฟีเจอร์ 01, 03, 04 โดยตรง อ้างอิงหัวข้อ Non-functional Requirements ของ [[../../01-requirements/01-spec/20260812-01-tqf2-consistency-check|tqf2-consistency-check]]
- **Authorization Testing (Role-based Access)**: ทดสอบว่าเฉพาะเจ้าหน้าที่/อาจารย์ผู้จัดทำหลักสูตรเท่านั้นที่อัปโหลดไฟล์ มคอ.2 ได้ (ผู้ใช้งานบทบาทอื่นต้องถูกปฏิเสธสิทธิ์) อ้างอิง FR ข้อ 1 ของ [[../../01-requirements/01-spec/20260812-01-tqf2-consistency-check|tqf2-consistency-check]] และทดสอบว่าเฉพาะแอดมินเท่านั้นที่สร้าง/อัปโหลด/แก้ไข/อนุมัติฐานความรู้เกณฑ์มาตรฐานได้ (ผู้ใช้งานทั่วไปต้องถูกปฏิเสธสิทธิ์) อ้างอิง FR ข้อ 1 ของ [[../../01-requirements/01-spec/20260823-02-criteria-knowledge-base|criteria-knowledge-base]] ตอนนี้ครอบคลุมเพิ่มเติมถึงการทดสอบว่าเฉพาะแอดมินเท่านั้นที่จัดการบทบาทผู้ใช้ได้ (ผู้ใช้งานทั่วไป/ผู้บริหารต้องถูกปฏิเสธสิทธิ์ทั้งระดับ UI และเมื่อเรียก API ข้าม UI โดยตรง) และแอดมินไม่สามารถแก้ไขบทบาทของบัญชีตัวเองได้ อ้างอิง FR ข้อ 4, 5 ของ [[../../01-requirements/01-spec/20260912-05-authentication-user-roles|authentication-user-roles]] — เกี่ยวข้องกับฟีเจอร์ 01, 06, 07, 13 โดยตรง
- **Regression Testing**: ทดสอบซ้ำทุกครั้งที่มีการอัปเดตเอกสาร spec/feature-list/prototype ที่กระทบ flow ที่เคยผ่านการทดสอบแล้ว (เช่น การเพิ่ม/แก้ไข FR ที่ทำให้ acceptance criteria เดิมเปลี่ยน) และก่อนการส่งมอบ/ขึ้นใช้งานจริงแต่ละรอบ โดยเน้นฟีเจอร์ที่เป็น critical path (01, 02, 03, 05, 06, 07) เป็นอันดับแรก
- **User Acceptance Testing (UAT)**: ยังไม่กำหนด — รอข้อมูลเพิ่มเติมจากผู้ใช้ว่าใครจะเป็นผู้ทำ UAT (เช่น ตัวแทนผู้จัดทำหลักสูตร/แอดมินจริง)

## 4. Test Environment

ยังไม่กำหนด — รอข้อมูล infrastructure จริงจากขั้นตอนออกแบบเชิงเทคนิคที่ [[../../02-design/02-technical/index|02-technical]] (ปัจจุบันยังไม่มีเอกสาร tech-stack ยืนยัน infrastructure ที่จะใช้จริง) เมื่อมีข้อมูลแล้วจะระบุรายละเอียด เช่น environment ที่ใช้ทดสอบ (dev/staging), ฐานข้อมูล/บริการ AI ที่ใช้จริงหรือจำลอง (mock), และ browser/device ที่ครอบคลุมการทดสอบ

## 5. Test Data Strategy

- ทดสอบด้วยไฟล์ มคอ.2 ตัวอย่างทั้งรูปแบบ PDF และ Word (.docx) ครอบคลุมทั้งกรณี text-based ปกติ, ไฟล์ที่เป็นภาพสแกนล้วน (สำหรับ negative case AC-01-03), และไฟล์ที่เนื้อหาไม่ครบตาม TOC (สำหรับ edge case AC-01-04) — โครงสร้างเนื้อหาอ้างอิงจากการวิเคราะห์เอกสาร มคอ.2 จริงที่ระบุไว้ใน [[../../01-requirements/backlog|backlog]] (ลำดับ 01)
- ข้อมูลรายวิชาทดสอบต้องครอบคลุมกรณีกฎการจับคู่ข้อมูลทนทานตาม FR ข้อ 4 ของ [[../../01-requirements/01-spec/20260812-01-tqf2-consistency-check|tqf2-consistency-check]] ได้แก่ รหัสวิชา placeholder ซ้ำกัน, วิชาทางเลือก "หรือ" กัน, วิชาหน่วยกิตแปรผัน/เป็น 0 โดยตั้งใจ
- ข้อมูลเกณฑ์มาตรฐาน (criteria set) และกฎเกณฑ์ที่ AI สกัดมาใช้ข้อมูลจำลอง (mock) ที่มีทั้งสถานะ pending และ approved ผสมกัน เพื่อทดสอบการซ่อน/แสดงชุดเกณฑ์ให้ผู้ใช้งานทั่วไปเห็นถูกต้อง (ฟีเจอร์ 02, 07)
- บทสนทนาทดสอบแชทบอท (ฟีเจอร์ 09) อ้างอิงรูปแบบ mock conversation ที่ออกแบบไว้แล้วใน prototype (ดู [[../../02-design/01-prototypes/20260823-prototype-v1/index|20260823-prototype-v1 (manifest)]]) เป็นจุดตั้งต้น แล้วขยายเพิ่มกรณีคำถามทั่วไปและกรณีส่งเนื้อหาร่างขอคำแนะนำให้หลากหลายขึ้น
- รายละเอียด test data ระดับ test case แต่ละรายการให้ระบุเพิ่มเติมในไฟล์ที่เกี่ยวข้องภายใต้ [[test-cases/index|test-cases]]

## 6. บทบาทและความรับผิดชอบ (Roles & Responsibilities)

ยังไม่กำหนด — รอข้อมูลเพิ่มเติมจากผู้ใช้ (เช่น ใครเป็นผู้ทดสอบ/ผู้ตรวจรับผลทดสอบ/ผู้แก้บั๊ก)

## 7. Entry Criteria

- ฟีเจอร์ที่จะเริ่มทดสอบต้องมี Acceptance Criteria ครบใน [[acceptance-criteria|acceptance-criteria]] แล้ว (ปัจจุบันครบทั้ง 13 ฟีเจอร์แล้ว รวมฟีเจอร์ 12-13 — AC-12-01 ถึง AC-12-05, AC-13-01 ถึง AC-13-03 — และส่วนขยายของฟีเจอร์ 07 — AC-07-07 ถึง AC-07-12 — จาก spec ใหม่ [[../../01-requirements/01-spec/20260912-05-authentication-user-roles|20260912-05-authentication-user-roles]])
- ฟีเจอร์ที่จะเริ่มทดสอบต้องมี test case แบบ step-by-step ครบใน [[test-cases/index|test-cases]] ก่อนเริ่มลงมือทดสอบจริง (ปัจจุบันมีครบทั้ง 11 ฟีเจอร์ รวมฟีเจอร์ 10-11 ที่สร้างเสร็จแล้วที่ [[test-cases/10-admin-manage-executive-courses|10-admin-manage-executive-courses]] และ [[test-cases/11-executive-view-dashboard|11-executive-view-dashboard]] — ฟีเจอร์ 12-13 และส่วนขยายของฟีเจอร์ 07 (AC-07-07 ถึง AC-07-12) แม้จะมี Acceptance Criteria ครบแล้ว แต่**ยังไม่มี test case** แบบ step-by-step รอ agent `test-case-writer` สร้างต่อจากนี้ก่อนจึงจะเข้าเงื่อนไขนี้ครบ)
- ต้องมี prototype/หน้าจออ้างอิงของฟีเจอร์นั้นพร้อมใช้ตรวจสอบ UI (ปัจจุบันมีครบทั้ง 9 ฟีเจอร์ใน [[../../02-design/01-prototypes/20260823-prototype-v1/index|20260823-prototype-v1 (manifest)]])
- ต้องมี Test Environment พร้อมใช้งานจริงตามหัวข้อ 4 (ปัจจุบันยังไม่พร้อม — ต้องรอผลจาก 02-technical ก่อน)

## 8. Exit Criteria

- ทุก Acceptance Criteria ของฟีเจอร์ระดับ `Must have` (01, 02, 03, 05, 06, 07) ต้องผ่านการทดสอบครบ 100%
- Acceptance Criteria ของฟีเจอร์ระดับ `Should have` (04, 08) และ `Could have` (09) ต้องผ่านการทดสอบตาม AC ที่มีอยู่ โดยยอมรับได้หากบางกรณีที่ยังเป็น "สมมติฐาน/คำถามที่เปิดไว้" ยังไม่มี AC ให้ทดสอบ (ตามที่ระบุไว้ท้าย [[acceptance-criteria|acceptance-criteria]])
- ไม่มีบั๊กระดับสูง (critical/high) ค้างอยู่ในฟีเจอร์ระดับ `Must have` ก่อนปิดรอบทดสอบ
- ผลทดสอบทั้งหมดถูกบันทึกไว้ใน [[../02-test-result/index|02-test-result]] ครบทุกฟีเจอร์ที่อยู่ในสโคป

## 9. Risk Management

| ความเสี่ยง | ที่มา | ผลกระทบ | แนวทางบรรเทา |
| --- | --- | --- | --- |
| ยังไม่กำหนด threshold ทางเทคนิคว่าไฟล์ลักษณะใดถือว่า "ดึงข้อความไม่ได้ทั้งหมด" (เช่น ไฟล์ผสมที่มีบางหน้าเป็นภาพสแกน) | [[../../01-requirements/01-spec/20260812-01-tqf2-consistency-check|tqf2-consistency-check]] (สมมติฐาน/คำถามที่เปิดไว้) | ออกแบบ test case negative ของฟีเจอร์ 01 (กรณีไฟล์ผสม) ให้ครอบคลุมแน่นอนไม่ได้ในตอนนี้ | ทดสอบกรณีไฟล์ที่ดึงข้อความไม่ได้ทั้งไฟล์ (AC-01-03) ไปก่อน รอ threshold จาก [[../../02-design/02-technical/index|02-technical]] แล้วเพิ่ม test case ย่อยกรณีไฟล์ผสม |
| ยังไม่มีตัวอย่างเอกสาร "หลักสูตรใหม่" จริงมายืนยันโครงสร้าง (มีแต่ตัวอย่างหลักสูตรปรับปรุง) | [[../../01-requirements/01-spec/20260812-01-tqf2-consistency-check|tqf2-consistency-check]] (สมมติฐาน/คำถามที่เปิดไว้) | test case การตรวจจับประเภทหลักสูตร/ขอบเขตเนื้อหา (ฟีเจอร์ 01, 03) อาจไม่ครอบคลุมโครงสร้างหลักสูตรใหม่จริง | ใช้ข้อมูลจำลองตามโครงสร้างหลักสูตรปรับปรุงเป็นหลักไปก่อน ปรับ test case เมื่อมีตัวอย่างจริง |
| ยังไม่มีตัวอย่างจริงของภาคผนวกตารางเปรียบเทียบหลักสูตรเดิม-ปรับปรุง | [[../../01-requirements/01-spec/20260812-01-tqf2-consistency-check|tqf2-consistency-check]] (สมมติฐาน/คำถามที่เปิดไว้) | เสี่ยงตรวจสอบผิดพลาด (ตีความรหัสวิชาเดิมในตารางเปรียบเทียบว่าซ้ำซ้อน) โดยยังไม่มี test case ยืนยัน | ตรวจสอบรูปแบบตารางเพิ่มตอนออกแบบเชิงเทคนิคที่ [[../../02-design/02-technical/index|02-technical]] ก่อนสร้าง test case ของ edge case นี้ |
| ยังไม่กำหนดกลไกทางเทคนิคของการทำ retrieval/RAG | [[../../01-requirements/01-spec/20260823-02-criteria-knowledge-base|criteria-knowledge-base]] (สมมติฐาน/คำถามที่เปิดไว้) | ยังทดสอบความถูกต้อง/แม่นยำของการดึงเนื้อหาเกณฑ์มาอ้างอิงในระดับ implementation ไม่ได้ (ฟีเจอร์ 08, 09) | ทดสอบ functional flow แบบ black-box (input/output ตาม AC) ไปก่อน รอ [[../../02-design/02-technical/index|02-technical]] สรุปกลไกแล้วเพิ่ม test case เจาะจง |
| (แก้ไขแล้ว 2026-09-12) เดิมยังไม่กำหนดพฤติกรรมเมื่อแอดมิน "ปฏิเสธ (Reject)" กฎเกณฑ์ที่ AI สกัดมา | [[../../01-requirements/01-spec/20260823-02-criteria-knowledge-base|criteria-knowledge-base]] FR ข้อ 7 (ตอบแล้ว) และ [[acceptance-criteria|acceptance-criteria]] (คำถามเดิมปิดแล้ว) | **แก้ไขแล้ว**: ฟีเจอร์ 07 มี Acceptance Criteria ครอบคลุม flow ปฏิเสธกฎเกณฑ์ครบแล้ว (AC-07-07 ปฏิเสธ → สถานะ "ไม่อนุมัติ" ไม่ถูกลบ พร้อมบันทึกประวัติ, AC-07-08 กลับมาพิจารณาใหม่แล้วอนุมัติ) — เหลือเพียงรอ test case แบบ step-by-step จาก agent `test-case-writer` | เพิ่ม test case อ้างอิง AC-07-07, AC-07-08 (และ AC-07-09 ถึง AC-07-12 ที่เกี่ยวข้องกับลบ/reopen) เมื่อ agent `test-case-writer` ดำเนินการต่อ |
| ยังไม่กำหนดวิธีคำนวณ/ประเมินระดับความมั่นใจ (มั่นใจสูง/กลาง/ต่ำ) ของแชทบอทจากโมเดล AI จริง | [[../../01-requirements/01-spec/20260823-03-advisory-chatbot|advisory-chatbot]] (สมมติฐาน/คำถามที่เปิดไว้) | ทดสอบได้เพียงว่ามีป้ายระดับความมั่นใจแสดงครบทุกคำตอบ (AC-09-03) แต่ทดสอบความถูกต้อง/สมเหตุสมผลของระดับที่แสดงจริงไม่ได้ | ทดสอบ UI/guardrail flow (การแสดงป้ายครบทุกคำตอบ) ก่อน รอกลไกจริงจาก [[../../02-design/02-technical/index|02-technical]] แล้วเพิ่ม test case เจาะจงความถูกต้อง |
| ยังไม่มีข้อมูล performance (ปริมาณเอกสาร/ชุดเกณฑ์พร้อมกันสูงสุด, ความเร็วตอบกลับของแชทบอท) ในทุก spec | [[../../01-requirements/01-spec/20260812-01-tqf2-consistency-check|tqf2-consistency-check]], [[../../01-requirements/01-spec/20260823-02-criteria-knowledge-base|criteria-knowledge-base]], [[../../01-requirements/01-spec/20260823-03-advisory-chatbot|advisory-chatbot]] (หัวข้อ Non-functional Requirements ทุกฉบับ) | ยังวางแผนทดสอบ performance ไม่ได้ในตอนนี้ เพราะไม่มี threshold/เป้าหมายให้ทดสอบเทียบ | เพิ่มหัวข้อ Performance Testing เข้าแผนทดสอบเมื่อ [[../../02-design/02-technical/index|02-technical]]/tech-stack กำหนดเป้าหมายชัดเจนแล้ว |
| ยังไม่กำหนดว่าคำถาม/เนื้อหาที่ผู้ใช้ส่งเข้ามาอยู่นอกขอบเขตฐานความรู้ที่เลือกไว้ AI ควรตอบสนองอย่างไร | [[../../01-requirements/01-spec/20260823-03-advisory-chatbot|advisory-chatbot]] (สมมติฐาน/คำถามที่เปิดไว้) และ [[acceptance-criteria|acceptance-criteria]] (สมมติฐาน/คำถามที่เปิดไว้) | ฟีเจอร์ 09 ยังไม่มี AC/test case ของกรณีคำถามนอกขอบเขต | เพิ่ม AC และ test case เมื่อมีการตัดสินใจเรื่องพฤติกรรมกรณีนอกขอบเขตในอนาคต |
| ฟีเจอร์ 05 (รายงานผลตรวจสอบ) ยังไม่มีรายละเอียดพอสำหรับกำหนด negative/edge case เพิ่มเติม (เช่น รูปแบบการแสดงผลกรณีตรวจสอบแล้วไม่พบจุดไม่สอดคล้องเลย) | [[acceptance-criteria|acceptance-criteria]] (สมมติฐาน/คำถามที่เปิดไว้) | test case ของฟีเจอร์นี้อาจครอบคลุมเฉพาะกรณีพบจุดไม่สอดคล้อง (AC-05-01) ไม่ครอบคลุมทุกรูปแบบการแสดงผล | เพิ่ม AC/test case เมื่อมีรายละเอียดจาก spec/journey ต้นทางชัดเจนขึ้น |
| ยังไม่กำหนดว่าการลบ/แก้ไขเอกสารเดี่ยวๆ ภายในชุดเกณฑ์ (หลังอัปโหลดสะสมไปแล้ว) ทำได้หรือไม่ และทำอย่างไร | [[../../01-requirements/01-spec/20260823-02-criteria-knowledge-base|criteria-knowledge-base]] (สมมติฐาน/คำถามที่เปิดไว้) | ฟีเจอร์ 06 ยังไม่มี test case ครอบคลุม flow ลบ/แก้ไขเอกสารเดี่ยวในชุดเกณฑ์ | เพิ่ม test case เมื่อมีการตัดสินใจเรื่องนี้ในอนาคต |
| ยังไม่กำหนดรูปแบบโครงสร้างข้อมูลของ "กฎเกณฑ์" ที่ AI สกัดมา (structured fields หรือ freeform text) | [[../../01-requirements/01-spec/20260823-02-criteria-knowledge-base|criteria-knowledge-base]] (สมมติฐาน/คำถามที่เปิดไว้) | การออกแบบ test data ของฟีเจอร์ 07/08 อย่างละเอียดอาจต้องปรับเปลี่ยนตามรูปแบบจริงที่เลือกใช้ | ออกแบบ test data ระดับฟิลด์ละเอียดหลังจาก [[../../02-design/02-technical/index|02-technical]] สรุปรูปแบบโครงสร้างข้อมูลแล้ว |
| ยังไม่ยืนยันว่ากลไกการดึงข้อมูล/คำนวณสถิติจากไฟล์ที่แอดมินอัปโหลด (FR ข้อ 7) เป็นแบบอัตโนมัติเต็มรูปแบบ หรือกึ่งอัตโนมัติที่ต้องแอดมินยืนยัน/แก้ไขตัวเลขก่อนเผยแพร่ให้ผู้บริหารเห็น | [[../../01-requirements/01-spec/20260904-04-executive-curriculum-dashboard|executive-curriculum-dashboard]] (สมมติฐาน/คำถามที่เปิดไว้) และ [[acceptance-criteria|acceptance-criteria]] (สมมติฐาน/คำถามที่เปิดไว้) | test case ของฟีเจอร์ 11 ใน [[test-cases/11-executive-view-dashboard|11-executive-view-dashboard]] ครอบคลุมได้เฉพาะกรณีระบบดึง/คำนวณสถิติถูกต้องอัตโนมัติตาม AC-11-01 ยังไม่ครอบคลุมกรณีแอดมินต้องตรวจ/แก้ไขตัวเลขก่อนเผยแพร่ | เพิ่ม AC/test case เมื่อมีการตัดสินใจเรื่องกลไกดึงข้อมูล/คำนวณสถิติในอนาคต |
| ยังไม่ยืนยันกลไก Authentication/บัญชีผู้ใช้ของบทบาท "ผู้บริหาร" (บัญชีแยกต่างหาก หรือ SSO/ระบบเดียวกับผู้ใช้กลุ่มอื่น) | [[../../01-requirements/01-spec/20260904-04-executive-curriculum-dashboard|executive-curriculum-dashboard]] (หัวข้อ Non-functional Requirements และสมมติฐาน/คำถามที่เปิดไว้) | Authorization Testing ของฟีเจอร์ 11 ทดสอบได้เพียงระดับ UI/flow ว่าไม่มี element ให้แก้ไข/อัปโหลด/อนุมัติ/comment ตาม AC-11-03 (read-only) เท่านั้น ยังทดสอบกลไกยืนยันตัวตน/ล็อกอินจริงของบทบาทผู้บริหารไม่ได้ | เพิ่ม test case ยืนยันตัวตน/สิทธิ์เข้าถึงเมื่อ [[../../02-design/02-technical/index|02-technical]] กำหนดกลไก Authentication จริงแล้ว |

## 10. Deliverables

- ไฟล์ test case แบบ step-by-step ต่อฟีเจอร์ครบทั้ง 11 ฟีเจอร์ (ฟีเจอร์ 01-11) ที่ [[test-cases/index|test-cases]] — ฟีเจอร์ 12-13 และส่วนขยายของฟีเจอร์ 07 (AC-07-07 ถึง AC-07-12) มี Acceptance Criteria ครบแล้ว แต่ยังไม่มี test case รอ agent `test-case-writer` ดำเนินการต่อ
- ผลการทดสอบ (pass/fail) และรายงานบั๊กของทุกรอบทดสอบ บันทึกไว้ที่ [[../02-test-result/index|02-test-result]]
- สรุปผลทดสอบต่อ Backlog Item เทียบกับ Exit Criteria ในหัวข้อ 8 ก่อนปิดรอบทดสอบแต่ละครั้ง

## สมมติฐาน / คำถามที่เปิดไว้

- Test Environment (infrastructure จริงที่จะใช้ทดสอบ) ยังไม่กำหนด — รอข้อมูลจากขั้นตอนออกแบบเชิงเทคนิคที่ [[../../02-design/02-technical/index|02-technical]]
- บทบาทและความรับผิดชอบ (Roles & Responsibilities) ของการทดสอบยังไม่กำหนด — รอข้อมูลเพิ่มเติมจากผู้ใช้
- ผู้รับผิดชอบ User Acceptance Testing (UAT) ยังไม่กำหนด — รอข้อมูลเพิ่มเติมจากผู้ใช้
- กำหนดการทดสอบ (timeline) ยังไม่กำหนด — รอข้อมูลเพิ่มเติมจากผู้ใช้
- ไฟล์ [[test-cases/index|test-cases]] มีครบแล้วสำหรับฟีเจอร์ 01-11 (รวมฟีเจอร์ 10-11) — ฟีเจอร์ 12-13 (Backlog ลำดับ 05) และส่วนขยายของฟีเจอร์ 07 (AC-07-07 ถึง AC-07-12) ปัจจุบันมี Acceptance Criteria ครบแล้วใน [[acceptance-criteria|acceptance-criteria]] แต่ยังไม่มี test case แบบ step-by-step — รอ agent `test-case-writer` สร้างต่อจากนี้
- รายการความเสี่ยงในหัวข้อ 9 ล้วนมาจากสมมติฐาน/คำถามที่เปิดไว้ในเอกสาร spec ต้นทางที่ยังไม่ได้รับการยืนยัน — เมื่อมีการตัดสินใจเรื่องใดแล้ว ให้อัปเดตตารางความเสี่ยงและเพิ่ม AC/test case ที่เกี่ยวข้องตามลิงก์อ้างอิงในแต่ละแถว

---
[[index|01-test-plan]] · [[acceptance-criteria|acceptance-criteria]] · [[test-cases/index|test-cases]] · [[../../01-requirements/backlog|backlog]]
