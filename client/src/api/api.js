/*
 * api.js - שכבת התקשורת עם השרת
 * =================================
 * תפקיד הקובץ:
 *   מרכז את כל הקריאות לשרת ה-Node.js במקום אחד.
 *   שאר הקומפוננטים (TeacherView, RegistrationForm, LiveMap) לא יודעים
 *   כלום על כתובות URL, פורטים או פורמט הבקשות - הם פשוט קוראים לפונקציות מכאן.
 *
 * כל פונקציה:
 *   - שולחת בקשת HTTP לשרת
 *   - מחזירה { ok: boolean, data: object } לפונקציות POST
 *   - מחזירה מערך/אובייקט ישירות לפונקציות GET
 *   - מטפלת בשגיאות תקשורת ומחזירה הודעה ידידותית
 *
 * כתובת הבסיס: http://localhost:3001/api
 * (השרת רץ על פורט 3001, מוגדר ב-server/index.js)
 */

const API = 'http://localhost:3001/api';

// registerStudent - רישום תלמידה חדשה למערכת
// נקראת מ: TeacherView (טופס הוספת תלמידה בלוח הבקרה)
// שולחת: POST /api/students עם { id, fullName, className }
// מחזירה: { ok, data } - data.message אם הצליח, data.error אם נכשל
export const registerStudent = async (data) => {
    try {
        const res = await fetch(`${API}/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const d = await res.json();
        return { ok: res.ok, data: d };
    } catch (err) {
        // שגיאת רשת (שרת לא פעיל, בעיית חיבור וכו')
        return { ok: false, data: { error: "שגיאת תקשורת עם השרת" } };
    }
};

// registerTeacher - רישום מורה חדשה למערכת
// נקראת מ: RegistrationForm (טופס הרשמה)
// שולחת: POST /api/teachers עם { id, fullName, className }
// מחזירה: { ok, data } - data.message אם הצליח, data.error אם נכשל
export const registerTeacher = async (data) => {
    try {
        const res = await fetch(`${API}/teachers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const d = await res.json();
        return { ok: res.ok, data: d };
    } catch (err) {
        return { ok: false, data: { error: "שגיאת תקשורת עם השרת" } };
    }
};

// loginTeacher - כניסת מורה קיימת למערכת לפי תעודת זהות
// נקראת מ: TeacherView (טופס ההתחברות)
// שולחת: POST /api/teachers/login עם { id }
// מחזירה: { ok, data } - data = אובייקט המורה { ID, FullName, ClassName } אם הצליח
export const loginTeacher = async (id) => {
    try {
        const res = await fetch(`${API}/teachers/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        const d = await res.json();
        return { ok: res.ok, data: d };
    } catch (err) {
        return { ok: false, data: { error: "שגיאת תקשורת עם השרת" } };
    }
};

// getAllStudents - שליפת כל התלמידות מהמסד (לא בשימוש כרגע בממשק)
// שולחת: GET /api/students
// מחזירה: מערך של כל התלמידות
export const getAllStudents = async () => {
    const res = await fetch(`${API}/students`);
    return await res.json();
};

// getStudentsByClass - שליפת תלמידות לפי כיתת המורה
// נקראת מ: TeacherView (לטעינת הטבלה בלוח הבקרה)
// שולחת: GET /api/teachers/:teacherId/students
// מחזירה: מערך תלמידות של הכיתה של אותה מורה
export const getStudentsByClass = async (teacherId) => {
    const res = await fetch(`${API}/teachers/${teacherId}/students`);
    return await res.json();
};

// getLiveLocations - שליפת מיקומים חיים של תלמידות לפי כיתה
// נקראת מ: LiveMap (כל 10 שניות לרענון המפה)
// שולחת: GET /api/locations/:className
// מחזירה: מערך של [{ studentId, fullName, lat, lng }, ...]
//          רק תלמידות שיש להן מיקום פעיל בזיכרון השרת
export const getLiveLocations = async (className) => {
    const res = await fetch(`${API}/locations/${className}`);
    return await res.json();
};
