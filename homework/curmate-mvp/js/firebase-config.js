// ─────────────────────────────────────────────────────────────
// js/firebase-config.js — ค่าตั้งค่า Firebase ของโปรเจกต์นี้
// ยังไม่ได้ใส่ค่าจริง — ต้องสร้างโปรเจกต์ Firebase ก่อน แล้วคัดลอก
// firebaseConfig จาก Firebase Console > Project settings > Your apps
// มาแทนที่ค่า placeholder ด้านล่างทั้งหมด
// ─────────────────────────────────────────────────────────────

var firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID",
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
