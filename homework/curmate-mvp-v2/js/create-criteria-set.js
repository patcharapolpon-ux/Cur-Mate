// ─────────────────────────────────────────────────────────────
// js/create-criteria-set.js — บันทึกชุดเกณฑ์ใหม่ลง Firestore (collection criteriaSets)
// พร้อมอัปโหลดเอกสารจริง + ให้ AI สกัดกฎเกณฑ์จริง (เพิ่มเมื่อสัปดาห์ที่ 8):
// 1) สร้าง criteriaSets (status: pending)
// 2) [ไม่บังคับ] อัปโหลดไฟล์ PDF ต้นฉบับขึ้น Firebase Storage เก็บ URL ไว้ดูอ้างอิง (sourceFileUrl) —
//    ต้องใช้แผน Blaze ถึงจะใช้ Storage ได้จริง ถ้ายังไม่ได้อัปเกรด/ไม่ได้เลือกไฟล์ PDF จะข้ามขั้นนี้ไปเลย
//    ไม่บล็อกการสกัดกฎเกณฑ์ (มี timeout กันไม่ให้ค้างรอ retry ของ Storage SDK นานเกินไป)
// 3) [บังคับ] อ่านไฟล์ .md เป็นข้อความ (sourceMarkdownText) เก็บไว้ใช้ "สกัดใหม่" ได้อีกโดยไม่ต้องอัปโหลดซ้ำ
// 4) ส่ง sourceMarkdownText ให้ AI (js/ai-helper.js) สกัดเป็นรายการกฎเกณฑ์ เขียนเป็น rules ใหม่
// 5) บันทึกแถวใน criteriaSets/{id}/extractionLog ทุกครั้งที่สกัด
// ─────────────────────────────────────────────────────────────

(function () {
  var pdfInput = document.getElementById("pdfInput");
  var mdInput = document.getElementById("mdInput");
  var pdfFileName = document.getElementById("pdfFileName");
  var mdFileName = document.getElementById("mdFileName");
  var extractBtn = document.getElementById("extractBtn");
  var toast = document.getElementById("toast");
  var toastTitle = document.getElementById("toastTitle");
  var toastBody = document.getElementById("toastBody");

  // หน้านี้เป็นของ ADMIN ล้วน (สร้าง/แก้ไขชุดเกณฑ์เป็นสิทธิ์จัดการ ไม่ใช่แค่ดู — ดู ACL.md)
  var currentUser = null;
  var selectedPdfFile = null;
  var selectedMdFile = null;

  window.CURMATE_AUTH_READY.then(function (user) {
    if (!window.CURMATE_REQUIRE_ADMIN(user)) { return; }
    currentUser = user;
    updateExtractState();
  });

  // PDF ไม่บังคับ (ต้องมี Firebase Storage แผน Blaze ถึงจะอัปโหลดได้จริง) — มีแค่ไฟล์ .md กับชื่อชุดก็กดสกัดได้แล้ว
  function updateExtractState() {
    var ชื่อกรอกแล้ว = document.getElementById("setName").value.trim().length > 0;
    extractBtn.disabled = !ชื่อกรอกแล้ว || !selectedMdFile || !currentUser;
  }

  pdfInput.addEventListener("change", function () {
    selectedPdfFile = pdfInput.files[0] || null;
    pdfFileName.textContent = selectedPdfFile ? "เลือกแล้ว: " + selectedPdfFile.name : "ยังไม่เลือกไฟล์";
    updateExtractState();
  });

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

  // อัปโหลด PDF ขึ้น Firebase Storage แบบมี timeout กันไม่ให้ค้าง — Storage SDK จะ retry เองอัตโนมัติเวลา
  // เรียกไม่ผ่าน (เช่น Storage ยังไม่ได้อัปเกรดเป็นแผน Blaze) ซึ่งอาจกินเวลาหลายนาทีกว่าจะ error ออกมาจริง
  // ฟังก์ชันนี้เลย "ยอมแพ้" เองภายใน timeoutMs แทนการรอ SDK retry จนจบ — คืนค่า null ถ้าอัปโหลดไม่สำเร็จ/หมดเวลา
  // (ไม่ throw เพราะ PDF เป็นแค่ของเสริม ไม่ควรทำให้การสกัดกฎเกณฑ์หลักพังไปด้วย)
  function uploadPdfWithTimeout(file, setId, timeoutMs) {
    return new Promise(function (resolve) {
      var settled = false;
      var timer = setTimeout(function () {
        if (settled) { return; }
        settled = true;
        resolve(null);
      }, timeoutMs);

      var storageRef = storage.ref("criteriaDocuments/" + setId + "/" + file.name);
      storageRef.put(file)
        .then(function () { return storageRef.getDownloadURL(); })
        .then(function (url) {
          if (settled) { return; }
          settled = true;
          clearTimeout(timer);
          resolve({ url: url, name: file.name });
        })
        .catch(function () {
          if (settled) { return; }
          settled = true;
          clearTimeout(timer);
          resolve(null);
        });
    });
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

      // PDF ไม่บังคับ — ถ้าเลือกไฟล์มาและ Storage ใช้งานได้จริง (แผน Blaze) จะได้ sourceFileUrl กลับมา
      // ถ้าไม่ได้เลือกไฟล์ หรือ Storage ใช้งานไม่ได้/หมดเวลา ก็ข้ามไปสกัดกฎเกณฑ์ต่อทันที ไม่ค้างรอ
      var pdfResult = null;
      if (selectedPdfFile && storage) {
        showToast("กำลังอัปโหลดเอกสารต้นฉบับ (PDF)...", "ไม่บังคับ — ถ้าอัปโหลดไม่สำเร็จภายใน 15 วินาทีจะข้ามไปสกัดกฎเกณฑ์ต่อทันที");
        pdfResult = await uploadPdfWithTimeout(selectedPdfFile, setId, 15000);
      }

      var markdownText = await readFileAsText(selectedMdFile);

      var updatePayload = { sourceMarkdownText: markdownText };
      if (pdfResult) {
        updatePayload.sourceFileUrl = pdfResult.url;
        updatePayload.sourceFileName = pdfResult.name;
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
