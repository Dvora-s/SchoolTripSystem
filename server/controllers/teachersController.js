/*
 * controllers/teachersController.js - לוגיקת המורות
 * ====================================================
 * תפקיד הקובץ:
 *   מכיל את הלוגיקה העסקית של כל הפעולות הקשורות למורות.
 *   ה-router (routes/teachers.js) מפנה בקשות נכנסות לפונקציות כאן.
 *
 * פונקציות:
 *   login       - כניסת מורה קיימת לפי תעודת זהות (POST /api/teachers/login)
 *   getStudents - שליפת תלמידות לפי כיתת המורה (GET /api/teachers/:id/students)
 *   addTeacher  - הוספת מורה חדשה למסד (POST /api/teachers)
 *
 * תלויות:
 *   config/db.js - לחיבור ל-SQL Server
 */

const { sql, connectDB } = require('../config/db');

// login - מאמת מורה לפי תעודת זהות ומחזיר את פרטיה
// נקרא מ: POST /api/teachers/login (דרך TeacherView → api.js → loginTeacher)
// מקבל בגוף הבקשה: { id }
// מחזיר: אובייקט המורה { ID, FullName, ClassName } אם נמצאה, שגיאה אחרת
const login = async (req, res) => {
    const { id } = req.body;

    if (!id) return res.status(400).json({ error: 'נא לספק תעודת זהות' });

    try {
        await connectDB();

        // חיפוש המורה במסד לפי תעודת זהות
        const result = await sql.query`SELECT * FROM Teachers WHERE ID = ${id}`;

        // אם לא נמצאה מורה עם תעודת הזהות הזו
        if (result.recordset.length === 0)
            return res.status(404).json({ error: 'מורה לא נמצאה' });

        // מחזיר את הרשומה הראשונה (תעודת זהות היא מזהה יחודי, תמיד רשומה אחת)
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// getStudents - מחזיר את כל תלמידות הכיתה של מורה מסוימת
// נקרא מ: GET /api/teachers/:id/students (דרך TeacherView → api.js → getStudentsByClass)
// מקבל בפרמטר ה-URL: id (תעודת זהות המורה)
// תהליך: מוצא את כיתת המורה → שולף את כל תלמידות אותה כיתה
const getStudents = async (req, res) => {
    const { id } = req.params;

    try {
        await connectDB();

        // שלב 1: מוצא את הכיתה של המורה לפי תעודת הזהות שלה
        const teacher = await sql.query`SELECT ClassName FROM Teachers WHERE ID = ${id}`;
        if (teacher.recordset.length === 0)
            return res.status(404).json({ error: 'מורה לא נמצאה' });

        // שלב 2: שולף את כל התלמידות של אותה כיתה
        const { ClassName } = teacher.recordset[0];
        const students = await sql.query`SELECT * FROM Students WHERE ClassName = ${ClassName}`;
        res.json(students.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// addTeacher - מוסיף מורה חדשה למסד הנתונים
// נקרא מ: POST /api/teachers (דרך RegistrationForm → api.js → registerTeacher)
// מקבל בגוף הבקשה: { id, fullName, className }
// מחזיר: 201 + הודעת הצלחה, או שגיאה מתאימה
const addTeacher = async (req, res) => {
    const { id, fullName, className } = req.body;

    // ולידציה: כל שלושת השדות חובה
    if (!id || !fullName || !className)
        return res.status(400).json({ error: 'נא למלא את כל השדות' });

    try {
        await connectDB();

        // הכנסה למסד - שימוש ב-template literal של mssql למניעת SQL Injection
        await sql.query`INSERT INTO Teachers (ID, FullName, ClassName) VALUES (${id}, ${fullName}, ${className})`;
        res.status(201).json({ message: 'מורה נוספה בהצלחה' });
    } catch (err) {
        // שגיאה 2627/2601 = הפרת PRIMARY KEY - תעודת זהות כבר קיימת
        if (err.number === 2627 || err.number === 2601)
            return res.status(409).json({ error: 'מורה עם תעודת זהות זו כבר קיימת במערכת' });
        res.status(500).json({ error: err.message });
    }
};

module.exports = { login, getStudents, addTeacher };
