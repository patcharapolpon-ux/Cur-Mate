// ─────────────────────────────────────────────────────────────
// js/rule-review.js — อ่าน rules ของชุดเกณฑ์ (#setId=...) จาก Firestore
// เปิดให้ทั้ง role ADMIN และ STAFF เข้าดูได้ (ดู ACL.md) แต่ทำได้ไม่เท่ากัน:
// - ADMIN: อนุมัติ/ไม่อนุมัติ/ลบ/แก้ไข/เปิดใช้งานชุดเกณฑ์/สกัดใหม่/แก้ไขคำ/จัดหมวดหมู่ ได้ตามเดิมทุกประการ
// - STAFF: อ่านอย่างเดียวเพื่อศึกษา — ไม่มีปุ่มใดๆ ทั้งสิ้น และเข้าดูได้เฉพาะชุดที่ "เปิดใช้งาน (active)"
//   แล้วเท่านั้น (ชุดที่ยัง pending ยังไม่ผ่านตรวจ ไม่ให้ศึกษา)
//
// ปุ่มอนุมัติ/ไม่อนุมัติ/อนุมัติทั้งหมด เขียนสถานะจริงกลับไปที่ rules/{id}
// (แก้เฉพาะ field status เท่านั้น) พร้อมบันทึก rules/{id}/reviewLog
//
// เพิ่มเมื่อสัปดาห์ที่ 8 (ผู้ช่วย AI):
// - "ดูเอกสารต้นฉบับ (PDF)": เปิด criteriaSets.sourceFileUrl แท็บใหม่
// - "สกัดใหม่ด้วย AI": ลบกฎเกณฑ์ pending เดิมทั้งหมด แล้วเรียก AI สกัดจาก sourceMarkdownText เดิมซ้ำ
//   (ระดับ 2 - agentic: อ่านเอกสาร → สรุปเป็นกฎเกณฑ์ → เขียนกลับ rules → บันทึก extractionLog)
// - "แก้ไขคำ" ต่อข้อ (เฉพาะสถานะ pending): แก้ ruleText ตรงๆ
// - "ให้ AI ช่วยจัดหมวดหมู่" ต่อข้อ (ระดับ 1 - single call): AI แนะนำหมวดหมู่ ต้องกดยืนยันก่อนเขียน rules.category จริง
//
// ผู้อนุมัติ (adminId/adminName ใน reviewLog) มาจากผู้ login อยู่จริง (js/auth.js)
// ─────────────────────────────────────────────────────────────

