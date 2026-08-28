---
name: technical-design-orchestrator
description: รัน pipeline การออกแบบเชิงเทคนิคของ Curmate ต่อเนื่องในคำสั่งเดียว ตั้งแต่ High-Level Architecture → Database Schema + API Spec → Detailed Design → ตรวจสอบความครอบคลุมของ Non-functional Requirements (NFR) โดยไม่ต้องเรียก skill architecture-builder, api-database-design-builder, และ detailed-design-builder แยกทีละขั้นตอนเอง รับกรณีเริ่มจาก architecture ใหม่ทั้งหมด หรือระบุจุดเริ่มต้นกลางสายก็ได้ (เช่น มี architecture อยู่แล้ว อยากรันต่อจาก database schema/api spec, หรือมี database schema/api spec อยู่แล้ว อยากรันต่อเฉพาะ detailed design + ตรวจ NFR) รวบรวมคำถามชี้แจงของทุกชั้นเป็นชุดเดียวและขอยืนยันแผนทั้งหมดครั้งเดียวก่อนเริ่ม จากนั้นไล่เรียก sub agent ทีละชั้นต่อเนื่องจนจบโดยไม่หยุดถามซ้ำระหว่างทาง ปิดท้ายด้วยรายงานผลตรวจสอบ NFR แบบเต็ม ใช้เมื่อผู้ใช้ขอให้ "ทำ architecture ยัน detailed design ในทีเดียว" "orchestrate งานออกแบบเชิงเทคนิคทั้งสายให้ครบ" "ทำ architecture, api spec, database schema, detailed design ต่อเนื่องกันแล้วรีวิว non-functional requirement ด้วย" "ไม่ต้องเรียกทีละสกิลของ 02-technical ทำให้ครบทุกชั้นแล้วเช็ค NFR ท้ายสุด" หรือ "รัน architecture-builder, api-database-design-builder, detailed-design-builder ต่อกันให้จบในรอบเดียวพร้อมรีวิว NFR"
---

# Technical Design Orchestrator

Skill นี้เป็น **orchestrator** ที่รวมงานของ 3 skill เดิม (`architecture-builder`, `api-database-design-builder`, `detailed-design-builder`) ให้ทำงานต่อเนื่องกันในคำสั่งเดียว แล้วปิดท้ายด้วยขั้นตอนตรวจสอบที่ยังไม่มี skill ใดครอบคลุม ครอบคลุม 4 ชั้นของสาย `docs/02-design/02-technical/`:

**High-Level Architecture → Database Schema + API Spec → Detailed Design → ตรวจสอบความครอบคลุมของ Non-functional Requirements (NFR)**

เหตุผลที่ต้องเป็น skill (ไม่ใช่ sub agent): ใน Claude Code มีแต่ skill (main loop) เท่านั้นที่เรียก Agent tool ไล่ทีละ sub agent ได้ ส่วน sub agent เองไม่มีสิทธิ์เรียก sub agent ตัวอื่นต่อ — ดังนั้น skill นี้จึงทำหน้าที่ไล่เรียก **agent เขียนไฟล์ที่มีอยู่แล้วทั้ง 4 ตัว** (`high-level-architecture-writer`, `database-schema-writer`, `api-spec-writer`, `detailed-design-writer`) ตามลำดับ แล้วปิดท้ายด้วย agent ตรวจสอบตัวใหม่ 1 ตัว (`nfr-coverage-auditor`, read-only ไม่เขียนไฟล์)

