/*
 * server/index.js - נקודת הכניסה של השרת
 * ==========================================
 * תפקיד הקובץ:
 *   זהו הקובץ הראשון שרץ כשמפעילים את השרת ("node index.js").
 *   הוא אחראי על:
 *     1. יצירת אפליקציית Express
 *     2. הגדרת middleware (cors, json)
 *     3. חיבור כל ה-routers לנתיבים שלהם
 *     4. הפעלת הדמיית המיקומים
 *     5. הפעלת השרת על פורט 3001
 *
 * ארכיטקטורת השרת:
 *   index.js (כניסה)
 *     ├── routes/teachers.js    → controllers/teachersController.js → config/db.js
 *     ├── routes/students.js    → controllers/studentsController.js → config/db.js
 *     ├── routes/locations.js   → controllers/locationsController.js → config/db.js
 *     └── simulation.js         → controllers/locationsController.js (זיכרון)
 */

const express = require('express');
const cors = require('cors');

const teachersRouter = require('./routes/teachers');
const studentsRouter = require('./routes/students');
const locationsRouter = require('./routes/locations');

const simulation = require('./simulation');

const app = express();

// cors - מאפשר לצד הלקוח (React על פורט 5173) לשלוח בקשות לשרת (פורט 3001)
// בלי זה הדפדפן היה חוסם את הבקשות מסיבות אבטחה
app.use(cors());

// express.json - מאפשר לשרת לפרסר גוף בקשות בפורמט JSON
// בלי זה req.body היה undefined
app.use(express.json());

// נתיב בדיקה בסיסי - ניתן לפתוח http://localhost:3001 לוודא שהשרת פועל
app.get('/', (req, res) => res.send('Server is running'));

// חיבור ה-routers לנתיביהם:
// כל בקשה שמתחילה ב-/api/teachers תועבר ל-routes/teachers.js לטיפול
app.use('/api/teachers', teachersRouter);

// כל בקשה שמתחילה ב-/api/students תועבר ל-routes/students.js לטיפול
app.use('/api/students', studentsRouter);

// כל בקשה שמתחילה ב-/api/locations תועבר ל-routes/locations.js לטיפול
app.use('/api/locations', locationsRouter);

// הפעלת השרת - מאזין לבקשות נכנסות על פורט 3001
// אם הפורט תפוס, ניתן לשנות כאן בלבד
const PORT = 3001;
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    simulation.start();
});

const shutdown = () => {
    simulation.stop();
    server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
