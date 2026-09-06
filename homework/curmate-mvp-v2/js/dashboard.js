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
        : '<p class="criteria-set-hint-active">' + arrowIcon + "คลิกเพื่อดู/แก้ไขกฎเกณฑ์ของชุดที่เปิดใช้งานแล้ว</p>") +
      '<div class="criteria-set-footer">' +
        '<button type="button" class="btn btn-danger btn-small delete-set-btn">ลบชุดเกณฑ์นี้</button>' +
      "</div>";

    var a = document.createElement("a");
    a.className = "criteria-set-card clickable";
    a.href = "07-rule-review-approval.html#setId=" + encodeURIComponent(id);
    a.innerHTML = inner;

    a.querySelector(".delete-set-btn").addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      ลบชุดเกณฑ์(id, data.name, a);
    });

    return a;
  }

  // ลบ criteriaSets/{id} พร้อมลบพ่วง (cascade) rules ทุกข้อของชุดนั้น
  // และ reviewLog ใต้แต่ละ rule ด้วย — กันไม่ให้มีข้อมูลค้างอ้างอิง criteriaSetId ที่ไม่มีอยู่จริง
  async function ลบชุดเกณฑ์(id, name, cardEl) {
    var confirmed = window.confirm(
      'ต้องการลบชุดเกณฑ์ "' + name + '" ทิ้งถาวรหรือไม่? ' +
      "กฎเกณฑ์ย่อยทั้งหมดในชุดนี้ (รวมประวัติการตรวจสอบ) จะถูกลบไปด้วย และไม่สามารถกู้คืนได้"
    );
    if (!confirmed) { return; }

    var deleteBtn = cardEl.querySelector(".delete-set-btn");
    deleteBtn.disabled = true;
    deleteBtn.textContent = "กำลังลบ...";

    var rulesSnapshot = await db.collection("rules").where("criteriaSetId", "==", id).get();
    for (var i = 0; i < rulesSnapshot.docs.length; i++) {
      var ruleRef = rulesSnapshot.docs[i].ref;
      var logSnapshot = await ruleRef.collection("reviewLog").get();
      var logDeletions = [];
      logSnapshot.forEach(function (logDoc) { logDeletions.push(logDoc.ref.delete()); });
      await Promise.all(logDeletions);
      await ruleRef.delete();
    }
    await db.collection("criteriaSets").doc(id).delete();

    cardEl.remove();
    if (!list.querySelector(".criteria-set-card")) {
      list.innerHTML = '<p style="color:var(--color-text-secondary);">ยังไม่มีข้อมูล — เปิด seed.html เพื่อใส่ข้อมูลตัวอย่างก่อน</p>';
    }
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
