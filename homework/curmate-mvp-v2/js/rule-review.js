// ─────────────────────────────────────────────────────────────
// js/rule-review.js — อ่าน rules ของชุดเกณฑ์ (?setId=...) จาก Firestore
// เปิดให้ทั้ง role ADMIN และ STAFF เข้าดูได้ (ดู ACL.md) แต่ทำได้ไม่เท่ากัน:
// - ADMIN: อนุมัติ/ไม่อนุมัติ/ลบ/แก้ไข/เปิดใช้งานชุดเกณฑ์ ได้ตามเดิมทุกประการ
// - STAFF: อ่านอย่างเดียวเพื่อศึกษา — ไม่มีปุ่มใดๆ ทั้งสิ้น และเข้าดูได้เฉพาะชุดที่ "เปิดใช้งาน (active)"
//   แล้วเท่านั้น (ชุดที่ยัง pending ยังไม่ผ่านตรวจ ไม่ให้ศึกษา)
//
// ปุ่มอนุมัติ/ไม่อนุมัติ/อนุมัติทั้งหมด เขียนสถานะจริงกลับไปที่ rules/{id}
// (แก้เฉพาะ field status เท่านั้น) พร้อมบันทึก rules/{id}/reviewLog
//
// ผู้อนุมัติ (adminId/adminName ใน reviewLog) มาจากผู้ login อยู่จริง (js/auth.js)
// ไม่ฮาร์ดโค้ดอีกต่อไป (เดิมฮาร์ดโค้ด u001 ไว้ก่อนมี login จริง)
// ─────────────────────────────────────────────────────────────

