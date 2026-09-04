// ─────────────────────────────────────────────────────────────
// js/rules-list.js — อ่านรายการ rules จาก Firestore แล้วแสดงผล
// เรียงจากใหม่ไปเก่า (createdAt desc)
// ─────────────────────────────────────────────────────────────

(function () {
  var list = document.getElementById("rule-list");

  function สถานะเป็นภาษาไทย(status) {
    if (status === "approved") return { label: "อนุมัติแล้ว", cls: "status-approved" };
    return { label: "รอตรวจสอบ", cls: "status-pending" };
  }

  function สร้างการ์ด(rule) {
    var สถานะ = สถานะเป็นภาษาไทย(rule.status);
    var การ์ด = document.createElement("div");
    การ์ด.className = "card rule-card";
    การ์ด.innerHTML =
      '<p class="rule-text">' + rule.ruleText + "</p>" +
      '<div class="meta-row">' +
        '<span class="status-chip ' + สถานะ.cls + '">' + สถานะ.label + "</span>" +
        "<span>ชุดเกณฑ์: " + rule.criteriaSetName + "</span>" +
        "<span>อัปโหลดโดย: " + rule.uploadedByName + "</span>" +
      "</div>";
    return การ์ด;
  }

  async function โหลดรายการ() {
    list.innerHTML = '<p class="empty-state">กำลังโหลด…</p>';
    var snapshot = await db.collection("rules").orderBy("createdAt", "desc").get();

    if (snapshot.empty) {
      list.innerHTML = '<p class="empty-state">ยังไม่มีข้อมูล — เปิด seed.html เพื่อใส่ข้อมูลตัวอย่างก่อน</p>';
      return;
    }

    list.innerHTML = "";
    snapshot.forEach(function (doc) {
      list.appendChild(สร้างการ์ด(doc.data()));
    });
  }

  โหลดรายการ().catch(function (err) {
    list.innerHTML = '<p class="empty-state">โหลดข้อมูลไม่สำเร็จ: ' + err.message + "</p>";
  });
})();
