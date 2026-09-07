// ─────────────────────────────────────────────────────────────
// js/auth.js — auth guard ที่ใช้ร่วมกันในหน้า 05/06/07/manage-users (ต้อง login ก่อนถึงจะเข้าได้)
// โหลดหลัง js/firebase-config.js (พึ่ง global `db`) และ "ก่อน" script เฉพาะหน้าเสมอ
// เพราะ script เฉพาะหน้าต้องรอ window.CURMATE_AUTH_READY resolve ก่อนเริ่ม query Firestore
//
// role ที่มีในระบบ: "ADMIN" (จัดการเกณฑ์+จัดการ role ผู้ใช้อื่น) และ "STAFF" (อ่านเกณฑ์ที่เปิดใช้งานแล้วเพื่อศึกษา)
// ดูสิทธิ์แบบเต็มใน ACL.md — ไฟล์นี้แค่ยืนยันตัวตน + โหลด role ไม่ได้ปิดกั้นตาม role เอง
// เพราะ 05/07 เปิดให้ทั้งสอง role เข้าดูได้ (ต่างกันที่ปุ่ม/ขอบเขตข้อมูลที่เห็น)
// ─────────────────────────────────────────────────────────────

window.CURMATE_AUTH_READY = new Promise(function (resolve) {
  firebase.auth().onAuthStateChanged(function (user) {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    db.collection("users").doc(user.uid).get().then(function (doc) {
      var profile = doc.exists ? doc.data() : {};
      var currentUser = {
        uid: user.uid,
        email: user.email,
        name: profile.name || user.email,
        role: profile.role || null,
      };

      var sessionEl = document.getElementById("userSession");
      var nameEl = document.getElementById("userSessionName");
      if (sessionEl && nameEl) {
        nameEl.textContent = currentUser.name + " · " + (currentUser.role || "ไม่ทราบบทบาท");
        sessionEl.hidden = false;
      }

      // ลิงก์ "จัดการผู้ใช้" (ถ้าหน้านั้นมี element นี้) โชว์ให้เฉพาะ ADMIN เห็น
      var manageUsersLink = document.getElementById("manageUsersLink");
      if (manageUsersLink) {
        manageUsersLink.hidden = currentUser.role !== "ADMIN";
      }

      resolve(currentUser);
    });
  });
});

// เรียกจากหน้าที่เป็นของ ADMIN ล้วน (06-create-criteria-set, manage-users) เพื่อปิดกั้น role อื่น
// คืนค่า true ถ้าผ่าน (เป็น ADMIN), false ถ้าไม่ผ่าน (แทนที่เนื้อหาทั้งหน้าด้วยข้อความไม่มีสิทธิ์แล้ว)
window.CURMATE_REQUIRE_ADMIN = function (currentUser) {
  if (currentUser.role === "ADMIN") {
    return true;
  }

  document.body.innerHTML =
    '<div style="max-width:480px;margin:96px auto;text-align:center;font-family:\'IBM Plex Sans Thai\',\'Noto Sans Thai\',sans-serif;padding:0 24px;">' +
      "<h1 style=\"font-size:22px;margin-bottom:12px;\">ไม่มีสิทธิ์เข้าถึงหน้านี้</h1>" +
      "<p style=\"color:#475569;margin-bottom:24px;\">หน้านี้เปิดให้เฉพาะบทบาท &quot;ADMIN&quot; เท่านั้น — บัญชีนี้เป็นบทบาท &quot;" + (currentUser.role || "ไม่ทราบ") + "&quot;</p>" +
      '<a href="05-criteria-dashboard.html" style="height:40px;line-height:40px;display:inline-block;padding:0 20px;border-radius:8px;border:1.5px solid #2563EB;background:transparent;color:#2563EB;font-weight:600;text-decoration:none;margin-right:8px;">กลับไปหน้ารายการชุดเกณฑ์</a>' +
      '<button type="button" id="deniedLogoutBtn" style="height:40px;padding:0 20px;border-radius:8px;border:1.5px solid #2563EB;background:transparent;color:#2563EB;font-weight:600;cursor:pointer;">ออกจากระบบ</button>' +
    "</div>";
  document.getElementById("deniedLogoutBtn").addEventListener("click", function () {
    firebase.auth().signOut().then(function () {
      window.location.href = "login.html";
    });
  });
  return false;
};

document.addEventListener("DOMContentLoaded", function () {
  var logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      firebase.auth().signOut().then(function () {
        window.location.href = "login.html";
      });
    });
  }
});
