/*
 * seed.js - הכנסת נתוני דמיה למסד הנתונים
 * ------------------------------------------
 * סקריפט חד-פעמי שמכניס את תלמידות ההדמיה לטבלת Students.
 * מריצים אותו פעם אחת עם: node seed.js
 */

const { sql, connectDB } = require('./config/db');

const SIMULATION_STUDENTS = [
    { id: '333333333', fullName: 'דנה כהן',   className: 'א1' },
    { id: '444444444', fullName: 'מיה לוי',   className: 'א1' },
    { id: '555555555', fullName: 'נועה ישראלי', className: 'א1' },
];

const seed = async () => {
    await connectDB();
    for (const { id, fullName, className } of SIMULATION_STUDENTS) {
        try {
            await sql.query`INSERT INTO Students (ID, FullName, ClassName) VALUES (${id}, ${fullName}, ${className})`;
            console.log(`נוספה: ${fullName}`);
        } catch (err) {
            // אם הרשומה כבר קיימת - ממשיכים הלאה
            console.log(`${fullName} כבר קיימת, מדלגים`);
        }
    }
    console.log('הסתיים');
    process.exit(0);
};

seed();