(function () {
  // ตั้งค่าจริงตอน window.CURMATE_AUTH_READY resolve (ดูท้ายไฟล์) — ก่อนหน้านั้นห้ามมีปุ่มไหนกดได้
  // อยู่แล้วเพราะการ์ดกฎเกณฑ์ยังไม่ถูก render จนกว่าจะเรียก โหลดข้อมูล() หลัง auth พร้อม
  var currentUser = null;
  var isAdmin = false;
  var toolbar = document.getElementById("toolbar");
  var uploadMoreLink = document.getElementById("uploadMoreLink");
  var pageTitle = document.getElementById("pageTitle");
  var pageLead = document.getElementById("pageLead");

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

    // STAFF อ่านอย่างเดียวเพื่อศึกษา — ไม่มีปุ่มใดๆ ทั้งสิ้น ไม่ว่ากฎเกณฑ์ข้อนั้นจะอยู่สถานะไหน (ดู ACL.md)
    if (!isAdmin) {
      if (status === "approved") {
        actionsEl.innerHTML = '<span class="approved-label">' + successIcon + "อนุมัติแล้ว</span>";
      } else if (status === "rejected") {
        actionsEl.innerHTML = '<span class="rejected-label">' + rejectIcon + "ไม่อนุมัติ</span>";
      } else {
        actionsEl.innerHTML = '<span class="status-chip warning">' + warningIcon + "รอตรวจสอบ</span>";
      }
      return;
    }

    var locked = currentSetStatus === "active";
    var editing = card.dataset.editing === "true";

    if (status === "pending" || editing) {
      actionsEl.innerHTML =
        '<button type="button" class="btn btn-approve btn-small">อนุมัติ (Approve)</button>' +
        '<button type="button" class="btn btn-reject btn-small">ไม่อนุมัติ (Reject)</button>' +
        '<button type="button" class="btn btn-danger btn-small">ลบ</button>';
      actionsEl.querySelector(".btn-approve").addEventListener("click", function () {
        approveRule(ruleId, card);
      });
      actionsEl.querySelector(".btn-reject").addEventListener("click", function () {
        rejectRule(ruleId, card);
      });
      actionsEl.querySelector(".btn-danger").addEventListener("click", function () {
        deleteRule(ruleId, card);
      });
      return;
    }

    var label =
      status === "approved"
        ? '<span class="approved-label">' + successIcon + "อนุมัติแล้ว</span>"
        : '<span class="rejected-label">' + rejectIcon + "ไม่อนุมัติ</span>";

    // ตอนชุดเกณฑ์เป็น active ล็อกทั้งปุ่ม "แก้ไข" และปุ่ม "ลบ" — ต้องกด "แก้ไขชุดเกณฑ์นี้อีกครั้ง" ก่อน
    if (locked) {
      actionsEl.innerHTML = label;
      return;
    }

    actionsEl.innerHTML =
      label +
      '<button type="button" class="btn btn-secondary btn-small">แก้ไข</button>' +
      '<button type="button" class="btn btn-danger btn-small">ลบ</button>';
    actionsEl.querySelector(".btn-secondary").addEventListener("click", function () {
      card.dataset.editing = "true";
      renderCardActions(card);
    });
    actionsEl.querySelector(".btn-danger").addEventListener("click", function () {
      deleteRule(ruleId, card);
    });
  }

  // ลบ rules/{id} พร้อม reviewLog ทั้งหมดใต้ข้อนั้น — ถามยืนยันก่อนทุกครั้ง ยกเลิกแล้วไม่ลบ
  async function deleteRule(ruleId, card) {
    var ruleTextEl = card.querySelector(".rule-text");
    var ruleText = ruleTextEl ? ruleTextEl.textContent : "";
    var confirmed = window.confirm(
      "ต้องการลบกฎเกณฑ์นี้ทิ้งถาวรหรือไม่?\n\n" + ruleText + "\n\nการลบนี้ไม่สามารถกู้คืนได้"
    );
    if (!confirmed) { return; }

    var deleteBtn = card.querySelector(".btn-danger");
    if (deleteBtn) { deleteBtn.disabled = true; }

    var logSnapshot = await db.collection("rules").doc(ruleId).collection("reviewLog").get();
    var logDeletions = [];
    logSnapshot.forEach(function (logDoc) { logDeletions.push(logDoc.ref.delete()); });
    await Promise.all(logDeletions);
    await db.collection("rules").doc(ruleId).delete();

    card.remove();
    if (!ruleList.querySelector(".rule-card")) {
      ruleList.innerHTML = "<p>ไม่มีกฎเกณฑ์เหลืออยู่ในชุดนี้แล้ว — ลบไปหมดแล้ว</p>";
    }
    updateProgress();
  }

  async function approveRule(ruleId, card) {
    var approveBtn = card.querySelector(".btn-approve");
    var rejectBtn = card.querySelector(".btn-reject");
    if (approveBtn) { approveBtn.disabled = true; }
    if (rejectBtn) { rejectBtn.disabled = true; }

    await db.collection("rules").doc(ruleId).update({ status: "approved" });
    await db.collection("rules").doc(ruleId).collection("reviewLog").add({
      adminId: currentUser.uid,
      adminName: currentUser.name,
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
      adminId: currentUser.uid,
      adminName: currentUser.name,
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
      // ปุ่ม "แก้ไขชุดเกณฑ์นี้อีกครั้ง" เป็นสิทธิ์จัดการของ ADMIN เท่านั้น (ดู ACL.md)
      deactivateSetBtn.hidden = !setExists || !isAdmin;
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
    // total === 0 (ลบกฎเกณฑ์ออกจนหมด) ต้องไม่ถือว่า "ตรวจครบแล้ว" เพราะ 0 >= 0 เป็นจริงเสมอ
    var allReviewed = total > 0 && reviewedCount >= total;

    progressNote.classList.toggle("all-done", allReviewed);
    bulkApproveBtn.disabled = allReviewed || total === 0;
    progressNote.textContent = total === 0
      ? "ไม่มีกฎเกณฑ์เหลืออยู่ในชุดนี้แล้ว"
      : allReviewed
      ? "ตรวจสอบครบทุกข้อแล้ว (อนุมัติ " + approvedCount + ", ไม่อนุมัติ " + rejectedCount + " จาก " + total + ")"
      : "ดำเนินการแล้ว " + reviewedCount + " จาก " + total + " ข้อ (อนุมัติ " + approvedCount + ", ไม่อนุมัติ " + rejectedCount + ")";

    // banner "อนุมัติครบแล้ว/เปิดใช้งาน" เป็นข้อมูลเชิงจัดการของ ADMIN ล้วน — STAFF (อ่านอย่างเดียว) ไม่ต้องเห็น
    if (!isAdmin || !allReviewed || !setExists) {
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

    // STAFF ศึกษาได้เฉพาะชุดที่เปิดใช้งานแล้วเท่านั้น (ดู ACL.md) — ชุดที่ยัง pending ยังไม่ผ่านตรวจ
    if (!isAdmin && currentSetStatus !== "active") {
      ruleList.innerHTML = "<p>ชุดเกณฑ์นี้ยังไม่เปิดใช้งาน — ยังไม่พร้อมให้ศึกษา กลับไปเลือกชุดที่เปิดใช้งานแล้วจากหน้ารายการ</p>";
      return;
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

  // รอ auth.js เช็ค login + role ก่อน ถึงจะเริ่มอ่าน Firestore (ดู js/auth.js)
  window.CURMATE_AUTH_READY.then(function (user) {
    currentUser = user;
    isAdmin = user.role === "ADMIN";

    if (!isAdmin) {
      // STAFF: อ่านอย่างเดียวเพื่อศึกษา — ซ่อนทุกส่วนที่เป็นสิทธิ์จัดการของ ADMIN (ดู ACL.md)
      pageTitle.textContent = "ศึกษากฎเกณฑ์มาตรฐาน";
      pageLead.textContent = "อ่านกฎเกณฑ์ของชุดนี้จาก Firestore collection rules โดยตรง (กรองด้วย criteriaSetId) — หน้านี้เป็นแบบอ่านอย่างเดียวสำหรับศึกษาเกณฑ์";
      toolbar.hidden = true;
      uploadMoreLink.hidden = true;
      activeBanner.classList.remove("show");
    }

    โหลดข้อมูล().catch(function (err) {
      ruleList.innerHTML = "<p>โหลดข้อมูลไม่สำเร็จ: " + err.message + "</p>";
    });
  });
})();
