// ─────────────────────────────────────────────────────────────
// js/ai-helper.js — เรียก AI จริงผ่าน OpenRouter จากฝั่ง browser ตรงๆ (ไม่มี backend)
// ต้องโหลดหลัง js/ai-config.local.js เสมอ (พึ่งตัวแปร global OPENROUTER_API_KEY)
// โมเดลที่ใช้เป็นไปตามที่คอร์สกำหนด: google/gemini-2.5-flash-lite
// ─────────────────────────────────────────────────────────────

(function () {
  var MODEL = "google/gemini-2.5-flash-lite";
  var ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

  // messages: array แบบเดียวกับ OpenAI-style chat messages เช่น
  // [{role: "system", content: "..."}, {role: "user", content: "..."}]
  // คืนค่าเป็นข้อความตอบกลับ (string) หรือ throw Error ถ้าเรียกไม่สำเร็จ
  window.CURMATE_CALL_AI = async function (messages) {
    var res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + OPENROUTER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: MODEL, messages: messages }),
    });

    if (!res.ok) {
      var errText = await res.text();
      throw new Error("เรียก AI ไม่สำเร็จ (HTTP " + res.status + "): " + errText);
    }

    var data = await res.json();
    var content =
      data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!content) {
      throw new Error("AI ไม่ตอบข้อความกลับมา (รูปแบบผลลัพธ์ไม่ตรงที่คาดไว้)");
    }
    return content;
  };

  // ใช้ร่วมกันทั้งตอนสกัดครั้งแรก (js/create-criteria-set.js) และ "สกัดใหม่" (js/rule-review.js)
  // เพื่อให้ผลลัพธ์ที่ AI สกัดออกมาสอดคล้องกันไม่ว่าจะสกัดจากหน้าไหน
  // แต่ละข้อขอทั้งข้อความกฎเกณฑ์ (text) และเลขข้อ/หมวด/มาตราอ้างอิงกลับไปยังเอกสารต้นฉบับ (sourceRef)
  window.CURMATE_EXTRACT_SYSTEM_PROMPT =
    "คุณเป็นผู้ช่วยสกัดกฎเกณฑ์มาตรฐานหลักสูตรจากเอกสารราชการ อ่านเนื้อหาที่ผู้ใช้ส่งมา (รูปแบบ Markdown) " +
    "แล้วแยกเป็นรายการ \"กฎเกณฑ์\" แต่ละข้อที่ตรวจสอบได้อย่างเป็นรูปธรรม (เช่น จำนวนหน่วยกิต, สัดส่วนหมวดวิชา, " +
    "คุณสมบัติอาจารย์ผู้สอน, เกณฑ์การจบการศึกษา) ห้ามแต่งเนื้อหาเพิ่มเองที่ไม่มีอยู่ในเอกสารต้นฉบับ " +
    "ตอบกลับเป็น JSON array ของ object เท่านั้น แต่ละ object มี 2 field: " +
    '"text" (ข้อความกฎเกณฑ์) และ "sourceRef" (เลขข้อ/หมวด/มาตราที่คัดลอกมาจากเอกสารต้นฉบับตรงตัว ' +
    'เช่น "ข้อ 5.2" หรือ "หมวด 3 ข้อ 1" — ถ้าหาเลขอ้างอิงที่ชัดเจนไม่ได้ให้ใส่ค่าว่าง "" ห้ามแต่งเลขขึ้นเอง) ' +
    "ห้ามมีข้อความอื่นนอกเหนือจาก JSON array เช่น " +
    '[{"text": "กฎเกณฑ์ข้อ 1 ...", "sourceRef": "ข้อ 5.2"}, {"text": "กฎเกณฑ์ข้อ 2 ...", "sourceRef": ""}]';

  // parse ผลลัพธ์ของ AI ให้เป็น array ของ {text, sourceRef} — ทนต่อกรณี AI ใส่ข้อความอื่นล้อมรอบ JSON มาด้วย
  // และทนต่อรูปแบบเก่า (array ของสตริงล้วน ไม่มี sourceRef) เผื่อ prompt ถูกปรับอีกในอนาคต
  window.CURMATE_PARSE_RULE_ARRAY = function (aiText) {
    var jsonMatch = aiText.match(/\[[\s\S]*\]/);
    var jsonStr = jsonMatch ? jsonMatch[0] : aiText;
    var parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) { throw new Error("AI ไม่ได้ตอบเป็น JSON array ตามที่กำหนด"); }

    return parsed
      .map(function (item) {
        if (typeof item === "string") {
          return { text: item.trim(), sourceRef: "" };
        }
        if (item && typeof item.text === "string") {
          return {
            text: item.text.trim(),
            sourceRef: typeof item.sourceRef === "string" ? item.sourceRef.trim() : "",
          };
        }
        return null;
      })
      .filter(function (r) { return r && r.text.length > 0; });
  };
})();
