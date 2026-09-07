// ─────────────────────────────────────────────────────────────
// js/manage-users.js — หน้า ADMIN ล้วน จัดการ field role ของ users collection
// เปลี่ยน role ผู้ใช้คนอื่นได้ทันที (เขียนกลับ Firestore จริง) ยกเว้นบัญชีของตัวเอง (ดู ACL.md)
// ─────────────────────────────────────────────────────────────

(function () {
  var tableBody = document.getElementById("usersTableBody");
  var currentUser = null;
  var ROLES = ["ADMIN", "STAFF"];

  function สร้างแถว(uid, data) {
    var tr = document.createElement("tr");
    var isSelf = uid === currentUser.uid;
    var roleCell = document.createElement("td");

    if (isSelf) {
      roleCell.innerHTML =
        '<span class="role-badge">' + (data.role || "ไม่ทราบ") + "</span> " +
        '<span class="self-note">(บัญชีของตัวเอง แก้ไขไม่ได้)</span>';
    } else {
      var select = document.createElement("select");
      select.className = "role-select";
      ROLES.forEach(function (role) {
        var option = document.createElement("option");
        option.value = role;
        option.textContent = role;
        if (role === data.role) { option.selected = true; }
        select.appendChild(option);
      });
      select.addEventListener("change", function () {
        เปลี่ยนRole(uid, select.value, select);
      });
      roleCell.appendChild(select);
    }

    var nameCell = document.createElement("td");
    nameCell.textContent = data.name || "-";
    var emailCell = document.createElement("td");
    emailCell.textContent = data.email || "-";

    tr.appendChild(nameCell);
    tr.appendChild(emailCell);
    tr.appendChild(roleCell);
    return tr;
  }

  async function เปลี่ยนRole(uid, newRole, selectEl) {
    selectEl.disabled = true;
    try {
      await db.collection("users").doc(uid).update({ role: newRole });
    } catch (err) {
      window.alert("เปลี่ยนบทบาทไม่สำเร็จ: " + err.message);
    }
    selectEl.disabled = false;
  }

  async function โหลดผู้ใช้() {
    tableBody.innerHTML = "<tr><td colspan=\"3\">กำลังโหลด…</td></tr>";
    var snapshot = await db.collection("users").orderBy("name").get();

    if (snapshot.empty) {
      tableBody.innerHTML = "<tr><td colspan=\"3\">ยังไม่มีผู้ใช้ในระบบ</td></tr>";
      return;
    }

    tableBody.innerHTML = "";
    snapshot.forEach(function (doc) {
      tableBody.appendChild(สร้างแถว(doc.id, doc.data()));
    });
  }

  window.CURMATE_AUTH_READY.then(function (user) {
    if (!window.CURMATE_REQUIRE_ADMIN(user)) { return; }
    currentUser = user;
    โหลดผู้ใช้().catch(function (err) {
      tableBody.innerHTML = "<tr><td colspan=\"3\">โหลดข้อมูลไม่สำเร็จ: " + err.message + "</td></tr>";
    });
  });
})();
