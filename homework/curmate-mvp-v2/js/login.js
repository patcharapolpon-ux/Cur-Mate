// ─────────────────────────────────────────────────────────────
// js/login.js — เข้าสู่ระบบด้วย Firebase Auth (Email/Password)
// login สำเร็จแล้วพาไปหน้ารายการชุดเกณฑ์ (05) — auth.js ที่หน้านั้นจะเช็ค role เองอีกที
// ─────────────────────────────────────────────────────────────

(function () {
  var form = document.getElementById("loginForm");
  var emailInput = document.getElementById("email");
  var passwordInput = document.getElementById("password");
  var errorBox = document.getElementById("errorBox");
  var successBox = document.getElementById("successBox");
  var submitBtn = document.getElementById("submitBtn");

  // มาจากหน้าสมัครสมาชิกสำเร็จ — ใช้ hash เหมือน rule-review.js เพราะ local static
  // server บางตัว (เช่น npx serve) ตัด query string ทิ้งระหว่าง redirect .html -> clean URL
  var hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  if (hashParams.get("signup") === "success") {
    successBox.hidden = false;
  }

  // ถ้า login ค้างอยู่แล้ว (เช่นเปิดแท็บใหม่) ไม่ต้องกรอกซ้ำ พาไปหน้ารายการเลย
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      window.location.href = "05-criteria-dashboard.html";
    }
  });

  function แปลข้อความ(err) {
    if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
      return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
    }
    if (err.code === "auth/invalid-email") {
      return "รูปแบบอีเมลไม่ถูกต้อง";
    }
    if (err.code === "auth/too-many-requests") {
      return "ลองผิดหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่";
    }
    return "เข้าสู่ระบบไม่สำเร็จ: " + err.message;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorBox.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = "กำลังเข้าสู่ระบบ...";

    firebase.auth().signInWithEmailAndPassword(emailInput.value.trim(), passwordInput.value)
      .then(function () {
        window.location.href = "05-criteria-dashboard.html";
      })
      .catch(function (err) {
        errorBox.textContent = แปลข้อความ(err);
        errorBox.hidden = false;
        submitBtn.disabled = false;
        submitBtn.textContent = "เข้าสู่ระบบ";
      });
  });
})();
