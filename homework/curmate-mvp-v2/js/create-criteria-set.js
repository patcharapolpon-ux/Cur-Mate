// ─────────────────────────────────────────────────────────────
// js/create-criteria-set.js — บันทึกชุดเกณฑ์ใหม่ลง Firestore (collection criteriaSets)
// ส่วนอัปโหลดไฟล์ + การสกัดกฎเกณฑ์ด้วย AI ยังคง "จำลอง" เหมือน prototype เดิม
// (ไม่ทำจริงในเวอร์ชันนี้ — ดูเหตุผลใน SCOPE.md หัวข้อขอบเขตที่ยังไม่ทำ)
// ─────────────────────────────────────────────────────────────

(function () {
  var dropzone = document.getElementById("dropzone");
  var fileList = document.getElementById("fileList");
  var extractBtn = document.getElementById("extractBtn");
  var toast = document.getElementById("toast");
  var toastTitle = document.getElementById("toastTitle");
  var toastBody = document.getElementById("toastBody");
  var fileCount = 0;

  var mockFileNames = [
    "ประกาศเกณฑ์มาตรฐานหลักสูตร-วิทยาการคอมพิวเตอร์-2569.pdf",
    "เกณฑ์มาตรฐานคุณวุฒิระดับปริญญาตรี-ภาคผนวก.docx",
    "ตารางโครงสร้างหน่วยกิตหมวดวิชาเฉพาะ-2569.pdf",
  ];

  var docIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="1.75"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>';

  function addFile() {
    var name = mockFileNames[fileCount % mockFileNames.length];
    fileCount += 1;
    var item = document.createElement("div");
    item.className = "file-item";
    item.innerHTML =
      '<div class="file-icon">' + docIcon + "</div>" +
      '<div class="file-info">' +
        '<p class="file-name">' + name + "</p>" +
        '<p class="file-meta">อัปโหลดสำเร็จ (จำลอง) · เอกสารที่ ' + fileCount + " ของชุดนี้</p>" +
      "</div>" +
      '<button type="button" class="file-remove">นำออก</button>';
    item.querySelector(".file-remove").addEventListener("click", function () {
      fileList.removeChild(item);
      updateExtractState();
    });
    fileList.appendChild(item);
    updateExtractState();
  }

  function updateExtractState() {
    var ชื่อกรอกแล้ว = document.getElementById("setName").value.trim().length > 0;
    extractBtn.disabled = fileList.children.length === 0 || !ชื่อกรอกแล้ว;
  }

  dropzone.addEventListener("click", addFile);
  dropzone.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      addFile();
    }
  });
  document.getElementById("setName").addEventListener("input", updateExtractState);

  extractBtn.addEventListener("click", function () {
    if (extractBtn.disabled) { return; }
    extractBtn.disabled = true;
    extractBtn.textContent = "กำลังบันทึก...";
    toastTitle.textContent = "กำลังบันทึกชุดเกณฑ์...";
    toastBody.textContent = "การสกัดกฎเกณฑ์ด้วย AI จริงยังไม่ได้ทำในเวอร์ชันนี้ — บันทึกเฉพาะข้อมูลชุดเกณฑ์ลง Firestore ก่อน";
    toast.classList.add("show");

    var newSet = {
      name: document.getElementById("setName").value.trim(),
      academicYear: document.getElementById("setYear").value.trim(),
      degreeLevel: document.getElementById("setLevel").value,
      scope: document.getElementById("setScope").value.trim(),
      status: "pending",
    };

    db.collection("criteriaSets").add(newSet)
      .then(function () {
        setTimeout(function () {
          window.location.href = "05-criteria-dashboard.html";
        }, 700);
      })
      .catch(function (err) {
        toastTitle.textContent = "บันทึกไม่สำเร็จ";
        toastBody.textContent = err.message;
        extractBtn.disabled = false;
        extractBtn.textContent = "บันทึกและสกัดกฎเกณฑ์";
      });
  });
})();
