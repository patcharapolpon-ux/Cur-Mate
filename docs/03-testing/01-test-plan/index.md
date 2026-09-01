# 01 - Test Plan

เก็บ **แผนการทดสอบ (Test Plan)** ที่เตรียมไว้ก่อนลงมือทดสอบจริง เช่น

- Test case / test scenario ของแต่ละฟีเจอร์
- เงื่อนไขและข้อมูลที่ใช้ในการทดสอบ (test data)
- ขอบเขตของการทดสอบ (in scope / out of scope)

อ้างอิงจากข้อกำหนดใน [[../../01-requirements/01-spec/index|01-spec]] และการออกแบบใน [[../../02-design/index|02-design]] ผลของการทดสอบตาม test case เหล่านี้ให้บันทึกใน [[../02-test-result/index|02-test-result]]

นอกจากนี้ยังมี [[acceptance-criteria|acceptance-criteria]] — Acceptance Criteria แบบ Given-When-Then ต่อ Backlog Item ดูแลโดย skill `test-design-builder`

นอกจากนี้ยังมี [[test-plan|test-plan]] — แผนกลยุทธ์การทดสอบภาพรวมของโปรเจกต์ (ขอบเขต, ประเภทการทดสอบ, test environment, entry/exit criteria, risk management) ดูแลโดย skill `test-design-builder`

นอกจากนี้ยังมี [[test-cases/index|test-cases]] — Test Case แบบ step-by-step แยกตามฟีเจอร์ ดูแลโดย skill `test-design-builder`
