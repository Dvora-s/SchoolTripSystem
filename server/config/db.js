//תפקיד הקובץ: מכיל את כל הבקשות ששייכות למסד הנתונים בעמוד אחד.
// ספריית mssql בגרסה התומכת באימות Windows (ללא שם משתמש/סיסמה)
const sql = require('mssql/msnodesqlv8');
const dbConfig = {
    connectionString: 'Server=.\\SQLEXPRESS;Database=SchoolTripDB;Trusted_Connection=yes;Driver={ODBC Driver 17 for SQL Server};'
};
// נקראת בכל פעם שצריך לשלוח שאילתה למסד נתונים
const connectDB = async () => {
    await sql.connect(dbConfig);
};

module.exports = { sql, connectDB };
