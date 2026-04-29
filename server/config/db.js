/*
 * config/db.js - הגדרות החיבור למסד הנתונים
 * =============================================
 * תפקיד הקובץ:
 *   מרכז את כל הגדרות החיבור ל-SQL Server במקום אחד.
 *   כל controller שצריך לגשת למסד הנתונים מייבא מכאן את sql ו-connectDB.
 *
 * טכנולוגיה:
 *   mssql/msnodesqlv8 - גרסה של ספריית mssql שתומכת באימות Windows (Trusted Connection)
 *   כלומר לא צריך שם משתמש וסיסמה - מתחבר דרך חשבון Windows הנוכחי
 *
 * מה מיוצא:
 *   sql       - אובייקט mssql לביצוע שאילתות (sql.query`...`)
 *   connectDB - פונקציה שמבצעת את החיבור, נקראת לפני כל שאילתה
 */

// ספריית mssql בגרסה התומכת באימות Windows (ללא שם משתמש/סיסמה)
const sql = require('mssql/msnodesqlv8');

// הגדרות החיבור:
//   Server=.\SQLEXPRESS  - שם שרת ה-SQL (SQLEXPRESS על המחשב המקומי)
//   Database=SchoolTripDB - שם מסד הנתונים
//   Trusted_Connection=yes - אימות דרך חשבון Windows (ללא סיסמה)
//   Driver=ODBC Driver 17  - דרייבר ODBC הנדרש לחיבור
const dbConfig = {
    connectionString: 'Server=.\\SQLEXPRESS;Database=SchoolTripDB;Trusted_Connection=yes;Driver={ODBC Driver 17 for SQL Server};'
};

// connectDB - מבצעת חיבור למסד הנתונים
// נקראת בתחילת כל פונקציה ב-controllers לפני ביצוע שאילתה
// אם החיבור כבר קיים - mssql ישתמש בו מחדש (connection pooling)
const connectDB = async () => {
    await sql.connect(dbConfig);
};

module.exports = { sql, connectDB };
