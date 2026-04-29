/*
 * controllers/locationsController.js - לוגיקת המיקומים
 * =======================================================
 * תפקיד הקובץ:
 *   מכיל את הלוגיקה העסקית של כל הפעולות הקשורות למיקומים.
 *   ה-router (routes/locations.js) מפנה בקשות נכנסות לפונקציות כאן.
 *
 * פונקציות:
 *   upsertLocation      - עדכון או הוספת מיקום במסד (INSERT or UPDATE)
 *   updateLocation      - endpoint לעדכון מיקום מהמכשיר (POST /api/locations)
 *   getLocationsByClass - שליפת מיקומי כל תלמידות הכיתה + המורה (GET /api/locations/:className)
 *
 * תלויות:
 *   config/db.js - לחיבור ל-SQL Server
 */

const { sql, connectDB } = require('../config/db');

// dmsToDecimal - ממיר קואורדינטות מפורמט DMS (מעלות/דקות/שניות) לעשרוני
// נדרש כי מכשירי GPS שולחים לעיתים בפורמט DMS
// לדוגמה: { Degrees: 32, Minutes: 4, Seconds: 27 } → 32.074166...
const dmsToDecimal = ({ Degrees, Minutes, Seconds }) =>
    parseFloat(Degrees) + parseFloat(Minutes) / 60 + parseFloat(Seconds) / 3600;

// upsertLocation - מעדכן מיקום קיים או מוסיף חדש (MERGE = INSERT or UPDATE)
// נקראת מ: simulation.js (עדכון מיקומי הדמיה) ומ-updateLocation (עדכון ממכשיר אמיתי)
// פרמטרים: id (תעודת זהות), lat (קו רוחב), lng (קו אורך)
const upsertLocation = async (id, lat, lng) => {
    await connectDB();
    const updatedAt = new Date();
    await sql.query`
        MERGE Locations AS target
        USING (SELECT ${id} AS ID) AS source ON target.ID = source.ID
        WHEN MATCHED THEN UPDATE SET Latitude=${lat}, Longitude=${lng}, UpdatedAt=${updatedAt}
        WHEN NOT MATCHED THEN INSERT (ID, Latitude, Longitude, UpdatedAt) VALUES (${id}, ${lat}, ${lng}, ${updatedAt});
    `;
};

// updateLocation - endpoint לקבלת עדכון מיקום ממכשיר (טלפון/GPS)
// נקרא מ: POST /api/locations
// מקבל בגוף הבקשה: { ID, Coordinates: { Latitude: {Degrees,Minutes,Seconds}, Longitude: {...} }, Time }
// מחזיר: הודעת הצלחה או שגיאה
const updateLocation = async (req, res) => {
    const { ID, Coordinates, Time } = req.body;
    if (!ID || !Coordinates) return res.status(400).json({ error: 'נתונים חסרים' });
    const lat = dmsToDecimal(Coordinates.Latitude);
    const lng = dmsToDecimal(Coordinates.Longitude);
    try {
        await upsertLocation(String(ID), lat, lng);
        res.json({ message: 'מיקום עודכן' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// getLocationsByClass - שולף מיקומי כל תלמידות הכיתה + המורה המחוברת
// נקרא מ: GET /api/locations/:className?teacherId=...
// פרמטרים: className (שם הכיתה בנתיב), teacherId (תעודת זהות המורה ב-query)
// מחזיר: מערך של { ID, FullName, Latitude, Longitude, UpdatedAt, Role }
//         Role = 'student' לתלמידות, 'teacher' למורה
// הערה: teacherId אופציונלי — אם לא סופק, מוחזרות רק תלמידות
const getLocationsByClass = async (req, res) => {
    const { className } = req.params;
    const teacherId = req.query.teacherId;
    try {
        await connectDB();
        // שליפת תלמידות הכיתה שיש להן מיקום רשום
        const students = await sql.query`
            SELECT s.ID, s.FullName, l.Latitude, l.Longitude, l.UpdatedAt, 'student' AS Role
            FROM Students s
            JOIN Locations l ON s.ID = l.ID
            WHERE s.ClassName = ${className}
        `;
        // שליפת המורה הספציפית לפי ID (לא כל מורות הכיתה)
        const teachers = teacherId ? await sql.query`
            SELECT t.ID, t.FullName, l.Latitude, l.Longitude, l.UpdatedAt, 'teacher' AS Role
            FROM Teachers t
            JOIN Locations l ON t.ID = l.ID
            WHERE t.ID = ${teacherId}
        ` : { recordset: [] };
        res.json([...students.recordset, ...teachers.recordset]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { updateLocation, getLocationsByClass, upsertLocation };