**ขอบเขตที่ไม่ครอบคลุม**:
- **Tech Stack** — ไม่อยู่ในสายนี้ (เอกสารนี้ผูกมัดกับ technical stack จริง ต่างจาก 4 เอกสาร conceptual ในสโคปนี้) ถ้าผู้ใช้ต้องการเลือกเทคโนโลยีจริงด้วย ให้แนะนำรัน skill `tech-stack-builder` แยกต่างหาก (ก่อนหรือหลัง pipeline นี้ก็ได้ — `tech-stack.md` เป็นข้อมูลเสริมไม่บังคับสำหรับทั้ง 4 ชั้นในสโคปนี้)
- **Requirement/Backlog/Feature List/User Journey** (สาย `01-requirements` และ user journey ใน `01-prototypes`) — เป็นข้อมูลต้นทางที่ pipeline นี้ต้อง**มีอยู่แล้ว**เท่านั้น ไม่ได้สร้าง/แก้ไขในสโคปนี้ ถ้ายังไม่มีให้แนะนำรัน skill `requirement-intake`/`feature-journey-sync` หรือ `pipeline-orchestrator` ก่อน
- **Prototype, Acceptance Criteria, Test Plan, Test Case** — อยู่คนละสายนอกขอบเขตนี้
- **การซ่อมความไม่สอดคล้องของเอกสารเดิมที่ไม่มีการเปลี่ยนแปลงใหม่** — ถ้าผู้ใช้แค่อยากเช็คว่าเอกสาร 4 ชั้นนี้ยังตรงกับ requirement/feature-list/journey ปัจจุบันหรือไม่โดยไม่มีการเปลี่ยนแปลงใหม่ ให้ใช้ skill `feature-journey-sync` แทน (skill นี้ใช้เมื่อมีการสร้าง/ต่อยอดเอกสารใหม่ที่ต้องไหลผ่านทุกชั้นจนจบพร้อมรีวิว NFR)
- **อย่าเรียก agent `backlog-consistency-auditor` จาก skill นี้** — สงวนไว้เฉพาะ skill `feature-journey-sync` เท่านั้น

ทุกจุดที่ไม่แน่ใจหรือข้อมูลไม่พอ ให้ถามผู้ใช้ก่อนเสมอ — **ห้ามเดาแทนผู้ใช้ในจุดที่กระทบผลลัพธ์เอกสารอย่างมีนัยสำคัญ** **ข้อแตกต่างสำคัญจาก skill อื่น**: ที่นี่ต้อง **รวบรวมคำถามชี้แจงของทุกชั้นที่เกี่ยวข้องเป็นชุดเดียว แล้วถามครั้งเดียวก่อนเริ่มลงมือ** (ไม่ใช่ถามแยกทีละชั้นระหว่างทาง) และเมื่อผู้ใช้ยืนยันแผนรวมแล้ว ให้ไล่เรียก agent ต่อเนื่องจนจบโดย**ไม่หยุดถามซ้ำอีก** ทุกคำถามเลือกทาง (ไม่ใช่คำถามยืนยัน) ต้องมีตัวเลือกอย่างน้อย 3 แนวทางเสมอ พร้อมเหตุผล ข้อดี ข้อเสีย และคำแนะนำอันดับแรก (ผู้ใช้ยังเลือก "Other" เพิ่มเองได้เสมออยู่แล้ว)

**ขั้นตอนตรวจสอบ NFR ท้ายสุดเป็น read-only เสมอ**: agent `nfr-coverage-auditor` ไม่แก้ไขไฟล์ใดๆ ทั้งสิ้น จึงไม่ต้องขอยืนยันแผนแยกสำหรับขั้นนี้ — รวมไว้เป็นส่วนหนึ่งของแผนรวมในขั้นตอนที่ 5 (ระบุแค่ว่าจะรัน ไม่ต้องระบุรายละเอียดเนื้อหาที่จะ "เขียน" เพราะไม่มีการเขียนไฟล์)

## ขั้นตอน

### 1. กำหนดจุดเริ่มต้น (entry point)

ถ้าคำขอของผู้ใช้ยังไม่ชัดเจน ให้ถามด้วย `AskUserQuestion` ว่าจะเริ่มจากชั้นไหน:

- **ทั้ง 4 ชั้นตั้งแต่ High-Level Architecture** (แนะนำถ้ายังไม่เคยทำเอกสารเชิงเทคนิคมาก่อน) — ทำครบทุกชั้นตั้งแต่ขั้นตอน 3
- **มี High-Level Architecture อยู่แล้ว อยากรันต่อจาก Database Schema + API Spec** — ข้ามการวิเคราะห์ component/actor ใหม่ ไปเริ่มขั้นตอน 4
- **มี Database Schema + API Spec อยู่แล้ว อยากรันต่อเฉพาะ Detailed Design + ตรวจ NFR** — ข้ามไปขั้นตอน 5

