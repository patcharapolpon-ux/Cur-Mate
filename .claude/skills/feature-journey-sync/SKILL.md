---
name: feature-journey-sync
description: ตรวจสอบความสอดคล้องและความเป็นปัจจุบันของข้อมูลตลอดทั้งสาย Requirement (docs/01-requirements/01-spec) → Backlog (docs/01-requirements/backlog.md) → Feature List (docs/01-requirements/02-plan/feature-list.md, จัดลำดับความสำคัญแบบ MoSCoW) → User Journey (docs/02-design/01-prototypes, Mermaid diagram + mapping กลับไปยัง requirement) → Prototype (docs/02-design/01-prototypes/*-prototype-v*/ ไฟล์ .html mockup + manifest) → Acceptance Criteria (docs/03-testing/01-test-plan/acceptance-criteria.md) → Test Plan (docs/03-testing/01-test-plan/test-plan.md) → Test Case (docs/03-testing/01-test-plan/test-cases/*.md) ของ Curmate เมื่อมีการแก้ไข/ปรับปรุงข้อมูล ณ ชั้นใดชั้นหนึ่ง (รวมถึงการแก้ไข/อัปเดต prototype เดิม) จะตรวจจับส่วนที่ตกหล่นหรือล้าสมัยแล้วปรับปรุงให้สอดคล้องกันทั้งสาย รวมถึงสร้าง/อัปเดต Feature List และ User Journey ใหม่จาก backlog ใช้เมื่อผู้ใช้ขอให้ "ทำ feature list" "แตก backlog เป็นฟีเจอร์" "สร้าง/อัปเดต user journey" "ตรวจสอบความสอดคล้องของ backlog" "เช็คว่า feature list กับ user journey อัปเดตตาม requirement ล่าสุดหรือยัง" "เช็คว่าเอกสารทดสอบยังตรงกับ requirement/backlog ล่าสุดหรือไม่" "เช็คว่า prototype ที่แก้ไปยังตรงกับ requirement/feature list/user journey/เอกสารทดสอบหรือไม่" หรือ "sync ทั้งสายตั้งแต่ requirement ถึง test case"
---

# Feature & Journey Sync

Skill นี้ดูแลความสอดคล้องและความเป็นปัจจุบันของเอกสารตลอดทั้ง 8 ชั้นของ pipeline โปรเจกต์ Curmate:

**Requirement (01-spec) → Backlog → Feature List (MoSCoW) → User Journey (Mermaid diagram + mapping กลับไปยัง requirement) → Prototype (ไฟล์ .html mockup + manifest) → Acceptance Criteria (Given-When-Then) → Test Plan (กลยุทธ์ทดสอบระดับโปรเจกต์) → Test Case (step-by-step ต่อฟีเจอร์)**

ไม่ว่าการเปลี่ยนแปลงจะเริ่มจากชั้นไหน (เช่น แก้ไข spec เดิม, เพิ่ม requirement ใหม่, แก้ backlog มือ, แก้ไข/ปรับปรุง prototype เดิม, แก้ Acceptance Criteria/Test Case โดยตรง, หรือไม่มีการเปลี่ยนแปลงเลยแต่ต้องการตรวจสุขภาพเอกสาร) skill นี้ตรวจสอบทั้งสายแล้วมอบหมายให้ sub agent เฉพาะทางแก้ไขให้สอดคล้องกันและเป็นล่าสุดเสมอ ตาม `CLAUDE.md`

**ข้อควรรู้เรื่องขอบเขต**: skill นี้มีหน้าที่ *ซ่อมความสอดคล้อง* ของเอกสารที่มีอยู่แล้วทั้ง 8 ชั้น (รวมถึง manifest/footer ของ Prototype และ Acceptance Criteria/Test Plan/Test Case ที่ล้าสมัยเพราะต้นน้ำเปลี่ยน) และสร้าง/อัปเดต Feature List กับ User Journey ใหม่จาก backlog เท่านั้น ส่วนการ**สร้าง/แก้ไข Prototype ทั้งชุด (หน้าจอใหม่ หรือปรับ layout/เนื้อหาหน้าจอเดิม)**เป็นหน้าที่ของ skill `prototype-builder` และการ**สร้าง Acceptance Criteria/Test Plan/Test Case ใหม่ทั้งชุดให้ฟีเจอร์ที่เพิ่งถูกแตกออกมา**เป็นหน้าที่ของ skill `test-design-builder` (ทั้งสอง skill ต้องมีขั้นตอนถามสโคป/ยืนยันแผนกับผู้ใช้ก่อนเสมอ) — ถ้าตรวจพบว่ามีฟีเจอร์ใหม่/เปลี่ยนแปลงมากจนควรมี prototype หรือชุดทดสอบใหม่ทั้งชุด ให้ระบุไว้ในรายงานสรุปข้อ 6 ว่าควรรัน `prototype-builder`/`test-design-builder` ต่อ ไม่ต้องพยายามสร้างของใหม่ทั้งชุดเอง

ทุกจุดที่ไม่แน่ใจหรือข้อมูลไม่พอ ให้ถามผู้ใช้ก่อนเสมอ — **ห้ามเดาแทนผู้ใช้ในจุดที่กระทบผลลัพธ์เอกสารอย่างมีนัยสำคัญ** ทุกคำถามต้องมีตัวเลือกอย่างน้อย 3 แนวทางเสมอ พร้อมเหตุผล ข้อดี ข้อเสีย และคำแนะนำอันดับแรก (ผู้ใช้ยังเลือก "Other" เพิ่มเองได้เสมออยู่แล้ว)

## ขั้นตอน

### 1. ตรวจสอบความสอดคล้องทั้งสายก่อนเสมอ (audit-first)

เรียก Agent tool โดยระบุ `subagent_type: "backlog-consistency-auditor"` (ไม่ต้องส่ง context พิเศษ เพราะ agent นี้สำรวจไฟล์เองทั้งหมด) เพื่อรับรายงานปัญหาที่พบตลอดทั้ง 8 ชั้น (Requirement ↔ Backlog ↔ Feature List ↔ User Journey ↔ Prototype ↔ Acceptance Criteria ↔ Test Plan ↔ Test Case รวมถึงลิงก์เสียและความไม่สอดคล้องภายในไฟล์ journey เอง)

ทำขั้นตอนนี้เสมอไม่ว่าผู้ใช้จะขอ "ตรวจสอบความสอดคล้อง" ตรงๆ หรือขอแค่ "สร้าง feature list ใหม่" ก็ตาม เพื่อให้แน่ใจว่าของเดิมยังไม่มีจุดที่ค้างอยู่ก่อนจะเพิ่มของใหม่ทับเข้าไป

### 2. สำรวจข้อมูลต้นทางเพิ่มเติมเพื่อวิเคราะห์การเปลี่ยนแปลงใหม่

อ่านให้ครบ (บางส่วนอาจอ่านซ้ำกับที่ agent ในข้อ 1 อ่านไปแล้ว แต่คุณต้องอ่านเองด้วยเพื่อวิเคราะห์และตัดสินใจ ไม่ใช่พึ่งรายงานอย่างเดียว):

- `docs/01-requirements/backlog.md`
- ไฟล์ทั้งหมดใน `docs/01-requirements/01-spec/*.md` (ยกเว้น `index.md`) — โดยเฉพาะหัวข้อ Functional Requirements, ขอบเขต, และ Priority
- `docs/01-requirements/02-plan/feature-list.md` (ถ้ามีอยู่แล้ว)
- ไฟล์ journey เดิมใน `docs/02-design/01-prototypes/*-user-journey-*.md` (ถ้ามี)
- ถ้ารายงานจากข้อ 1 มีปัญหาเกี่ยวกับชั้น Prototype ให้เปิดอ่านเพิ่มด้วย: manifest `index.md` ของทุกโฟลเดอร์ `docs/02-design/01-prototypes/*-prototype-v*/` ที่เกี่ยวข้อง, footer dev-note ของไฟล์ `.html` ที่ถูกรายงานว่ามีปัญหา และ `docs/02-design/01-prototypes/index.md`
- ถ้ารายงานจากข้อ 1 มีปัญหาเกี่ยวกับชั้น Acceptance Criteria/Test Plan/Test Case ให้เปิดอ่านเพิ่มด้วย: `docs/03-testing/01-test-plan/acceptance-criteria.md`, `docs/03-testing/01-test-plan/test-plan.md`, ไฟล์ `docs/03-testing/01-test-plan/test-cases/*.md` ที่เกี่ยวข้อง และ `docs/03-testing/01-test-plan/test-cases/index.md` (ถ้ามี)

### 3. วิเคราะห์งานที่ต้องทำ — แบ่งเป็น 2 ประเภท

**ประเภท ก. แก้ไขความไม่สอดคล้อง/ล้าสมัย (จากรายงานข้อ 1)**

สำหรับแต่ละปัญหาในรายงาน ให้จัดกลุ่มตามชั้นที่ต้องแก้ (Requirement/Backlog หรือ Feature List หรือ User Journey หรือ Prototype หรือ Acceptance Criteria หรือ Test Plan หรือ Test Case) และตัดสินใจแนวทางแก้ไข — กรณีมีมากกว่า 1 ทางเลือกที่สมเหตุสมผล (เช่น "ลิงก์เสียเพราะ spec ถูกย้ายไป archived" อาจแก้ได้ทั้งอัปเดตลิงก์ให้ชี้ไป archived หรือลบ reference ทิ้ง) ให้ถามผู้ใช้ก่อนตามกฎ 3 ทางเลือก

ปัญหาที่อยู่ในชั้น Prototype แบ่งเป็น 2 แบบที่ต้องจัดการต่างกัน:
- **จุดที่อ้างอิงผิด/ล้าสมัยในข้อความเดิม** (เช่น manifest อ้างฟีเจอร์/journey/FR ที่ไม่ตรงกับปัจจุบัน, หน้าจอ `.html` ที่มีอยู่จริงแล้วแต่ยังไม่ถูกบันทึกในตาราง Screens, footer dev-note ไม่ตรงกับ manifest) → มอบหมายให้ `prototype-writer` แก้ไขได้ตามข้อ 5 ด้านล่าง เพราะเป็นการซ่อมข้อความอ้างอิงของเดิม ไม่กระทบ layout/เนื้อหาหน้าจอ
- **ฟีเจอร์ที่มี user journey แล้วแต่ยังไม่มี prototype รองรับเลย หรือต้องเพิ่ม/แก้ layout หน้าจอจริง** → **ไม่ต้องสร้าง/แก้เอง** ให้บันทึกไว้เพื่อแนะนำผู้ใช้ในรายงานข้อ 6 ว่าควรรัน skill `prototype-builder` ต่อ (เพราะการออกแบบ/แก้ไขหน้าจอต้องผ่านขั้นตอนเสนอแผน/ยืนยันของ skill นั้นเสมอ)

ปัญหาที่อยู่ในชั้น Acceptance Criteria/Test Plan/Test Case แบ่งเป็น 2 แบบที่ต้องจัดการต่างกัน:
- **จุดที่อ้างอิงต้นน้ำผิด/ล้าสมัย** (เช่น AC อ้าง FR ที่ไม่มีแล้ว, test case อ้าง AC ที่ไม่มีแล้ว, test-plan ยังไม่ครอบคลุม backlog item ที่มีอยู่แล้ว) → แก้ไขให้สอดคล้องตามข้อ 5 ด้านล่างได้เลย เพราะเป็นการซ่อมของเดิมให้ตรงกับต้นน้ำ ไม่ใช่การออกแบบชุดทดสอบใหม่
- **ฟีเจอร์/backlog item ที่ยังไม่มีเอกสารทดสอบเลยทั้งชุด** (เช่น "ยังไม่มีเอกสาร Acceptance Criteria สำหรับฟีเจอร์ใดเลย") → **ไม่ต้องสร้างเอง** ให้บันทึกไว้เพื่อแนะนำผู้ใช้ในรายงานข้อ 6 ว่าควรรัน skill `test-design-builder` ต่อ (เพราะการออกแบบสถานการณ์ทดสอบใหม่ทั้งชุดต้องผ่านขั้นตอนถามสโคป/ยืนยันแผนของ skill นั้น)

**ประเภท ข. แตกฟีเจอร์/journey ใหม่จากการเปลี่ยนแปลงล่าสุด**

- จัดกลุ่ม Functional Requirement ที่เกี่ยวข้องกันให้เป็น "ฟีเจอร์" ระดับที่ผู้ใช้งานพูดถึงได้เป็นชิ้นเดียว
- สำหรับฟีเจอร์ที่มีอยู่แล้ว เทียบว่ามีการเปลี่ยนแปลงจาก spec ล่าสุดหรือไม่ (ขอบเขตเปลี่ยน, FR ใหม่ถูกเพิ่ม) ถ้าเปลี่ยน → เตรียมอัปเดตฟีเจอร์นั้น
- ร่างระดับ MoSCoW เบื้องต้นจากข้อมูลที่มี (Priority "สูง" ใน spec มักสอดคล้องกับ `Must have`, ฟีเจอร์ที่เป็นเงื่อนไขจำเป็นของฟีเจอร์ Must have อื่นก็มักเป็น Must have ด้วย, ฟีเจอร์เสริมที่ระบุไว้ว่ายังไม่ยืนยัน priority มักต้องถามผู้ใช้)
- พิจารณาว่าฟีเจอร์ใดต้องมี/อัปเดต User Journey (โดยเฉพาะฟีเจอร์ `Must have`/`Should have` ที่มีหลายขั้นตอนต่อเนื่องหรือมีผู้ใช้มากกว่า 1 บทบาท) จัดกลุ่มตาม persona/ลำดับเหตุการณ์ต่อเนื่องแทนที่จะทำ 1 journey ต่อ 1 ฟีเจอร์เสมอไป

### 4. ถามคำถามชี้แจงจุดที่ไม่แน่ใจ

สำหรับทุกจุดที่กำกวมหรือขาดข้อมูลในทั้งประเภท ก. และ ข. ใช้ `AskUserQuestion` เช่น:

- ระดับ MoSCoW ของฟีเจอร์ที่ spec ยังไม่ยืนยัน priority ชัดเจน
- การจัดกลุ่ม FR เป็นฟีเจอร์ หรือการจัดกลุ่มฟีเจอร์เป็น journey — กรณีแบ่งได้มากกว่า 1 แบบสมเหตุสมผล
- แนวทางแก้ปัญหาความไม่สอดคล้องที่มีมากกว่า 1 ทางเลือก (เช่น ลิงก์เสีย, ฟีเจอร์ที่ MoSCoW ขัดกับ priority ของ spec, journey ที่อ้าง FR ซึ่งไม่ตรงกับ spec ปัจจุบันอีกต่อไป, manifest prototype ที่อ้างอิงฟีเจอร์/journey ที่เปลี่ยนชื่อไปแล้ว, AC/test case ที่อ้างอิงฟีเจอร์/backlog item ที่เปลี่ยนชื่อหรือถูกยกเลิกไปแล้ว)
- กรณีฟีเจอร์/journey เดิมมีการเปลี่ยนแปลงจนของเดิมอาจไม่เหมาะสมอีกต่อไป

**กฎสำคัญ: ทุกคำถามที่ถามต้องมีตัวเลือกอย่างน้อย 3 แนวทางเสมอ** พร้อมคำอธิบายเหตุผล ข้อดี ข้อเสีย ของแต่ละแนวทาง และให้ตัวเลือกที่แนะนำมาเป็นอันดับแรกพร้อมระบุว่าแนะนำเพราะอะไร

ถามเป็นชุดๆ จนกว่าจะมีข้อมูลพอดำเนินการทั้งหมดได้อย่างสมบูรณ์

### 5. มอบหมายให้ sub agent เขียน/แก้ไขเอกสารจริง ตามชั้นที่ต้องเปลี่ยน

**อย่าเขียนหรือแก้ไขไฟล์ใดๆ เองใน skill นี้** ให้เรียก Agent tool มอบหมายงานตามชั้น:

- แก้ไข `docs/01-requirements/01-spec/*.md` หรือ `docs/01-requirements/backlog.md` → `subagent_type: "requirement-writer"` (ระบุให้ชัดว่าเป็นการแก้ไขเพื่อความสอดคล้อง ไม่ใช่ requirement ใหม่ทั้งหมด พร้อมอ้างอิงปัญหาที่ตรวจพบจากข้อ 1 ถ้ามี)
- สร้าง/แก้ไข `docs/01-requirements/02-plan/feature-list.md` → `subagent_type: "feature-list-writer"`
- สร้าง/แก้ไขไฟล์ user journey ใน `docs/02-design/01-prototypes/` → `subagent_type: "user-journey-writer"` (เรียกทีละ journey เพื่อให้ RUNNING_NO ไม่ชนกัน)
- แก้ไขข้อความอ้างอิง/wikilink ใน manifest `index.md` หรือ footer dev-note ของไฟล์ `.html` ในโฟลเดอร์ `docs/02-design/01-prototypes/*-prototype-v*/` (เฉพาะจุดที่ล้าสมัย/อ้างอิงผิด ตามที่ตัดสินใจไว้ในข้อ 3 — **ห้ามใช้เพื่อสร้างหน้าจอใหม่หรือแก้ layout**) → `subagent_type: "prototype-writer"` (ระบุให้ชัดว่าเป็นการแก้ไขเพื่อความสอดคล้องเท่านั้น พร้อมอ้างอิงปัญหาที่ตรวจพบจากข้อ 1 — เรียก**ทีละโฟลเดอร์เวอร์ชันเท่านั้น** ถ้ามีมากกว่า 1 เวอร์ชันที่ต้องแก้ ห้ามเรียกขนานกัน)
- แก้ไข `docs/03-testing/01-test-plan/acceptance-criteria.md` (เฉพาะจุดที่ล้าสมัย/อ้างอิงผิด ตามที่ตัดสินใจไว้ในข้อ 3 ประเภท ก.) → `subagent_type: "acceptance-criteria-writer"` (ระบุให้ชัดว่าเป็นการแก้ไขเพื่อความสอดคล้อง พร้อมอ้างอิงปัญหาที่ตรวจพบจากข้อ 1)
- แก้ไข `docs/03-testing/01-test-plan/test-plan.md` (เช่น เพิ่ม backlog item ที่ขาดในตาราง scope, แก้ wikilink เสียในตาราง Risk Management) → `subagent_type: "test-plan-writer"`
- แก้ไขไฟล์ `docs/03-testing/01-test-plan/test-cases/*.md` ที่ล้าสมัย/อ้างอิงผิด → `subagent_type: "test-case-writer"` (เรียก**ทีละไฟล์/ฟีเจอร์เท่านั้น เรียงลำดับ ห้ามเรียกขนานกัน** เพราะทุกครั้งต้องแก้ manifest `test-cases/index.md` ไฟล์เดียวกัน)

ลำดับการเรียก: แก้ชั้น Requirement/Backlog ก่อน (ถ้ามี) → ตามด้วย Feature List → ตามด้วย User Journey → ตามด้วย Prototype → ตามด้วย Acceptance Criteria → ตามด้วย Test Plan → ตามด้วย Test Case เสมอ เพื่อให้ชั้นที่อยู่ปลายน้ำอ้างอิงข้อมูลที่อัปเดตแล้วของชั้นต้นน้ำ **ห้ามเรียก agent มากกว่า 1 ตัวพร้อมกันแบบขนานถ้างานของมันแก้ไฟล์เดียวกัน** (เช่น หลาย journey agent ที่ต่างก็จะแก้ `feature-list.md`, หลาย prototype-writer ที่ต่างก็จะแก้ `01-prototypes/index.md`, หรือหลาย test-case-writer ที่ต่างก็จะแก้ `test-cases/index.md`) — เรียกเรียงลำดับทีละตัวเสมอ

### 6. รายงานผลกลับผู้ใช้

สรุปให้ผู้ใช้ทราบแบบกระชับ แยกเป็น 2 ส่วน:

- **สิ่งที่แก้ไขให้สอดคล้อง/เป็นล่าสุด** — รายการปัญหาที่พบจากข้อ 1 พร้อมระบุว่าแก้แล้วหรือคงไว้ตามเดิมเพราะเหตุใด (ครอบคลุมทั้ง 8 ชั้น)
- **สิ่งที่สร้าง/อัปเดตใหม่** — พร้อมลิงก์ไฟล์ (markdown link relative path) ไปยัง `docs/01-requirements/backlog.md` (ถ้าแก้), `docs/01-requirements/02-plan/feature-list.md`, ไฟล์ user journey ทุกไฟล์ที่สร้าง/แก้ไข, manifest/ไฟล์ `.html` ของ prototype ที่แก้ไข (ถ้ามี), `docs/03-testing/01-test-plan/acceptance-criteria.md`/`test-plan.md`/ไฟล์ `test-cases/*.md` ที่แก้ไข (ถ้ามี), และไฟล์ log ของวันนี้
- **สิ่งที่แนะนำให้ทำต่อ** — ถ้าพบฟีเจอร์ที่มี user journey แล้วแต่ยังไม่มี prototype รองรับ หรือ prototype ที่ต้องแก้ layout/เนื้อหาจริง ให้ระบุรายชื่อและแนะนำให้รัน skill `prototype-builder` ต่อ และถ้าพบฟีเจอร์/backlog item ที่ยังไม่มีเอกสารทดสอบเลยทั้งชุด (ตามที่บันทึกไว้ในข้อ 3) ให้ระบุรายชื่อและแนะนำให้รัน skill `test-design-builder` ต่อ

## ข้อควรจำ

- เนื้อหาเอกสารทั้งหมดต้องเป็นภาษาไทย ตาม `CLAUDE.md` (ยกเว้นชื่อระดับ MoSCoW, Given/When/Then, mermaid syntax และ slug/technical term)
- ห้ามลบเอกสารหรือลบแถว/หัวข้อฟีเจอร์/สถานการณ์ทดสอบ/โฟลเดอร์เวอร์ชัน prototype เดิม ให้เปลี่ยนสถานะหรือทำเครื่องหมายล้าสมัยแทนเสมอ (ดูรายละเอียดใน agent `feature-list-writer`, `requirement-writer`, `prototype-writer`, `acceptance-criteria-writer`, `test-plan-writer`, `test-case-writer`)
- การอ้างอิงข้ามเอกสารใน `.md` ของ vault ใช้ Obsidian wikilink แบบ relative path เสมอ
- Feature List ต้องมีตารางสรุปด้านบนและคำอธิบายรายฟีเจอร์ด้านล่างเสมอ จัดลำดับความสำคัญด้วย MoSCoW
- User Journey ต้องมี Mermaid diagram ก่อน แล้วตามด้วยคำอธิบายเรียงตามลำดับ diagram และตาราง mapping กลับไปยัง requirement แต่ละข้อเสมอ
- agent `backlog-consistency-auditor` เป็น read-only เสมอ ห้ามคาดหวังให้มันแก้ไฟล์ — การแก้ไขทุกครั้งต้องผ่าน `requirement-writer` / `feature-list-writer` / `user-journey-writer` / `prototype-writer` / `acceptance-criteria-writer` / `test-plan-writer` / `test-case-writer` เท่านั้น
- **ห้ามใช้ skill นี้สร้างหน้าจอ prototype ใหม่หรือแก้ layout/เนื้อหาหน้าจอเดิม** — ทำได้เฉพาะการซ่อมข้อความอ้างอิง/wikilink ใน manifest และ footer dev-note ที่ล้าสมัยเท่านั้น การสร้าง/แก้ไขหน้าจอจริงต้องแนะนำให้ผู้ใช้ไปรัน skill `prototype-builder` แทน
- **ห้ามใช้ skill นี้สร้าง Acceptance Criteria/Test Plan/Test Case ใหม่ทั้งชุดสำหรับฟีเจอร์ใหม่** — ทำได้เฉพาะการซ่อมจุดที่อ้างอิงต้นน้ำผิด/ล้าสมัยในเอกสารทดสอบที่มีอยู่แล้วเท่านั้น การออกแบบชุดทดสอบใหม่ทั้งชุดต้องแนะนำให้ผู้ใช้ไปรัน skill `test-design-builder` แทน
