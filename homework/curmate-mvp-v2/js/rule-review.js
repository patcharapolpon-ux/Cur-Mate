// ─────────────────────────────────────────────────────────────
// js/rule-review.js — อ่าน rules ของชุดเกณฑ์ (?setId=...) จาก Firestore
// ปุ่มอนุมัติ/ไม่อนุมัติ/อนุมัติทั้งหมด เขียนสถานะจริงกลับไปที่ rules/{id}
// (แก้เฉพาะ field status เท่านั้น) พร้อมบันทึก rules/{id}/reviewLog
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
  var deactivateSetBtn = document.getElementById("deactivateSetBtn");
  var progressNote = document.getElementById("progressNote");
  var bulkApproveBtn = document.getElementById("bulkApproveBtn");
  var activeBanner = document.getElementById("activeBanner");
  var activeBannerTitle = document.getElementById("activeBannerTitle");
  var activeBannerBody = document.getElementById("activeBannerBody");
  var activateSetBtn = document.getElementById("activateSetBtn");
  var ruleList = document.getElementById("ruleList");

  var successIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>';
  var rejectIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>';
  var warningIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>';

  // สถานะจริงของ criteriaSets/{setId} ตามที่อ่านมาจาก Firestore (ไม่ใช่ค่าที่คำนวณจากการนับการ์ด)
  var setExists = false;
  var currentSetStatus = "pending";

  if (!setId) {
    ruleList.innerHTML = "<p>ไม่พบชุดเกณฑ์ที่ต้องการ — กลับไปหน้ารายการแล้วเลือกใหม่อีกครั้ง</p>";
    bulkApproveBtn.disabled = true;
    return;
  }

  function renderRuleCard(id, data) {
    var card = document.createElement("div");
    card.className = "rule-card" + statusClass(data.status);
    card.dataset.ruleId = id;
    card.dataset.editing = "false";

    card.innerHTML =
      '<div class="rule-card-top"><span class="ai-badge">AI SUGGESTED</span></div>' +
      '<p class="rule-text">' + data.ruleText + "</p>" +
      '<div class="rule-actions"></div>';

    renderCardActions(card);
    return card;
  }

  function statusClass(status) {
    if (status === "approved") { return " approved"; }
    if (status === "rejected") { return " rejected"; }
    return "";
  }

  function cardStatus(card) {
    if (card.classList.contains("approved")) { return "approved"; }
    if (card.classList.contains("rejected")) { return "rejected"; }
    return "pending";
  }

  // แสดง/สลับปุ่มของแต่ละการ์ดตามสถานะกฎเกณฑ์ย่อย + สถานะล็อกของเกณฑ์ใหญ่ (currentSetStatus)
  // เกณฑ์ย่อยที่ตัดสินใจแล้ว (approved/rejected) จะแก้ไขได้ก็ต่อเมื่อเกณฑ์ใหญ่ไม่ใช่ "active"
  function renderCardActions(card) {
    var ruleId = card.dataset.ruleId;
    var status = cardStatus(card);
    var actionsEl = card.querySelector(".rule-actions");
    var locked = currentSetStatus === "active";
    var editing = card.dataset.editing === "true";

    if (status === "pending" || editing) {
      actionsEl.innerHTML =
        '<button type="button" class="btn btn-approve btn-small">อนุมัติ (Approve)</button>' +
        '<button type="button" class="btn btn-reject btn-small">ไม่อนุมัติ (Reject)</button>';
      actionsEl.querySelector(".btn-approve").addEventListener("click", function () {
        approveRule(ruleId, card);
      });
      actionsEl.querySelector(".btn-reject").addEventListener("click", function () {
        rejectRule(ruleId, card);
      });
      return;
    }

    var label =
      status === "approved"
        ? '<span class="approved-label">' + successIcon + "อนุมัติแล้ว</span>"
        : '<span class="rejected-label">' + rejectIcon + "ไม่อนุมัติ</span>";

    if (locked) {
      actionsEl.innerHTML = label;
      return;
    }

    actionsEl.innerHTML = label + '<button type="button" class="btn btn-secondary btn-small">แก้ไข</button>';
    actionsEl.querySelector(".btn-secondary").addEventListener("click", function () {
      card.dataset.editing = "true";
      renderCardActions(card);
    });
  }

  async function approveRule(ruleId, card) {
    var approveBtn = card.querySelector(".btn-approve");
    var rejectBtn = card.querySelector(".btn-reject");
    if (approveBtn) { approveBtn.disabled = true; }
    if (rejectBtn) { rejectBtn.disabled = true; }

    await db.collection("rules").doc(ruleId).update({ status: "approved" });
    await db.collection("rules").doc(ruleId).collection("reviewLog").add({
      adminId: CURRENT_ADMIN_ID,
      adminName: CURRENT_ADMIN_NAME,
      action: "approved",
      comment: "",
      createdAt: new Date().toISOString(),
    });

    card.classList.remove("rejected");
    card.classList.add("approved");
    card.dataset.editing = "false";
    renderCardActions(card);
    updateProgress();
  }

  async function rejectRule(ruleId, card) {
    var approveBtn = card.querySelector(".btn-approve");
    var rejectBtn = card.querySelector(".btn-reject");
    if (approveBtn) { approveBtn.disabled = true; }
    if (rejectBtn) { rejectBtn.disabled = true; }

    await db.collection("rules").doc(ruleId).update({ status: "rejected" });
    await db.collection("rules").doc(ruleId).collection("reviewLog").add({
      adminId: CURRENT_ADMIN_ID,
      adminName: CURRENT_ADMIN_NAME,
      action: "rejected",
      comment: "",
      createdAt: new Date().toISOString(),
    });

    card.classList.remove("approved");
    card.classList.add("rejected");
    card.dataset.editing = "false";
    renderCardActions(card);
    updateProgress();
  }

  // เรียกทุกครั้งที่ currentSetStatus เปลี่ยน (กด เปิดใช้งาน/แก้ไขอีกครั้ง) เพื่อล็อก/ปลดล็อกปุ่ม "แก้ไข" ของทุกการ์ดให้ตรงกับสถานะล่าสุด
  function refreshAllCardActions() {
    var cards = ruleList.querySelectorAll(".rule-card");
    cards.forEach(function (card) {
      card.dataset.editing = "false";
      renderCardActions(card);
    });
  }

  // แสดง badge สถานะที่หัวหน้าตามค่า criteriaSets.status จริงจาก Firestore เท่านั้น
  // (ไม่คำนวณ/เดาจากจำนวนการ์ดที่ตรวจแล้ว — แก้ไขให้ตรงกับความจริงเสมอ)
  function renderSetStatusChip() {
    if (currentSetStatus === "active") {
      setStatusChip.className = "status-chip success";
      setStatusChip.innerHTML = successIcon + "เปิดใช้งาน";
      deactivateSetBtn.hidden = !setExists;
    } else {
      setStatusChip.className = "status-chip warning";
      setStatusChip.innerHTML = warningIcon + "รอตรวจสอบ";
      deactivateSetBtn.hidden = true;
    }
  }

  function updateProgress() {
    var total = ruleList.querySelectorAll(".rule-card").length;
    var approvedCount = ruleList.querySelectorAll(".rule-card.approved").length;
    var rejectedCount = ruleList.querySelectorAll(".rule-card.rejected").length;
    var reviewedCount = approvedCount + rejectedCount;
    var allReviewed = reviewedCount >= total;

    progressNote.classList.toggle("all-done", allReviewed);
    bulkApproveBtn.disabled = allReviewed;
    progressNote.textContent = allReviewed
      ? "ตรวจสอบครบทุกข้อแล้ว (อนุมัติ " + approvedCount + ", ไม่อนุมัติ " + rejectedCount + " จาก " + total + ")"
      : "ดำเนินการแล้ว " + reviewedCount + " จาก " + total + " ข้อ (อนุมัติ " + approvedCount + ", ไม่อนุมัติ " + rejectedCount + ")";

    if (!allReviewed || !setExists) {
      activeBanner.classList.remove("show");
      return;
    }

    activeBanner.classList.add("show");
    if (currentSetStatus === "active") {
      activeBannerTitle.textContent = "ชุดเกณฑ์นี้เปิดใช้งานแล้ว";
      activeBannerBody.textContent = "พร้อมให้ผู้ใช้งานทั่วไปเลือกอ้างอิงแล้ว (แสดงผลถูกต้องที่หน้ารายการด้วย) — ถ้าต้องการแก้ไขกฎเกณฑ์ย่อยอีกครั้ง กดปุ่ม \"แก้ไขชุดเกณฑ์นี้อีกครั้ง\" ที่มุมบนขวา";
      activateSetBtn.hidden = true;
    } else {
      activateSetBtn.hidden = false;
      activateSetBtn.disabled = false;
      activateSetBtn.textContent = "เปิดใช้งานชุดเกณฑ์นี้";
      if (rejectedCount === 0) {
        activeBannerTitle.textContent = "กฎเกณฑ์ทั้งหมดในชุดนี้ผ่านการอนุมัติครบแล้ว";
        activeBannerBody.textContent = "กดปุ่มด้านล่างเพื่อเปิดใช้งานชุดเกณฑ์นี้จริง — จะเขียนกลับ criteriaSets.status เป็น active ที่ Firestore";
      } else {
        activeBannerTitle.textContent = "ตรวจสอบกฎเกณฑ์ครบทุกข้อแล้ว (มีบางข้อไม่อนุมัติ)";
        activeBannerBody.textContent = "ยังสามารถเปิดใช้งานชุดเกณฑ์นี้ได้ด้วยดุลยพินิจของแอดมิน แม้จะมีกฎเกณฑ์ที่ไม่อนุมัติอยู่ก็ตาม";
      }
    }
  }

  activateSetBtn.addEventListener("click", async function () {
    activateSetBtn.disabled = true;
    activateSetBtn.textContent = "กำลังเปิดใช้งาน...";
    await db.collection("criteriaSets").doc(setId).update({ status: "active" });
    currentSetStatus = "active";
    renderSetStatusChip();
    refreshAllCardActions();
    updateProgress();
  });

  deactivateSetBtn.addEventListener("click", async function () {
    var confirmed = window.confirm(
      'ต้องการปรับสถานะชุดเกณฑ์นี้กลับเป็น "รอตรวจสอบ" เพื่อแก้ไขกฎเกณฑ์ย่อยหรือไม่? ' +
      "ชุดเกณฑ์นี้จะไม่แสดงเป็น \"เปิดใช้งาน\" ให้ผู้ใช้งานทั่วไปเห็นอีกจนกว่าจะกดเปิดใช้งานใหม่"
    );
    if (!confirmed) { return; }

    deactivateSetBtn.disabled = true;
    await db.collection("criteriaSets").doc(setId).update({ status: "pending" });
    currentSetStatus = "pending";
    deactivateSetBtn.disabled = false;
    renderSetStatusChip();
    refreshAllCardActions();
    updateProgress();
  });

  bulkApproveBtn.addEventListener("click", async function () {
    bulkApproveBtn.disabled = true;
    var pendingCards = Array.prototype.slice.call(
      ruleList.querySelectorAll(".rule-card:not(.approved):not(.rejected)")
    );
    for (var i = 0; i < pendingCards.length; i++) {
      await approveRule(pendingCards[i].dataset.ruleId, pendingCards[i]);
    }
  });

  async function โหลดข้อมูล() {
    ruleList.innerHTML = "<p>กำลังโหลด…</p>";

    var setDoc = await db.collection("criteriaSets").doc(setId).get();
    if (setDoc.exists) {
      setExists = true;
      currentSetStatus = setDoc.data().status || "pending";
      setNameEl.textContent = "ชุดเกณฑ์: " + setDoc.data().name;
    } else {
      setNameEl.textContent = "ชุดเกณฑ์: (ไม่พบข้อมูล setId=" + setId + ")";
    }
    renderSetStatusChip();

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
