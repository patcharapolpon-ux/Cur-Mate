// ─────────────────────────────────────────────────────────────
// js/firebase-config.js — ค่าตั้งค่า Firebase ของโปรเจกต์นี้ (โปรเจกต์ cur-mate)
// ใช้ Firebase project เดียวกับ homework/curmate-mvp เดิม (ต่อยอด ไม่ได้แยกโปรเจกต์ใหม่)
// ─────────────────────────────────────────────────────────────

var firebaseConfig = {
  apiKey: "AIzaSyAMYyMDHKv01Rl8tAtIgdqgWQCG0E7PYs8",
  authDomain: "cur-mate.firebaseapp.com",
  projectId: "cur-mate",
  storageBucket: "cur-mate.firebasestorage.app",
  messagingSenderId: "208866272613",
  appId: "1:208866272613:web:5aa6543f72d08d30e0ed8c",
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
// storage-compat.js โหลดเฉพาะหน้าที่ต้องใช้จริง (06-create-criteria-set.html) — หน้าอื่นไม่โหลด SDK นี้
// เพื่อไม่เพิ่ม payload ที่ไม่ได้ใช้ จึงต้องเช็คก่อนเรียก firebase.storage() ไม่งั้นหน้าที่ไม่ได้โหลด SDK นี้จะพัง
var storage = (typeof firebase.storage === "function") ? firebase.storage() : null;