ไม่ว่าจะเลือกจุดเริ่มต้นใด **ขั้นตอนตรวจสอบ NFR (agent `nfr-coverage-auditor`) จะรันเสมอเป็นขั้นตอนสุดท้าย** เพราะเป็นการตรวจสอบเอกสารทั้งหมดที่มีอยู่จริง ณ ตอนนั้น ไม่ผูกกับจุดเริ่มต้นที่เลือก

### 2. ตรวจไฟล์เดิมและไฟล์ต้นทางก่อนเสมอ (existing-first + prerequisite check)

- Glob หา `docs/02-design/02-technical/high-level-architecture.md`, `database-schema.md`, `api-spec.md`, `detailed-design.md`, `tech-stack.md`
- ไฟล์ใดมีอยู่แล้ว เปิดอ่านทั้งไฟล์เพื่อรู้ว่ามีอะไรถูกบันทึกไว้แล้วบ้าง (จะได้ต่อยอด ไม่ใช่เขียนซ้ำ/ขัดแย้งของเดิม)
- ถ้ามี `tech-stack.md` เปิดอ่านทั้งไฟล์แล้วดึงลักษณะเชิงสถาปัตยกรรมเชิงแนวคิดไว้ใช้ประกอบการวิเคราะห์ในขั้นตอน 3-5 (แปลงเป็นภาษาแนวคิดเสมอ ไม่ใช่ชื่อเทคโนโลยีจริง — วิธีเดียวกับที่ระบุไว้ในแต่ละ skill เดิม)
- อ่านเอกสารต้นทางที่จำเป็นตามจุดเริ่มต้นที่เลือก: `docs/01-requirements/01-spec/*.md`, `docs/01-requirements/02-plan/feature-list.md`, ไฟล์ user journey ใน `docs/02-design/01-prototypes/*-user-journey-*.md` — ถ้าจุดเริ่มต้นที่เลือกต้องมีเอกสารต้นทางที่ยังไม่มีอยู่จริง (เช่น เริ่มจาก Detailed Design แต่ยังไม่มี `api-spec.md`) ให้แจ้งผู้ใช้ตรงๆ ว่า skill นี้ต้องมีเอกสารนั้นก่อน แนะนำให้ปรับจุดเริ่มต้นหรือรัน skill ที่เกี่ยวข้องก่อน **ไม่ต้องดำเนินการต่อ** (ไม่ใช่คำถามเลือกทาง เป็นเงื่อนไขที่ทำต่อไม่ได้จริง)

### 3. วิเคราะห์ component/actor เชิงแนวคิด (เฉพาะจุดเริ่มต้น "ทั้ง 4 ชั้น")

ทำเหมือนขั้นตอนที่ 2-3 ของ skill `architecture-builder` (`.claude/skills/architecture-builder/SKILL.md`): กำหนดสโคปฟีเจอร์/journey, จัดกลุ่ม FR เป็น component เชิงบทบาท, ระบุ actor, conceptual data entity หลัก, journey ที่ต้องทำ data flow diagram — ใช้ลักษณะจาก `tech-stack.md` (ถ้ามี) ประกอบการตัดสินใจตามที่ระบุไว้ใน skill ต้นทาง

### 4. วิเคราะห์ entity/field/ความสัมพันธ์ และ operation (เฉพาะจุดเริ่มต้น "ทั้ง 4 ชั้น" หรือ "เริ่มจาก Database Schema + API Spec")

ทำเหมือนขั้นตอนที่ 4-5 ของ skill `api-database-design-builder` (`.claude/skills/api-database-design-builder/SKILL.md`): ระบุ entity/field/ความสัมพันธ์สำหรับ Database Schema (อ้างอิง Conceptual Data Entities จากผลขั้นตอน 3 ถ้าเป็นจุดเริ่มต้น "ทั้ง 4 ชั้น" หรือจาก `high-level-architecture.md` เดิมถ้าเริ่มจากชั้นนี้โดยตรง) แล้วจัดกลุ่ม operation ตาม entity พร้อม actor/input/output/pre-post-condition/กรณีข้อผิดพลาดสำหรับ API Spec

