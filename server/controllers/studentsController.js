/*
 * controllers/studentsController.js - לוגיקת התלמידות
 * ======================================================
 * תפקיד הקובץ:
 *   מכיל את הלוגיקה העסקית של כל הפעולות הקשורות לתלמידות.
 *   ה-router (routes/students.js) מפנה בקשות נכנסות לפונקציות כאן.
 *
 * פונקציות:
 *   getAllStudents - שליפת כל התלמידות (GET /api/students)
 *   addStudent    - הוספת תלמידה חדשה (POST /api/students)
 *
 * תלויות:
 *   config/db.js - לחיבור ל-SQL Server
 *
 * הערה: מיקום ראשוני לתלמידה חדשה נוצר אוטומטית ב-simulation.js
 *        בריצה הבאה של הסימולציה (כל 20 שניות)
 */

const { sql, connectDB } = require('../config/db');

// getAllStudents - שולף את כל התלמידות מטבלת Students במסד
// נקרא מ: GET /api/students
// מחזיר: מערך JSON של כל הרשומות
const getAllStudents = async (req, res) => {
    try {
        await connectDB();
        const result = await sql.query('SELECT * FROM Students');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// addStudent - מוסיף תלמידה חדשה למסד הנתונים
// נקרא מ: POST /api/students (דרך TeacherView → api.js → registerStudent)
// מקבל בגוף הבקשה: { id, fullName, className }
// מחזיר: 201 + הודעת הצלחה, או שגיאה מתאימה
// הערה: המיקום הראשוני של התלמידה ייווצר אוטומטית בריצה הבאה של הסימולציה
const addStudent = async (req, res) => {
    const { id, fullName, className } = req.body;

    // ולידציה: כל שלושת השדות חובה
    if (!id || !fullName || !className)
        return res.status(400).json({ error: 'נא למלא את כל השדות' });

    try {
        await connectDB();

        // הכנסה למסד - שימוש ב-template literal של mssql למניעת SQL Injection
        await sql.query`INSERT INTO Students (ID, FullName, ClassName) VALUES (${id}, ${fullName}, ${className})`;

        res.status(201).json({ message: 'תלמידה נוספה בהצלחה' });
    } catch (err) {
        // שגיאה 2627/2601 = הפרת PRIMARY KEY - תעודת זהות כבר קיימת
        if (err.number === 2627 || err.number === 2601)
            return res.status(409).json({ error: 'תלמידה עם תעודת זהות זו כבר קיימת במערכת' });
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllStudents, addStudent };
