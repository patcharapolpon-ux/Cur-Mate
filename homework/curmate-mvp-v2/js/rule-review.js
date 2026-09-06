// ─────────────────────────────────────────────────────────────
// js/rule-review.js — อ่าน rules ของชุดเกณฑ์ (?setId=...) จาก Firestore
// ปุ่มอนุมัติ/อนุมัติทั้งหมด เขียนสถานะจริงกลับไปที่ rules/{id}
// พร้อมบันทึก rules/{id}/reviewLog — ปุ่มปฏิเสธยังเป็นตัวอย่างต้นแบบ (mock)
// เหมือน prototype เดิม เพราะ spec ต้นทางยังไม่กำหนดพฤติกรรมการปฏิเสธ
//
// หมายเหตุ: ยังไม่มีระบบ login (จะทำสัปดาห์ที่ 7) จึงยังฮาร์ดโค้ด
// ผู้อนุมัติเป็นแอดมินตัวอย่าง (u001) ไปก่อน
// ─────────────────────────────────────────────────────────────

(function () {
  var CURRENT_ADMIN_ID = "u001";
  var CURRENT_ADMIN_NAME = "สมชาย ใจดี";

  // ใช้ hash (#setId=...) แทน query string (?setId=...) เพราะ local static server
  // บางตัว (เช่น npx serve ที่ redirect .html -> clean URL) จะตัด query string ทิ้ง
  // ระหว่าง redirect แต่ hash fragment ไม่ถูกส่งไปที่ server เลยจึงไม่มีปัญหานี้
  var hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  var setId = hashParams.get("setId");

  var setNameEl = document.getElementById("setName");
  var setStatusChip = document.getElementById("setStatusChip");
  var progressNote = document.getElementById("progressNote");
  var bulkApproveBtn = document.getElementById("bulkApproveBtn");
  var activeBanner = document.getElementById("activeBanner");
  var ruleList = document.getElementById("ruleList");

  var successIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>';

  if (!setId) {
    ruleList.innerHTML = "<p>ไม่พบชุดเกณฑ์ที่ต้องการ — กลับไปหน้ารายการแล้วเลือกใหม่อีกครั้ง</p>";
    bulkApproveBtn.disabled = true;
    return;
  }

  function renderRuleCard(id, data) {
    var card = document.createElement("div");
    card.className = "rule-card" + (data.status === "approved" ? " approved" : "");
    card.dataset.ruleId = id;

    var actionsHtml =
      data.status === "approved"
        ? '<span class="approved-label">' + successIcon + "อนุมัติแล้ว</span>"
        : '<button type="button" class="btn btn-approve btn-small">อนุมัติ (Approve)</button>' +
          '<button type="button" class="btn btn-reject btn-small">ปฏิเสธ (Reject)</button>';

    card.innerHTML =
      '<div class="rule-card-top"><span class="ai-badge">AI SUGGESTED</span></div>' +
      '<p class="rule-text">' + data.ruleText + "</p>" +
      '<div class="rule-actions">' + actionsHtml + "</div>";

    if (data.status !== "approved") {
      card.querySelector(".btn-approve").addEventListener("click", function () {
        approveRule(id, card);
      });
      card.querySelector(".btn-reject").addEventListener("click", function () {
        alert("ตัวอย่างต้นแบบ: ระบบยังไม่ได้กำหนดพฤติกรรมของการปฏิเสธกฎเกณฑ์ (เป็นคำถามเปิดในเอกสาร spec ต้นทาง) ในเวอร์ชันจริงอาจลบทิ้ง ให้ AI สกัดใหม่ หรือให้แอดมินพิมพ์กฎเกณฑ์แทน");
      });
    }
    return card;
  }

  async function approveRule(ruleId, card) {
    var approveBtn = card.querySelector(".btn-approve");
    if (approveBtn) { approveBtn.disabled = true; }

    await db.collection("rules").doc(ruleId).update({ status: "approved" });
    await db.collection("rules").doc(ruleId).collection("reviewLog").add({
      adminId: CURRENT_ADMIN_ID,
      adminName: CURRENT_ADMIN_NAME,
      action: "approved",
      comment: "",
      createdAt: new Date().toISOString(),
    });

    card.classList.add("approved");
    card.querySelector(".rule-actions").innerHTML =
      '<span class="approved-label">' + successIcon + "อนุมัติแล้ว</span>";
    updateProgress();
  }

  function updateProgress() {
    var total = ruleList.querySelectorAll(".rule-card").length;
    var approvedCount = ruleList.querySelectorAll(".rule-card.approved").length;

    progressNote.textContent = "อนุมัติแล้ว " + approvedCount + " จาก " + total + " ข้อ";
    if (approvedCount >= total) {
      progressNote.classList.add("all-done");
      progressNote.textContent = "อนุมัติครบทุกข้อแล้ว (" + total + "/" + total + ")";
      bulkApproveBtn.disabled = true;
      activeBanner.classList.add("show");
      setStatusChip.className = "status-chip success";
      setStatusChip.innerHTML = successIcon + "เปิดใช้งาน";
    } else {
      bulkApproveBtn.disabled = false;
    }
  }

  bulkApproveBtn.addEventListener("click", async function () {
    bulkApproveBtn.disabled = true;
    var pendingCards = Array.prototype.slice.call(ruleList.querySelectorAll(".rule-card:not(.approved)"));
    for (var i = 0; i < pendingCards.length; i++) {
      await approveRule(pendingCards[i].dataset.ruleId, pendingCards[i]);
    }
  });

  async function โหลดข้อมูล() {
    ruleList.innerHTML = "<p>กำลังโหลด…</p>";

    var setDoc = await db.collection("criteriaSets").doc(setId).get();
    if (setDoc.exists) {
      setNameEl.textContent = "ชุดเกณฑ์: " + setDoc.data().name;
    } else {
      setNameEl.textContent = "ชุดเกณฑ์: (ไม่พบข้อมูล setId=" + setId + ")";
    }

    var snapshot = await db.collection("rules").where("criteriaSetId", "==", setId).get();

    if (snapshot.empty) {
      ruleList.innerHTML = "<p>ยังไม่มีกฎเกณฑ์ที่ต้องตรวจสอบในชุดนี้ — เพราะการอัปโหลดเอกสาร/สกัดกฎเกณฑ์ด้วย AI จริงยังไม่ได้ทำในเวอร์ชันนี้ (ดู SCOPE.md)</p>";
      bulkApproveBtn.disabled = true;
      progressNote.textContent = "ยังไม่มีกฎเกณฑ์ที่ต้องตรวจสอบ";
      return;
    }

    ruleList.innerHTML = "";
    snapshot.forEach(function (doc) {
      ruleList.appendChild(renderRuleCard(doc.id, doc.data()));
    });
    updateProgress();
  }

  โหลดข้อมูล().catch(function (err) {
    ruleList.innerHTML = "<p>โหลดข้อมูลไม่สำเร็จ: " + err.message + "</p>";
  });
})();