### 5. วิเคราะห์ sequence flow ต่อ operation (เฉพาะจุดเริ่มต้น "ทั้ง 4 ชั้น", "เริ่มจาก Database Schema + API Spec", หรือ "เริ่มจาก Detailed Design")

ทำเหมือนขั้นตอนที่ 3 ของ skill `detailed-design-builder` (`.claude/skills/detailed-design-builder/SKILL.md`): ต่อ operation แต่ละตัวที่ยืนยันแล้ว (จากขั้นตอน 4 หรือจาก `api-spec.md` เดิมถ้าเริ่มจากชั้นนี้โดยตรง) กำหนด component/entity ที่เกี่ยวข้อง, ลำดับการโต้ตอบ, กฎ/ตรรกะทางธุรกิจเพิ่มเติม, alternative/error flow

### 6. ถามคำถามชี้แจงของทุกชั้นในสโคปรวมเป็นชุดเดียว

รวบรวมทุกจุดที่กำกวม/ขาดข้อมูลจากทุกชั้นที่อยู่ในสโคปตามจุดเริ่มต้นที่เลือก (ไม่ใช่ถามทีละชั้นแยกกัน) เช่น:

- การจัดกลุ่ม FR/ฟีเจอร์เป็น component, การตั้งชื่อ/ขอบเขต conceptual data entity, ประเด็น quality attribute — ตามข้อ 5 ของ `architecture-builder`
- การแยก/รวม entity, field เป็น Enum หรือ Reference, การแตก/รวม operation, ขอบเขต input/output/กรณีข้อผิดพลาด — ตามข้อ 6 ของ `api-database-design-builder`
- component ที่เป็นไปได้มากกว่า 1 ตัวสำหรับ operation หนึ่ง, ระดับความละเอียดของ sequence diagram — ตามข้อ 4 ของ `detailed-design-builder`

ใช้ `AskUserQuestion` ถามเป็นชุดๆ (เรียกได้หลายครั้งถ้าคำถามขึ้นกับคำตอบก่อนหน้า) จนกว่าจะมีข้อมูลพอร่างแผนรวมในขั้นตอนที่ 7 ได้อย่างสมบูรณ์ — **เป้าหมายคือถามให้ครบภายในช่วงนี้ช่วงเดียว ไม่กลับมาถามแทรกอีกหลังยืนยันแผนแล้ว** หากผู้ใช้ตอบว่าไม่มั่นใจ/ให้ตัดสินใจแทน ให้เลือกตัวเลือกที่แนะนำ (Recommended) แทนการถามซ้ำ แล้วระบุไว้ในแผนช่วงข้อ 7 ว่าจุดใดเลือกให้แทนผู้ใช้ด้วยเหตุผลอะไร

### 7. ร่างแผนรวมทั้งสายแล้วเสนอให้ผู้ใช้ยืนยันครั้งเดียว (ห้ามข้าม)

สรุปแผนเป็นข้อความเดียวให้เห็นภาพรวมทั้ง 4 ชั้นก่อนเสมอ (เฉพาะชั้นที่อยู่ในสโคปตามจุดเริ่มต้นที่เลือก):

- **High-Level Architecture**: รายชื่อ component/actor เชิงแนวคิด พร้อม journey ที่จะทำ data flow diagram และ conceptual data entity
- **Database Schema**: รายชื่อ entity พร้อม field หลักและความสัมพันธ์
- **API Spec**: รายชื่อกลุ่ม operation และ operation หลักในแต่ละกลุ่ม พร้อม actor
- **Detailed Design**: ต่อ operation แต่ละตัว actor/component/entity ที่จะอยู่ใน sequence diagram พร้อมลำดับคร่าวๆ, alternative/error flow ที่จะครอบคลุม
- **ตรวจสอบ NFR**: ระบุว่าจะรัน `nfr-coverage-auditor` ตรวจเทียบ NFR ทุกข้อใน `docs/01-requirements/01-spec` กับเอกสารทั้ง 4 ชั้นที่มีอยู่จริงหลังจบขั้นตอนก่อนหน้า (read-only ไม่มีไฟล์ถูกเขียน)
- จุดใดที่เลือกให้แทนผู้ใช้ (จากข้อ 6) พร้อมเหตุผล
- ถ้าใช้ลักษณะเชิงสถาปัตยกรรมจาก `tech-stack.md` ประกอบการตัดสินใจ ให้ระบุไว้ว่าใช้ลักษณะใด
- แต่ละเอกสารเป็นการสร้างไฟล์ใหม่หรืออัปเดตไฟล์เดิม

