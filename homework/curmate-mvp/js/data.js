// ─────────────────────────────────────────────────────────────
// js/data.js — ข้อมูลตัวอย่าง (fake data) สำหรับ seed ลง Firestore
// ชื่อทั้งหมดเป็นชื่อสมมติ ไม่ใช่ข้อมูลจริงของบุคคลใด
// ─────────────────────────────────────────────────────────────

window.CURMATE_DATA = {
  users: [
    { id: "u001", name: "สมชาย ใจดี", email: "somchai@example.com", role: "admin" },
    { id: "u002", name: "สมหญิง รักงาน", email: "somying@example.com", role: "admin" },
  ],

  criteriaSets: [
    {
      id: "cs001",
      name: "เกณฑ์มาตรฐานหลักสูตร ป.ตรี 2565",
      academicYear: "2565",
      degreeLevel: "ปริญญาตรี",
      scope: "ทุกสาขา",
      status: "active",
    },
    {
      id: "cs002",
      name: "เกณฑ์คุณวุฒิ วิทยาการคอมพิวเตอร์ 2569",
      academicYear: "2569",
      degreeLevel: "ปริญญาตรี",
      scope: "วิทยาการคอมพิวเตอร์",
      status: "pending",
    },
  ],

  rules: [
    {
      id: "r001",
      ruleText: "หลักสูตรปริญญาตรีต้องมีหน่วยกิตรวมไม่น้อยกว่า 120 หน่วยกิต",
      status: "approved",
      criteriaSetId: "cs001",
      criteriaSetName: "เกณฑ์มาตรฐานหลักสูตร ป.ตรี 2565",
      uploadedBy: "u001",
      uploadedByName: "สมชาย ใจดี",
      createdAt: "2026-08-20T09:00:00+07:00",
    },
    {
      id: "r002",
      ruleText: "หมวดวิชาศึกษาทั่วไปต้องมีหน่วยกิตไม่น้อยกว่า 30 หน่วยกิต",
      status: "approved",
      criteriaSetId: "cs001",
      criteriaSetName: "เกณฑ์มาตรฐานหลักสูตร ป.ตรี 2565",
      uploadedBy: "u001",
      uploadedByName: "สมชาย ใจดี",
      createdAt: "2026-08-20T09:00:00+07:00",
    },
    {
      id: "r003",
      ruleText: "หมวดวิชาเลือกต้องมีหน่วยกิตไม่เกิน 24 หน่วยกิต",
      status: "pending",
      criteriaSetId: "cs002",
      criteriaSetName: "เกณฑ์คุณวุฒิ วิทยาการคอมพิวเตอร์ 2569",
      uploadedBy: "u002",
      uploadedByName: "สมหญิง รักงาน",
      createdAt: "2026-09-01T10:30:00+07:00",
    },
    {
      id: "r004",
      ruleText: "สัดส่วนอาจารย์ประจำหลักสูตรต่อจำนวนนักศึกษาในหมวดปฏิบัติการต้องไม่เกิน 1:30",
      status: "pending",
      criteriaSetId: "cs002",
      criteriaSetName: "เกณฑ์คุณวุฒิ วิทยาการคอมพิวเตอร์ 2569",
      uploadedBy: "u002",
      uploadedByName: "สมหญิง รักงาน",
      createdAt: "2026-09-01T10:30:00+07:00",
    },
    {
      id: "r005",
      ruleText: "แผนการศึกษาต้องระบุจำนวนหน่วยกิตรายวิชาในแต่ละภาคการศึกษาปกติไม่เกิน 22 หน่วยกิต",
      status: "pending",
      criteriaSetId: "cs002",
      criteriaSetName: "เกณฑ์คุณวุฒิ วิทยาการคอมพิวเตอร์ 2569",
      uploadedBy: "u002",
      uploadedByName: "สมหญิง รักงาน",
      createdAt: "2026-09-01T10:30:00+07:00",
    },
  ],

  // reviewLog: subcollection ของ rules/{ruleId}/reviewLog
  reviewLog: [
    {
      id: "log001",
      ruleId: "r001",
      adminId: "u001",
      adminName: "สมชาย ใจดี",
      action: "approved",
      comment: "ตรวจสอบตรงตามเอกสารต้นฉบับแล้ว",
      createdAt: "2026-08-21T13:15:00+07:00",
    },
    {
      id: "log002",
      ruleId: "r002",
      adminId: "u002",
      adminName: "สมหญิง รักงาน",
      action: "approved",
      comment: "",
      createdAt: "2026-08-21T13:20:00+07:00",
    },
  ],
};
