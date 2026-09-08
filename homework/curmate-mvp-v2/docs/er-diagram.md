# ER Diagram — Curmate MVP v2

โครงสร้างข้อมูล Firestore ของการบ้านนี้ (4 collection: `users`, `criteriaSets`, `rules`, `rules/{id}/reviewLog`) วาดเป็น ER Diagram — GitHub เรนเดอร์ Mermaid block ด้านล่างเป็นแผนภาพอัตโนมัติเมื่อเปิดไฟล์นี้บนหน้าเว็บ

หมายเหตุ: Firestore เป็น NoSQL แบบ document-oriented ความสัมพันธ์ด้านล่างจึงหมายถึง "field ที่อ้างอิง id ของอีก document" (denormalized reference) ไม่ใช่ foreign key แบบ relational database จริง และ `reviewLog` เป็น subcollection อยู่ใต้ document ของ `rules` โดยตรง (ไม่ใช่ collection แยกระดับบนสุด)

```mermaid
erDiagram
    users ||--o{ criteriaSets : "uploadedBy"
    users ||--o{ rules : "uploadedBy"
    users ||--o{ reviewLog : "adminId"
    criteriaSets ||--o{ rules : "criteriaSetId"
    rules ||--o{ reviewLog : "subcollection"

    users {
        string uid PK "Firebase Auth UID"
        string name
        string email
        string role "ADMIN หรือ STAFF"
    }

    criteriaSets {
        string id PK
        string name
        string academicYear
        string degreeLevel
        string scope
        string status "pending หรือ active"
        string uploadedBy FK "อ้างถึง users.uid"
        string uploadedByName
    }

    rules {
        string id PK
        string ruleText
        string status "pending, approved หรือ rejected"
        string criteriaSetId FK "อ้างถึง criteriaSets.id"
        string criteriaSetName
        string uploadedBy FK "อ้างถึง users.uid"
        string uploadedByName
        timestamp createdAt
    }

    reviewLog {
        string id PK
        string ruleId FK "อ้างถึง rules.id (document แม่)"
        string adminId FK "อ้างถึง users.uid"
        string adminName
        string action "approved หรือ rejected"
        string comment
        timestamp createdAt
    }
```

ดูรายละเอียด field แบบเต็มและกฎการเข้าถึงข้อมูลแต่ละ collection ได้ที่ [../SCOPE.md](../SCOPE.md) และ [../ACL.md](../ACL.md)