(function () {
  var currentUser = null;
  var isAdmin = false;
  var toolbar = document.getElementById("toolbar");
  var uploadMoreLink = document.getElementById("uploadMoreLink");
  var pageTitle = document.getElementById("pageTitle");
  var pageLead = document.getElementById("pageLead");
  var viewSourceLink = document.getElementById("viewSourceLink");
  var reExtractBtn = document.getElementById("reExtractBtn");
  var reExtractStatus = document.getElementById("reExtractStatus");
  var reExtractStatusTitle = document.getElementById("reExtractStatusTitle");
  var reExtractStatusBody = document.getElementById("reExtractStatusBody");

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

  // ชุดหมวดหมู่ปิดตายตัว (closed set) — AI ต้องเลือกจากรายการนี้เท่านั้น กันชื่อหมวดเพี้ยนคำละนิดในแต่ละครั้งที่เรียก
  var CLASSIFY_CATEGORIES = [
    "หน่วยกิตรวม", "สัดส่วนหมวดวิชา", "คุณวุฒิ/จำนวนอาจารย์", "คุณสมบัติผู้เข้าศึกษา",
    "ระบบการจัดการศึกษา", "การลงทะเบียนเรียน", "เกณฑ์จบการศึกษา", "อื่นๆ",
  ];

  var CLASSIFY_SYSTEM_PROMPT =
    "คุณช่วยจัดหมวดหมู่กฎเกณฑ์มาตรฐานหลักสูตร 1 ข้อ โดยต้องเลือกจากรายการหมวดที่กำหนดไว้เท่านั้น ห้ามตั้งชื่อหมวดขึ้นเอง: " +
    CLASSIFY_CATEGORIES.join(", ") + ". " +
    "ผู้ใช้จะบอกชื่อและระดับการศึกษาของชุดเกณฑ์นั้นมาด้วย ใช้ข้อมูลนี้เป็นบริบทหลักในการตัดสินใจ " +
    "ไม่ใช่จัดหมวดตามคำที่ปรากฏเด่นในข้อความเพียงอย่างเดียว (เช่น ถ้าชุดเกณฑ์เป็นระดับ \"ปริญญาตรี\" แต่เนื้อหากฎข้อนั้นพูดถึง " +
    "การเรียนวิชาระดับบัณฑิตศึกษาเพิ่มเติมสำหรับหลักสูตรก้าวหน้า ก็ยังถือว่าเป็นกฎเกณฑ์ของปริญญาตรี ไม่ใช่หมวดของบัณฑิตศึกษา) " +
    "ถ้าไม่เข้าหมวดไหนเลยจริงๆ ให้ตอบ \"อื่นๆ\" " +
    "ตอบกลับเป็นชื่อหมวดที่เลือกคำเดียว ตรงตัวตามรายการด้านบนเป๊ะๆ ห้ามมีคำอธิบายเพิ่มหรือเครื่องหมายคำพูดล้อมรอบ";

  // สถานะจริงของ criteriaSets/{setId} ตามที่อ่านมาจาก Firestore (ไม่ใช่ค่าที่คำนวณจากการนับการ์ด)
  var setExists = false;
  var currentSetStatus = "pending";
  var currentSetData = null;
  // แคชข้อมูลล่าสุดของแต่ละกฎเกณฑ์ (ruleText/category) ไว้ใช้ re-render ตอนแก้ไข/จัดหมวดหมู่
  // โดยไม่ต้องอ่าน Firestore ซ้ำทุกครั้ง
  var ruleDataById = {};

  if (!setId) {
    ruleList.innerHTML = "<p>ไม่พบชุดเกณฑ์ที่ต้องการ — กลับไปหน้ารายการแล้วเลือกใหม่อีกครั้ง</p>";
    bulkApproveBtn.disabled = true;
    return;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderRuleCard(id, data) {
    ruleDataById[id] = { ruleText: data.ruleText, category: data.category || null, sourceRef: data.sourceRef || "" };

    var card = document.createElement("div");
    card.className = "rule-card" + statusClass(data.status);
    card.dataset.ruleId = id;
    card.dataset.editing = "false";
    card.dataset.textEditing = "false";

    card.innerHTML =
      '<div class="rule-card-top"><span class="ai-badge">AI SUGGESTED</span></div>' +
      '<div class="category-area"></div>' +
      '<div class="rule-text-area"></div>' +
      '<div class="rule-actions"></div>';

    renderRuleTextArea(card, id);
    renderCategoryArea(card, id);
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

  // แสดงข้อความกฎเกณฑ์ตรงๆ หรือสลับเป็น textarea แก้ไขคำ (เฉพาะที่ ADMIN กด "แก้ไขคำ" — เก็บสถานะไว้ที่ card.dataset.textEditing)
  // sourceRef (เลขข้อ/หมวด/มาตราจากเอกสารต้นฉบับ) เป็น read-only เสมอ — มาจาก AI ล้วน แก้ไขผ่าน UI ไม่ได้
  function renderRuleTextArea(card, ruleId) {
    var el = card.querySelector(".rule-text-area");
    var ruleData = ruleDataById[ruleId];
    var textEditing = card.dataset.textEditing === "true";
    var sourceRefHtml = ruleData.sourceRef
      ? '<p class="rule-source-ref">อ้างอิงจาก: ' + escapeHtml(ruleData.sourceRef) + "</p>"
      : "";

    if (!textEditing) {
      el.innerHTML = sourceRefHtml + '<p class="rule-text">' + escapeHtml(ruleData.ruleText) + "</p>";
      return;
    }

    el.innerHTML =
      sourceRefHtml +
      '<textarea class="rule-edit-area">' + escapeHtml(ruleData.ruleText) + "</textarea>" +
      '<div class="rule-actions" style="margin-bottom:12px;">' +
        '<button type="button" class="btn btn-primary btn-small save-text-btn">บันทึกคำที่แก้ไข</button>' +
        '<button type="button" class="btn btn-secondary btn-small cancel-text-btn">ยกเลิก</button>' +
      "</div>";

    el.querySelector(".save-text-btn").addEventListener("click", async function () {
      var newText = el.querySelector(".rule-edit-area").value.trim();
      if (!newText) {
        window.alert("กรุณากรอกข้อความกฎเกณฑ์ ห้ามเว้นว่าง");
        return;
      }
      await db.collection("rules").doc(ruleId).update({ ruleText: newText });
      ruleDataById[ruleId].ruleText = newText;
      card.dataset.textEditing = "false";
      renderRuleTextArea(card, ruleId);
    });
    el.querySelector(".cancel-text-btn").addEventListener("click", function () {
      card.dataset.textEditing = "false";
      renderRuleTextArea(card, ruleId);
    });
  }

  // แสดงหมวดหมู่ที่มีอยู่แล้ว (ทุก role เห็นได้) หรือปุ่ม "ให้ AI ช่วยจัดหมวดหมู่" (ADMIN เท่านั้น — เขียนข้อมูลใหม่)
  function renderCategoryArea(card, ruleId) {
    var el = card.querySelector(".category-area");
    var ruleData = ruleDataById[ruleId];

    if (ruleData.category) {
      el.innerHTML =
        '<div class="category-row"><span class="category-chip">หมวด: ' + escapeHtml(ruleData.category) + "</span></div>";
      return;
    }

    if (!isAdmin) {
      el.innerHTML = "";
      return;
    }

    el.innerHTML =
      '<div class="category-row"><button type="button" class="btn btn-secondary btn-small classify-btn">ให้ AI ช่วยจัดหมวดหมู่</button></div>';
    el.querySelector(".classify-btn").addEventListener("click", function () {
      classifyRule(ruleId, card);
    });
  }

  // เรียก AI ครั้งเดียวต่อข้อ (ระดับ 1 ของโจทย์การบ้าน) — มีสัญญาณกำลังทำงาน, ป้าย "AI แนะนำ",
  // ต้องกดยืนยันก่อนเขียน Firestore จริง, และเรียกไม่สำเร็จแล้วไม่ค้าง (แสดง error + ปุ่มลองใหม่)
  async function classifyRule(ruleId, card) {
    var el = card.querySelector(".category-area");
    var ruleData = ruleDataById[ruleId];
    el.innerHTML =
      '<div class="category-row"><span class="ai-badge">AI</span>' +
      '<span style="font-size:13px;color:var(--color-text-secondary);">กำลังจัดหมวดหมู่...</span></div>';

    try {
      // ส่งบริบทระดับการศึกษา/ชื่อชุดเกณฑ์นำหน้าเสมอ กัน AI จัดหมวดหลงตามคำที่ปรากฏในข้อความเพียงอย่างเดียว
      // (เช่น กฎของ ป.ตรี ที่มีคำว่า "บัณฑิตศึกษา" ปนอยู่ ต้องไม่ถูกจัดเป็นหมวดของบัณฑิตศึกษา)
      var contextPrefix = currentSetData
        ? "ชุดเกณฑ์: " + currentSetData.name + " (ระดับการศึกษา: " + currentSetData.degreeLevel + ")\nกฎเกณฑ์ข้อนี้: "
        : "";
      var aiText = await window.CURMATE_CALL_AI([
        { role: "system", content: CLASSIFY_SYSTEM_PROMPT },
        { role: "user", content: contextPrefix + ruleData.ruleText },
      ]);
      var suggestion = aiText.trim().replace(/^["']|["']$/g, "");

      el.innerHTML =
        '<div class="category-suggestion"><span class="ai-badge">AI แนะนำ</span><span>' + escapeHtml(suggestion) + "</span>" +
        '<button type="button" class="btn btn-primary btn-small confirm-category-btn">ยืนยัน</button>' +
        '<button type="button" class="btn btn-secondary btn-small cancel-category-btn">ยกเลิก</button></div>';

      el.querySelector(".confirm-category-btn").addEventListener("click", async function () {
        el.querySelector(".confirm-category-btn").disabled = true;
        await db.collection("rules").doc(ruleId).update({ category: suggestion });
        ruleDataById[ruleId].category = suggestion;
        renderCategoryArea(card, ruleId);
      });
      el.querySelector(".cancel-category-btn").addEventListener("click", function () {
        renderCategoryArea(card, ruleId);
      });
    } catch (err) {
      el.innerHTML =
        '<div class="category-row"><span class="category-error">จัดหมวดหมู่ไม่สำเร็จ: ' + escapeHtml(err.message) + "</span>" +
        '<button type="button" class="btn btn-secondary btn-small retry-classify-btn">ลองใหม่</button></div>';
      el.querySelector(".retry-classify-btn").addEventListener("click", function () {
        classifyRule(ruleId, card);
      });
    }
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
        '<button type="button" class="btn btn-secondary btn-small btn-edit-text">แก้ไขคำ</button>' +
        '<button type="button" class="btn btn-danger btn-small">ลบ</button>';
      actionsEl.querySelector(".btn-approve").addEventListener("click", function () {
        approveRule(ruleId, card);
      });
      actionsEl.querySelector(".btn-reject").addEventListener("click", function () {
        rejectRule(ruleId, card);
      });
      actionsEl.querySelector(".btn-edit-text").addEventListener("click", function () {
        card.dataset.textEditing = "true";
        renderRuleTextArea(card, ruleId);
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
    var ruleText = ruleDataById[ruleId] ? ruleDataById[ruleId].ruleText : "";
    var confirmed = window.confirm(
      "ต้องการลบกฎเกณฑ์นี้ทิ้งถาวรหรือไม่?\n\n" + ruleText + "\n\nการลบนี้ไม่สามารถกู้คืนได้"
    );
    if (!confirmed) { return; }

    var deleteBtn = card.querySelector(".btn-danger");
    if (deleteBtn) { deleteBtn.disabled = true; }

    try {
      await deleteRuleAndLog(ruleId);

      delete ruleDataById[ruleId];
      card.remove();
      if (!ruleList.querySelector(".rule-card")) {
        ruleList.innerHTML = "<p>ไม่มีกฎเกณฑ์เหลืออยู่ในชุดนี้แล้ว — ลบไปหมดแล้ว</p>";
      }
      updateProgress();
    } catch (err) {
      window.alert("ลบกฎเกณฑ์ไม่สำเร็จ: " + err.message);
      if (deleteBtn) { deleteBtn.disabled = false; }
    }
  }

  // helper กลาง: ลบ rules/{id} พร้อม reviewLog ทั้งหมดใต้ข้อนั้น — ใช้ทั้งปุ่ม "ลบ" รายข้อ และตอน "สกัดใหม่"
  // (ลบกฎเกณฑ์ pending เดิมทั้งชุดก่อนเขียนผลสกัดใหม่ทับ)
  async function deleteRuleAndLog(ruleId) {
    var ref = db.collection("rules").doc(ruleId);
    var logSnapshot = await ref.collection("reviewLog").get();
    var logDeletions = [];
    logSnapshot.forEach(function (logDoc) { logDeletions.push(logDoc.ref.delete()); });
    await Promise.all(logDeletions);
    await ref.delete();
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
    card.dataset.textEditing = "false";
    renderRuleTextArea(card, ruleId);
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
    card.dataset.textEditing = "false";
    renderRuleTextArea(card, ruleId);
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

  // เปิดดูเอกสารต้นฉบับ (PDF) ที่อัปโหลดไว้ตอนสร้าง/สกัดกฎเกณฑ์ — ไม่มีให้ทุก role เห็น (STAFF เห็นได้เหมือน ADMIN เพราะเป็นแค่การดู)
  function renderViewSourceLink() {
    if (currentSetData && currentSetData.sourceFileUrl) {
      viewSourceLink.href = currentSetData.sourceFileUrl;
      viewSourceLink.hidden = false;
    } else {
      viewSourceLink.hidden = true;
    }
  }

  // ปุ่ม "สกัดใหม่ด้วย AI" — เฉพาะ ADMIN, ต้องมี sourceMarkdownText เก็บไว้ (ชุดที่ seed มือไว้แต่แรกไม่มี), และล็อกตอน active เหมือนปุ่มแก้ไขอื่นๆ
  function renderReExtractButton() {
    var canReExtract = isAdmin && currentSetData && currentSetData.sourceMarkdownText && currentSetStatus !== "active";
    reExtractBtn.hidden = !canReExtract;
  }

  reExtractBtn.addEventListener("click", async function () {
    if (!currentSetData || !currentSetData.sourceMarkdownText) { return; }
    var confirmed = window.confirm(
      "ต้องการสกัดกฎเกณฑ์ใหม่จากเอกสารเดิมหรือไม่?\n\n" +
      'กฎเกณฑ์ที่ยัง "รอตรวจสอบ" ทั้งหมดในชุดนี้จะถูกลบแล้วแทนที่ด้วยผลสกัดใหม่ ' +
      "ส่วนข้อที่อนุมัติ/ไม่อนุมัติไปแล้วจะไม่ถูกแตะต้อง"
    );
    if (!confirmed) { return; }

    reExtractBtn.disabled = true;
    reExtractStatusTitle.textContent = "กำลังสกัดกฎเกณฑ์ใหม่ด้วย AI...";
    reExtractStatusBody.textContent = "โปรดรอสักครู่ — กำลังลบกฎเกณฑ์ที่ยังรอตรวจสอบเดิมก่อนสกัดใหม่";
    reExtractStatus.classList.add("show");

    try {
      var pendingSnapshot = await db.collection("rules")
        .where("criteriaSetId", "==", setId)
        .where("status", "==", "pending")
        .get();
      for (var i = 0; i < pendingSnapshot.docs.length; i++) {
        await deleteRuleAndLog(pendingSnapshot.docs[i].id);
      }

      reExtractStatusBody.textContent = "กำลังให้ AI อ่านเอกสารและสกัดกฎเกณฑ์ใหม่...";
      var aiText = await window.CURMATE_CALL_AI([
        { role: "system", content: window.CURMATE_EXTRACT_SYSTEM_PROMPT },
        { role: "user", content: currentSetData.sourceMarkdownText },
      ]);
      var ruleItems = window.CURMATE_PARSE_RULE_ARRAY(aiText);

      if (ruleItems.length === 0) {
        throw new Error("AI สกัดกฎเกณฑ์ไม่ได้เลยสักข้อจากเอกสารเดิม");
      }

      var writes = ruleItems.map(function (item, index) {
        return db.collection("rules").add({
          criteriaSetId: setId,
          criteriaSetName: currentSetData.name,
          ruleText: item.text,
          sourceRef: item.sourceRef,
          order: index, // เก็บลำดับตามที่ AI สกัดมา (ตามลำดับในเอกสารต้นฉบับ) — ใช้เรียงตอนแสดงผลที่ โหลดข้อมูล()
          status: "pending",
        });
      });
      await Promise.all(writes);

      await db.collection("criteriaSets").doc(setId).collection("extractionLog").add({
        action: "re-extract",
        ruleCount: ruleItems.length,
        model: "google/gemini-2.5-flash-lite",
        triggeredBy: currentUser.uid,
        triggeredByName: currentUser.name,
        createdAt: new Date().toISOString(),
      });

      reExtractStatusTitle.textContent = "สกัดใหม่สำเร็จ";
      reExtractStatusBody.textContent = "พบกฎเกณฑ์ใหม่ " + ruleItems.length + " ข้อ (แทนที่ข้อที่ยังรอตรวจสอบเดิมทั้งหมดแล้ว)";
      await โหลดข้อมูล();
    } catch (err) {
      reExtractStatusTitle.textContent = "สกัดใหม่ไม่สำเร็จ";
      reExtractStatusBody.textContent = err.message;
    } finally {
      reExtractBtn.disabled = false;
    }
  });

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
    renderReExtractButton();
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
    renderReExtractButton();
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
    ruleDataById = {};

    var setDoc = await db.collection("criteriaSets").doc(setId).get();
    if (setDoc.exists) {
      setExists = true;
      currentSetData = setDoc.data();
      currentSetStatus = currentSetData.status || "pending";
      setNameEl.textContent = "ชุดเกณฑ์: " + currentSetData.name;
    } else {
      setExists = false;
      currentSetData = null;
      setNameEl.textContent = "ชุดเกณฑ์: (ไม่พบข้อมูล setId=" + setId + ")";
    }
    renderSetStatusChip();
    renderViewSourceLink();
    renderReExtractButton();

    // STAFF ศึกษาได้เฉพาะชุดที่เปิดใช้งานแล้วเท่านั้น (ดู ACL.md) — ชุดที่ยัง pending ยังไม่ผ่านตรวจ
    if (!isAdmin && currentSetStatus !== "active") {
      ruleList.innerHTML = "<p>ชุดเกณฑ์นี้ยังไม่เปิดใช้งาน — ยังไม่พร้อมให้ศึกษา กลับไปเลือกชุดที่เปิดใช้งานแล้วจากหน้ารายการ</p>";
      return;
    }

    var snapshot = await db.collection("rules").where("criteriaSetId", "==", setId).get();

    if (snapshot.empty) {
      ruleList.innerHTML = "<p>ยังไม่มีกฎเกณฑ์ที่ต้องตรวจสอบในชุดนี้</p>";
      bulkApproveBtn.disabled = true;
      progressNote.textContent = "ยังไม่มีกฎเกณฑ์ที่ต้องตรวจสอบ";
      return;
    }

    // เรียงตาม field "order" (ลำดับตามที่ AI สกัดมาจากเอกสารต้นฉบับ) — เรียงฝั่ง client เพราะกฎเกณฑ์เก่าที่ seed
    // ไว้ก่อนหน้านี้ไม่มี field นี้เลย ถ้าใช้ .orderBy("order") ตรงๆ ที่ query จะทำให้เอกสารเหล่านั้นหายไปจากผลลัพธ์
    // (Firestore ตัดเอกสารที่ไม่มี field ที่ orderBy ออกจากผลลัพธ์เสมอ) — ข้อที่ไม่มี order จะถูกจัดไปต่อท้ายสุดแทน
    var docs = [];
    snapshot.forEach(function (doc) { docs.push(doc); });
    docs.sort(function (a, b) {
      var orderA = typeof a.data().order === "number" ? a.data().order : Infinity;
      var orderB = typeof b.data().order === "number" ? b.data().order : Infinity;
      return orderA - orderB;
    });

    ruleList.innerHTML = "";
    docs.forEach(function (doc) {
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