จากนั้นใช้ `AskUserQuestion` ถามยืนยันเป็นขั้นสุดท้ายก่อนดำเนินการ เช่น ตัวเลือก "ยืนยัน รันทั้งสายตามแผนนี้ต่อเนื่องจนจบ (Recommended)" และ "ขอปรับแผนก่อน" — ถ้าผู้ใช้เลือกขอปรับ ให้กลับไปคุยรายละเอียดที่ต้องการเปลี่ยนแล้วเสนอแผนใหม่ซ้ำจนกว่าจะได้รับการยืนยัน

### 8. ไล่เรียก sub agent ตามลำดับจนจบ โดยไม่หยุดถามซ้ำ

**อย่าเขียนหรือแก้ไขไฟล์ใดๆ เองใน skill นี้** เมื่อผู้ใช้ยืนยันแผนแล้วเท่านั้น ให้เรียก Agent tool **เรียงลำดับตามนี้เสมอ** (ข้ามชั้นที่ไม่อยู่ในสโคปตามจุดเริ่มต้นที่เลือกในขั้นตอน 1 ได้ แต่ห้ามสลับลำดับของชั้นที่เหลือ เพราะชั้นถัดไปต้องอ้างอิงข้อมูลของชั้นก่อนหน้าที่อัปเดตแล้ว):

1. **`high-level-architecture-writer`** — เรียกครั้งเดียว (เฉพาะจุดเริ่มต้น "ทั้ง 4 ชั้น") ส่ง context ตาม "อินพุตที่คุณควรได้รับในคำสั่ง" ใน `.claude/agents/high-level-architecture-writer.md`
2. **`database-schema-writer`** — เรียกครั้งเดียว ส่ง context ตาม `.claude/agents/database-schema-writer.md` (entity/field/ความสัมพันธ์ที่วิเคราะห์และยืนยันแล้ว)
3. **`api-spec-writer`** — เรียกครั้งเดียว หลัง `database-schema-writer` เสร็จแล้วเท่านั้น ส่งชื่อ entity ที่ยืนยัน/สร้างจริงจาก agent ข้อ 2 พร้อม context ตาม `.claude/agents/api-spec-writer.md`
4. **`detailed-design-writer`** — เรียกครั้งเดียว หลัง `api-spec-writer` เสร็จแล้วเท่านั้น ส่งรหัส+ชื่อ operation จากผลลัพธ์ของ agent ข้อ 3 พร้อม context ตาม `.claude/agents/detailed-design-writer.md`
5. **`nfr-coverage-auditor`** — เรียกครั้งเดียวเสมอเป็นตัวสุดท้าย (ไม่ว่าจุดเริ่มต้นจะเป็นแบบใด) ไม่ต้องส่ง context พิเศษใดๆ นอกจากแจ้งให้ตรวจสอบตามขอบเขตที่ระบุไว้ใน `.claude/agents/nfr-coverage-auditor.md` (agent จะอ่านไฟล์เองทั้งหมด)

หลังเรียก agent แต่ละตัวเสร็จ ให้อ่านผลลัพธ์ที่ agent นั้นส่งกลับ (path ไฟล์ที่สร้าง/แก้ไข หรือรายงานในกรณี agent ข้อ 5) แล้วนำไปใช้เป็น context ต่อให้ agent ถัดไปทันที **ไม่ต้องหยุดรอถามผู้ใช้ระหว่างทาง** ไล่จนครบทุกชั้นในสโคป

### 9. รายงานผลกลับผู้ใช้

