// ─────────────────────────────────────────────────────────────
// js/seed.js — ใส่ข้อมูลตัวอย่างจาก js/data.js ลง Firestore ครั้งเดียว
// ใช้เฉพาะตอนตั้งค่าโปรเจกต์ (seed.html) ไม่ใช่ส่วนหนึ่งของหน้าหลัก
// กดซ้ำได้อย่างปลอดภัย (เขียนทับด้วย id เดิม)
// ─────────────────────────────────────────────────────────────

(function () {
  var ปุ่ม = document.getElementById("ปุ่มเริ่ม");
  var log = document.getElementById("log");

  function เขียนล็อก(ข้อความ) {
    log.textContent += ข้อความ + "\n";
  }

  ปุ่ม.addEventListener("click", function () {
    ปุ่ม.disabled = true;
    ปุ่ม.textContent = "กำลังทำงาน…";
    runSeed()
      .then(function () {
        ปุ่ม.textContent = "เสร็จแล้ว — กดซ้ำได้ถ้าต้องการ";
        ปุ่ม.disabled = false;
      })
      .catch(function (err) {
        เขียนล็อก("❌ เกิดข้อผิดพลาด: " + err.message);
        เขียนล็อก("   ตรวจสอบว่าตั้ง Firestore Rules อนุญาตให้ write ไว้ชั่วคราวหรือยัง (Test mode)");
        ปุ่ม.disabled = false;
        ปุ่ม.textContent = "ลองอีกครั้ง";
      });
  });

  async function runSeed() {
    var ข้อมูล = window.CURMATE_DATA;

    เขียนล็อก("── users ──");
    for (var i = 0; i < ข้อมูล.users.length; i++) {
      var u = Object.assign({}, ข้อมูล.users[i]);
      var uid = u.id;
      delete u.id;
      await db.collection("users").doc(uid).set(u);
      เขียนล็อก("✅ users/" + uid);
    }

    เขียนล็อก("── criteriaSets ──");
    for (var j = 0; j < ข้อมูล.criteriaSets.length; j++) {
      var cs = Object.assign({}, ข้อมูล.criteriaSets[j]);
      var csid = cs.id;
      delete cs.id;
      await db.collection("criteriaSets").doc(csid).set(cs);
      เขียนล็อก("✅ criteriaSets/" + csid);
    }

    เขียนล็อก("── rules ──");
    for (var k = 0; k < ข้อมูล.rules.length; k++) {
      var r = Object.assign({}, ข้อมูล.rules[k]);
      var rid = r.id;
      delete r.id;
      await db.collection("rules").doc(rid).set(r);
      เขียนล็อก("✅ rules/" + rid);
    }

    เขียนล็อก("── rules/{id}/reviewLog (subcollection) ──");
    for (var m = 0; m < ข้อมูล.reviewLog.length; m++) {
      var log_ = Object.assign({}, ข้อมูล.reviewLog[m]);
      var logid = log_.id;
      var ruleId = log_.ruleId;
      delete log_.id;
      delete log_.ruleId;
      await db.collection("rules").doc(ruleId)
              .collection("reviewLog").doc(logid).set(log_);
      เขียนล็อก("✅ rules/" + ruleId + "/reviewLog/" + logid);
    }

    เขียนล็อก("");
    เขียนล็อก("🎉 ใส่ข้อมูลตัวอย่างเสร็จสมบูรณ์ — เปิด rules-list.html ดูได้เลย");
  }
})();
