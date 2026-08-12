# CLAUDE.md

ไฟล์นี้ให้คำแนะนำแก่ Claude Code (claude.ai/code) เมื่อทำงานกับโค้ด/เอกสารใน repository นี้

## จุดประสงค์ของ repository นี้

repository นี้เป็น **vault เอกสาร (Obsidian)** ของโปรเจกต์ "Curmate" — ไม่มีซอร์สโค้ดของแอปพลิเคชัน ไม่มี build script และไม่มี test ใดๆ จึงไม่มีคำสั่ง build / lint / run การทำงานใน repo นี้คือการอ่าน เขียน และจัดระเบียบโน้ต Markdown เท่านั้น

## โครงสร้างและลำดับการไหลของเอกสาร

เอกสารทั้งหมดอยู่ใต้ `docs/` จัดเรียงเป็น pipeline ที่มีลำดับตัวเลข โดยแต่ละขั้นตอนจะส่งต่อไปยังขั้นถัดไป:

```
01-requirements/01-spec    → สิ่งที่ระบบต้องมี (ต้นทาง/source of truth)
01-requirements/02-plan    → roadmap/phase ที่แตกมาจาก spec
01-requirements/03-task    → งานย่อยที่ลงมือทำได้จริง แตกมาจาก plan
02-design/01-prototypes    → mockup UI/UX อ้างอิงจาก 01-spec
02-design/02-technical     → ออกแบบเชิงเทคนิค (architecture/DB/API) อ้างอิงจาก 01-prototypes
03-testing/01-test-plan    → test case อ้างอิงจาก 02-technical และ 01-spec
03-testing/02-test-result  → ผลทดสอบ pass/fail และบั๊ก อ้างอิงจาก 01-test-plan
04-retrospectives          → สรุปบทเรียน อ้างอิงจาก 02-test-result และ 05-log
05-log                     → บันทึกความเคลื่อนไหว/การตัดสินใจตามลำดับเวลา
00-archived                → เอกสารที่เลิกใช้แล้ว/ถูกยกเลิก (ดูกฎด้านล่าง)
```

แต่ละโฟลเดอร์มีไฟล์ `index.md` อธิบายจุดประสงค์ของตัวเอง และเชื่อมโยงไปมาตาม pipeline นี้ด้วย Obsidian wikilink (`[[../relative/path/index|label]]`) เวลาจะเพิ่มเอกสารใหม่ ให้วางในโฟลเดอร์ที่ตรงกับขั้นตอนนั้นๆ และลิงก์เข้ากับ chain ที่มีอยู่ อย่าปล่อยให้เอกสารลอยตัวไม่มีการเชื่อมโยง

## ข้อตกลง/ธรรมเนียมของโปรเจกต์

- เนื้อหาเอกสารทั้งหมดเขียนเป็น**ภาษาไทย**
- **ห้ามลบ**เอกสารที่ไม่ใช้แล้วโดยตรง — ให้ย้ายไปเก็บที่ `docs/00-archived/` แทน เพื่อรักษาประวัติการตัดสินใจไว้
- การอ้างอิงข้ามเอกสารใช้ Obsidian wikilink แบบ relative path (`[[../02-design/index|02-design]]`) ไม่ใช่ Markdown link ธรรมดา — ให้เขียนลิงก์ในรูปแบบเดียวกันนี้เสมอ
- `.obsidian/` เก็บ state ของ UI ตัว vault เอง (ไม่ใช่เนื้อหาโปรเจกต์) และ `.obsidian/workspace.json` ถูกใส่ไว้ใน `.gitignore` เพราะไฟล์นี้เปลี่ยนทุกครั้งที่เปิด vault