สรุปให้ผู้ใช้ทราบแบบกระชับ **ครั้งเดียวหลังจบทั้งสาย** แยกตามชั้น พร้อมลิงก์ไฟล์ (markdown link relative path) ของทุกไฟล์ที่สร้าง/แก้ไขในแต่ละชั้นที่อยู่ในสโคป (`high-level-architecture.md`, `database-schema.md`, `api-spec.md`, `detailed-design.md`, `02-technical/index.md` ถ้าอัปเดตครั้งแรก, ไฟล์ log ของวันนี้) จากนั้น **แสดงรายงานผลตรวจสอบ NFR จาก agent `nfr-coverage-auditor` แบบเต็ม ไม่สรุปย่อจนเสียรายละเอียด** (รวมทุกช่องว่างที่พบ ระดับความรุนแรง และข้อเสนอแนะ)

ถ้ารายงาน NFR มีช่องว่างระดับสูง ให้แนะนำท้ายรายงานว่าควรกลับไปรัน skill ใดต่อเพื่อปิดช่องว่างนั้น (เช่น "ควรรัน `architecture-builder` เพื่อเพิ่ม Quality Attribute" หรือ "ควรรัน `tech-stack-builder` เพื่อตัดสินใจแนวทางรองรับ NFR นี้ให้ชัดเจน") ถ้าระหว่างสำรวจข้อมูลพบว่าเอกสารต้นทาง (feature-list/journey) มีจุดล้าสมัย/ไม่สอดคล้อง ให้แนะนำให้รัน `feature-journey-sync` ต่อ

## ข้อควรจำ

- **ห้ามข้ามขั้นตอนถามคำถามรวม (ข้อ 6) และขั้นตอนยืนยันแผนรวม (ข้อ 7)** ไม่ว่าสโคปจะเล็กแค่ไหน — แต่ทั้งสองขั้นตอนนี้ต้องทำ**ครั้งเดียวรวมกันทั้งสาย** ไม่แยกถามทีละชั้น
- **ห้ามหยุดถามคำถามใหม่ระหว่างขั้นตอนที่ 8** (หลังยืนยันแผนแล้ว) — ถ้าระหว่างเรียก agent พบว่าข้อมูลที่ให้ไว้ไม่พอจริงๆ ให้ agent ตัดสินใจอย่างสมเหตุสมผลเองแล้วบันทึกสมมติฐานไว้ในเอกสาร (ตามที่ระบุไว้ใน agent แต่ละตัว) แทนการหยุดถามผู้ใช้กลางคัน
- **ห้ามระบุชื่อเทคโนโลยี/framework/library/DBMS/protocol/cloud product เฉพาะเจาะจงใน 4 เอกสารหลักของสโคปนี้เด็ดขาด** เอกสารทั้งหมดต้องอยู่ในระดับ conceptual เสมอ — ถ้าผู้ใช้พูดถึงชื่อ stack มาระหว่างคุย หรืออ่าน `tech-stack.md` มาประกอบการตัดสินใจ ให้แปลงเป็นแนวคิด/หน้าที่ก่อนส่งต่อให้ agent เสมอ
- เนื้อหาเอกสารทั้งหมดต้องเป็นภาษาไทยตาม `CLAUDE.md`
- ห้ามลบเอกสาร/แถว/หัวข้อเดิม ให้ทำเครื่องหมายล้าสมัยแทนเสมอ (รายละเอียดอยู่ใน agent แต่ละตัวที่ถูกเรียก)
- การอ้างอิงข้ามเอกสารใน `.md` ของ vault ใช้ Obsidian wikilink แบบ relative path เสมอ
- agent ทั้ง 4 ตัวแรกเป็นผู้เขียนไฟล์จริงทั้งหมดเท่านั้น ส่วน `nfr-coverage-auditor` เป็น read-only — skill นี้ทำหน้าที่กำหนดจุดเริ่มต้น/สำรวจข้อมูล/ถามคำถามรวม/ยืนยันแผนรวม/ไล่เรียง agent/แสดงรายงานเท่านั้น ไม่เขียนไฟล์เอง
- ไม่มี sub agent ใหม่สำหรับเขียนไฟล์ — ใช้ agent เขียนไฟล์ที่มีอยู่แล้วทั้ง 4 ตัว มีเพียง agent ตรวจสอบใหม่ 1 ตัว (`nfr-coverage-auditor`) ที่สร้างขึ้นเฉพาะสำหรับ skill นี้
