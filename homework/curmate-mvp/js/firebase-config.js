// ─────────────────────────────────────────────────────────────
// js/firebase-config.js — ค่าตั้งค่า Firebase ของโปรเจกต์นี้ (โปรเจกต์ cur-mate)
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
