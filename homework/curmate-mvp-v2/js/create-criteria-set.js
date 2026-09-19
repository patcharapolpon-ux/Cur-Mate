// ─────────────────────────────────────────────────────────────
// js/create-criteria-set.js — บันทึกชุดเกณฑ์ใหม่ลง Firestore (collection criteriaSets)
// พร้อมลิงก์เอกสารจริง + ให้ AI สกัดกฎเกณฑ์จริง (เพิ่มเมื่อสัปดาห์ที่ 8, ปรับใหม่ภายในสัปดาห์เดียวกัน):
// 1) สร้าง criteriaSets (status: pending)
// 2) [ไม่บังคับ] ลิงก์เอกสารต้นฉบับ (Google Drive ที่ผู้ใช้อัปโหลด+แชร์เอง) เก็บเป็น string ตรงๆ ไว้ที่ sourceFileUrl —
//    เปลี่ยนจากอัปโหลดไฟล์ผ่าน Firebase Storage มาเป็นแบบนี้ตามคำแนะนำของอาจารย์ผู้สอน เพราะ Storage ต้องใช้แผน Blaze
// 3) [บังคับ] อ่านไฟล์ .md เป็นข้อความ (sourceMarkdownText) เก็บไว้ใช้ "สกัดใหม่" ได้อีกโดยไม่ต้องอัปโหลดซ้ำ
// 4) ส่ง sourceMarkdownText ให้ AI (js/ai-helper.js) สกัดเป็นรายการกฎเกณฑ์ เขียนเป็น rules ใหม่
// 5) บันทึกแถวใน criteriaSets/{id}/extractionLog ทุกครั้งที่สกัด
// ─────────────────────────────────────────────────────────────

