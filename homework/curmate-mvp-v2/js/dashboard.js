// ─────────────────────────────────────────────────────────────
// js/dashboard.js — อ่านรายการ criteriaSets จาก Firestore แล้วแสดงผล
// การ์ดคลิกได้ทุกสถานะ พาไปหน้าตรวจสอบ/อนุมัติกฎเกณฑ์ (07) — ทั้ง pending (ตรวจ/อนุมัติ)
// และ active (ดู/แก้ไขอีกครั้งผ่านปุ่ม "แก้ไขชุดเกณฑ์นี้อีกครั้ง" ที่หน้า 07)
// ─────────────────────────────────────────────────────────────

(function () {
  var list = document.getElementById("criteriaList");

  var successIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>';
  var warningIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>';
  var arrowIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function สร้างการ์ด(id, data) {
    var เป็นPending = data.status === "pending";
    var meta = "ปีบังคับใช้ " + data.academicYear + " · ระดับ" + data.degreeLevel + " · ขอบเขต: " + data.scope;

    var inner =
      '<div class="criteria-set-row">' +
        "<div>" +
          '<p class="criteria-set-name">' + data.name + "</p>" +
          '<p class="criteria-set-meta">' + meta + "</p>" +
        "</div>" +
        '<span class="status-chip ' + (เป็นPending ? "warning" : "success") + '">' +
          (เป็นPending ? warningIcon + "รอตรวจสอบ" : successIcon + "เปิดใช้งาน") +
        "</span>" +
      "</div>" +
      (เป็นPending
        ? '<p class="criteria-set-hint">' + arrowIcon + "คลิกเพื่อตรวจสอบและอนุมัติกฎเกณฑ์ที่ AI สกัดมา</p>"
        : '<p class="criteria-set-hint-active">' + arrowIcon + "คลิกเพื่อดู/แก้ไขกฎเกณฑ์ของชุดที่เปิดใช้งานแล้ว</p>");

    var a = document.createElement("a");
    a.className = "criteria-set-card clickable";
    a.href = "07-rule-review-approval.html#setId=" + encodeURIComponent(id);
    a.innerHTML = inner;
    return a;
  }

  async function โหลดรายการ() {
    list.innerHTML = '<p style="color:var(--color-text-secondary);">กำลังโหลด…</p>';
    var snapshot = await db.collection("criteriaSets").orderBy("academicYear", "desc").get();

    if (snapshot.empty) {
      list.innerHTML = '<p style="color:var(--color-text-secondary);">ยังไม่มีข้อมูล — เปิด seed.html เพื่อใส่ข้อมูลตัวอย่างก่อน</p>';
      return;
    }

    list.innerHTML = "";
    snapshot.forEach(function (doc) {
      list.appendChild(สร้างการ์ด(doc.id, doc.data()));
    });
  }

  โหลดรายการ().catch(function (err) {
    list.innerHTML = '<p style="color:var(--color-error-text);">โหลดข้อมูลไม่สำเร็จ: ' + err.message + "</p>";
  });
})();
