// ─────────────────────────────────────────────────────────────
// js/signup.js — สมัครสมาชิกด้วย Firebase Auth (Email/Password)
// สร้างบัญชีใน Firebase Auth แล้วเขียน users/{uid} คู่กันทันที (name, email, role)
// บัญชีใหม่ทุกบัญชีได้ role "STAFF" เสมอ (ไม่ให้เลือกเองแล้ว — ดู ACL.md) ADMIN เลื่อน role ให้ทีหลังผ่านหน้า
// manage-users.html เอง (ยกเว้นแอดมินคนแรกของระบบ ตั้งค่าด้วยมือผ่าน Firebase Console)
// สมัครสำเร็จแล้ว signOut ออกก่อนพากลับหน้า login ให้ผู้ใช้ล็อกอินด้วยตัวเองอีกครั้ง
// ─────────────────────────────────────────────────────────────

(function () {
  var form = document.getElementById("signupForm");
  var nameInput = document.getElementById("name");
  var emailInput = document.getElementById("email");
  var passwordInput = document.getElementById("password");
  var confirmInput = document.getElementById("confirmPassword");
  var errorBox = document.getElementById("errorBox");
  var submitBtn = document.getElementById("submitBtn");

  function แปลข้อความ(err) {
    if (err.code === "auth/email-already-in-use") { return "อีเมลนี้มีบัญชีอยู่แล้ว"; }
    if (err.code === "auth/invalid-email") { return "รูปแบบอีเมลไม่ถูกต้อง"; }
    if (err.code === "auth/weak-password") { return "รหัสผ่านสั้นเกินไป (อย่างน้อย 6 ตัวอักษร)"; }
    return "สมัครสมาชิกไม่สำเร็จ: " + err.message;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorBox.hidden = true;

    if (passwordInput.value !== confirmInput.value) {
      errorBox.textContent = "รหัสผ่านทั้งสองช่องไม่ตรงกัน";
      errorBox.hidden = false;
      return;
    }
    if (passwordInput.value.length < 6) {
      errorBox.textContent = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร (ข้อกำหนดของ Firebase)";
      errorBox.hidden = false;
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "กำลังสมัครสมาชิก...";

    var name = nameInput.value.trim();
    var email = emailInput.value.trim();

    firebase.auth().createUserWithEmailAndPassword(email, passwordInput.value)
      .then(function (credential) {
        return db.collection("users").doc(credential.user.uid).set({
          name: name,
          email: email,
          role: "STAFF",
        });
      })
      .then(function () {
        return firebase.auth().signOut();
      })
      .then(function () {
        // ใช้ hash เหมือน rule-review.js เพราะ local static server บางตัวตัด query string ทิ้ง
        window.location.href = "login.html#signup=success";
      })
      .catch(function (err) {
        errorBox.textContent = แปลข้อความ(err);
        errorBox.hidden = false;
        submitBtn.disabled = false;
        submitBtn.textContent = "สมัครสมาชิก";
      });
  });
})();