(function () {
  var pdfLinkInput = document.getElementById("pdfLinkInput");
  var pdfLinkError = document.getElementById("pdfLinkError");
  var mdInput = document.getElementById("mdInput");
  var mdFileName = document.getElementById("mdFileName");
  var extractBtn = document.getElementById("extractBtn");
  var toast = document.getElementById("toast");
  var toastTitle = document.getElementById("toastTitle");
  var toastBody = document.getElementById("toastBody");

  // หน้านี้เป็นของ ADMIN ล้วน (สร้าง/แก้ไขชุดเกณฑ์เป็นสิทธิ์จัดการ ไม่ใช่แค่ดู — ดู ACL.md)
  var currentUser = null;
  var selectedMdFile = null;

  window.CURMATE_AUTH_READY.then(function (user) {
    if (!window.CURMATE_REQUIRE_ADMIN(user)) { return; }
    currentUser = user;
    updateExtractState();
  });

  // เช็คแค่รูปแบบ URL (http/https) ไม่บังคับว่าต้องเป็น drive.google.com เป๊ะ เผื่ออนาคตอยากใช้บริการเก็บไฟล์อื่น
  function isValidHttpUrl(value) {
    try {
      var url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (e) {
      return false;
    }
  }

  // ลิงก์ PDF ไม่บังคับ — มีแค่ไฟล์ .md กับชื่อชุดก็กดสกัดได้แล้ว แต่ถ้ากรอกลิงก์มาต้องเป็น URL ที่ใช้ได้จริง
  function updateExtractState() {
    var ชื่อกรอกแล้ว = document.getElementById("setName").value.trim().length > 0;
    var pdfLink = pdfLinkInput.value.trim();
    var pdfLinkOk = pdfLink.length === 0 || isValidHttpUrl(pdfLink);
    pdfLinkError.textContent = pdfLinkOk ? "" : "ลิงก์ไม่ถูกต้อง — ต้องขึ้นต้นด้วย http:// หรือ https://";
    extractBtn.disabled = !ชื่อกรอกแล้ว || !selectedMdFile || !currentUser || !pdfLinkOk;
  }

  pdfLinkInput.addEventListener("input", updateExtractState);

  mdInput.addEventListener("change", function () {
    selectedMdFile = mdInput.files[0] || null;
    mdFileName.textContent = selectedMdFile ? "เลือกแล้ว: " + selectedMdFile.name : "ยังไม่เลือกไฟล์";
    updateExtractState();
  });

  document.getElementById("setName").addEventListener("input", updateExtractState);

  function readFileAsText(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(reader.error); };
      reader.readAsText(file);
    });
  }

  function showToast(title, body) {
    toastTitle.textContent = title;
    toastBody.textContent = body || "";
    toast.classList.add("show");
  }

  // ตัว system prompt + ฟังก์ชัน parse ผลลัพธ์ AI ใช้ร่วมกับ "สกัดใหม่" ในหน้า 07 — ประกาศไว้ที่ js/ai-helper.js
  // (window.CURMATE_EXTRACT_SYSTEM_PROMPT / window.CURMATE_PARSE_RULE_ARRAY) เพื่อไม่ให้ต้องแก้ 2 จุด

  extractBtn.addEventListener("click", async function () {
    if (extractBtn.disabled) { return; }
    extractBtn.disabled = true;
    extractBtn.textContent = "กำลังบันทึก...";
    showToast("กำลังบันทึกชุดเกณฑ์...", "");

    try {
      var newSet = {
        name: document.getElementById("setName").value.trim(),
        academicYear: document.getElementById("setYear").value.trim(),
        degreeLevel: document.getElementById("setLevel").value,
        scope: document.getElementById("setScope").value.trim(),
        status: "pending",
        uploadedBy: currentUser.uid,
        uploadedByName: currentUser.name,
      };
      var setRef = await db.collection("criteriaSets").add(newSet);
      var setId = setRef.id;

      var markdownText = await readFileAsText(selectedMdFile);

      // ลิงก์ Google Drive ไม่บังคับ — ผู้ใช้อัปโหลด+แชร์ไฟล์เองนอกระบบแล้วแปะลิงก์มาตรงๆ (เช็ครูปแบบ URL แล้วตอน updateExtractState)
      var pdfLink = pdfLinkInput.value.trim();
      var updatePayload = { sourceMarkdownText: markdownText };
      if (pdfLink) {
        updatePayload.sourceFileUrl = pdfLink;
      }
      await setRef.update(updatePayload);

      showToast("กำลังสกัดกฎเกณฑ์ด้วย AI...", "โปรดรอสักครู่ — AI กำลังอ่านเอกสาร");
      var aiText = await window.CURMATE_CALL_AI([
        { role: "system", content: window.CURMATE_EXTRACT_SYSTEM_PROMPT },
        { role: "user", content: markdownText },
      ]);
      var ruleItems = window.CURMATE_PARSE_RULE_ARRAY(aiText);

      if (ruleItems.length === 0) {
        throw new Error("AI สกัดกฎเกณฑ์ไม่ได้เลยสักข้อ — ลองตรวจสอบเนื้อหาไฟล์ .md แล้วกดบันทึกใหม่");
      }

      var writes = ruleItems.map(function (item, index) {
        return db.collection("rules").add({
          criteriaSetId: setId,
          criteriaSetName: newSet.name, // denormalize ชื่อชุดเกณฑ์ไว้ด้วย เปิดดู rules ตรงๆ ใน Console แล้วรู้ทันทีว่าเป็นของชุดไหน
          ruleText: item.text,
          sourceRef: item.sourceRef, // เลขข้อ/หมวด/มาตราอ้างอิงกลับไปยังเอกสารต้นฉบับ (อาจเป็นค่าว่างถ้า AI หาไม่เจอ)
          order: index, // ลำดับตามที่ AI สกัดมา — js/rule-review.js ใช้เรียงตอนแสดงผล (ไม่ใช้ .orderBy ที่ query ตรงๆ
                         // เพราะจะทำให้กฎเกณฑ์เก่าที่ไม่มี field นี้หายไปจากผลลัพธ์)
          status: "pending",
        });
      });
      await Promise.all(writes);

      await setRef.collection("extractionLog").add({
        action: "extract",
        ruleCount: ruleItems.length,
        model: "google/gemini-2.5-flash-lite",
        triggeredBy: currentUser.uid,
        triggeredByName: currentUser.name,
        createdAt: new Date().toISOString(),
      });

      showToast("สกัดกฎเกณฑ์สำเร็จ", "พบ " + ruleItems.length + " ข้อ — กำลังพาไปตรวจสอบ");
      setTimeout(function () {
        window.location.href = "07-rule-review-approval.html#setId=" + encodeURIComponent(setId);
      }, 700);
    } catch (err) {
      showToast("เกิดข้อผิดพลาด — ยังไม่ได้สกัดกฎเกณฑ์", err.message);
      extractBtn.disabled = false;
      extractBtn.textContent = "บันทึกและสกัดกฎเกณฑ์";
    }
  });
})();
