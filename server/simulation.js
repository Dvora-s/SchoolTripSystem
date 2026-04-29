/*
 * simulation.js - הדמיית מיקומים בזמן אמת
 * ==========================================
 * תפקיד הקובץ:
 *   מדמה תנועה של תלמידים ומורות על המפה לצורך הדגמה.
 *   רץ ברקע כל עוד השרת פעיל.
 *
 * מצבי תלמידה:
 *   רגיל   - תנועה אקראית קטנה סביב המיקום הנוכחי
 *   outlier - חורגת מהטווח (מעל 3 ק"מ מהמורה) — נשארת רחוק
 *   returning - חוזרת — זזה בהדרגה חזרה לכיוון המורה
 *
 * לוגיקת הסימולציה:
 *   - כל 20 שניות: מעדכן מיקומים לכולם
 *   - כל 2 דקות: תלמידה אחרת (לא אותה פעמיים ברצף) יוצאת מהטווח
 *   - כשהמורה לוחצת "קראי לה להתקרב": התלמידה עוברת למצב returning
 *     ומתעדכנת כל 3 שניות עד שמגיעה למורה
 *
 * פונקציות מיוצאות:
 *   start    - מפעיל את הסימולציה (נקרא מ-index.js אחרי עליית השרת)
 *   stop     - עוצר את הסימולציה (נקרא מ-index.js בסגירת השרת)
 *   callBack - מעביר תלמידה למצב returning (נקרא מ-routes/locations.js)
 */

const { upsertLocation } = require('./controllers/locationsController');
const { sql, connectDB } = require('./config/db');

const positions = {};  // מיקום נוכחי לכל אדם { [id]: { lat, lng } }
const outliers = {};   // תלמידה שחורגת — נשארת רחוק { [id]: boolean }
const returning = {};  // תלמידה שחוזרת — זזה בהדרגה למורה { [id]: boolean }
let studentIds = [];   // רשימת IDs של תלמידים (מתעדכנת בכל ריצה)
let lastOutlierId = null; // ID של התלמידה שחרגה בפעם הקודמת (למניעת חזרה)
let outlierInterval = null; // interval של הפעלת חריגות

// getTeacherPosition - מחזיר את מיקום המורה מתוך positions
// מזהה מורה לפי כך שה-ID שלה לא נמצא ברשימת התלמידים
// אם אין מורה עם מיקום — מחזיר נקודת ברירת מחדל (מרכז תל אביב)
const getTeacherPosition = () => {
    const teacherPos = Object.entries(positions).find(([id]) => !studentIds.includes(id));
    return teacherPos ? teacherPos[1] : { lat: 32.0742, lng: 34.7800 };
};

// simulate - לב הסימולציה, מעדכן מיקום לכל אדם במסד
// נקרא: כל 20 שניות, ומיידית אחרי כל שינוי מצב (חריגה/חזרה)
const simulate = async () => {
    await connectDB();
    const studentsRes = await sql.query('SELECT ID FROM Students');
    const teachersRes = await sql.query('SELECT ID FROM Teachers');
    studentIds = studentsRes.recordset.map(s => s.ID);
    const people = [...studentsRes.recordset, ...teachersRes.recordset];

    for (const { ID } of people) {
        // אתחול מיקום ראשוני אקראי בסביבת תל אביב אם לא קיים
        if (!positions[ID]) positions[ID] = {
            lat: 32.0742 + (Math.random() - 0.5) * 0.01,
            lng: 34.7800 + (Math.random() - 0.5) * 0.01
        };

        if (outliers[ID]) {
            // מצב חריגה — זזה לאזור רחוק (~3.2 ק"מ צפון-מזרח) עם רעש קטן
            positions[ID].lat = 32.0742 + 0.029 + (Math.random() - 0.5) * 0.001;
            positions[ID].lng = 34.7800 + 0.029 + (Math.random() - 0.5) * 0.001;
        } else if (returning[ID]) {
            // מצב חזרה — זזה 30% מהמרחק לכיוון המורה בכל ריצה (תנועה מואצת)
            const teacher = getTeacherPosition();
            positions[ID].lat += (teacher.lat - positions[ID].lat) * 0.3;
            positions[ID].lng += (teacher.lng - positions[ID].lng) * 0.3;

            // בדיקה אם הגיעה קרוב מספיק (~300 מטר) — מסיים מצב חזרה
            const dist = Math.sqrt(
                (positions[ID].lat - teacher.lat) ** 2 +
                (positions[ID].lng - teacher.lng) ** 2
            );
            if (dist < 0.003) {
                returning[ID] = false;
                console.log(`[Simulation] תלמיד ${ID} הגיע חזרה למורה`);
            }
        } else {
            // מצב רגיל — תנועה אקראית קטנה (~200 מטר)
            positions[ID].lat += (Math.random() - 0.5) * 0.002;
            positions[ID].lng += (Math.random() - 0.5) * 0.002;
        }

        try {
            await upsertLocation(ID, positions[ID].lat, positions[ID].lng);
        } catch (err) {
            console.error(`[Simulation] שגיאה בעדכון ${ID}:`, err.message);
        }
    }
    console.log('[Simulation] מיקומים עודכנו ל-', people.length, 'אנשים');
};

// triggerNextOutlier - בוחר תלמידה אקראית שתחרוג מהטווח
// מוודא שלא נבחרת אותה תלמידה פעמיים ברצף
// ושהתלמידה לא כבר במצב חריגה או חזרה
// נקרא: כל 2 דקות על ידי outlierInterval
const triggerNextOutlier = async () => {
    if (studentIds.length === 0) return;
    const candidates = studentIds.filter(id => id !== lastOutlierId && !outliers[id] && !returning[id]);
    if (candidates.length === 0) return;
    const id = candidates[Math.floor(Math.random() * candidates.length)];
    outliers[id] = true;
    lastOutlierId = id;
    console.log(`[Simulation] תלמיד ${id} יצא מהטווח`);
    await simulate(); // עדכון מיידי כדי שהלקוח יראה את השינוי
};

// callBack - מעביר תלמידה ממצב חריגה למצב חזרה
// מפעיל interval של 3 שניות שמזיז אותה בהדרגה חזרה למורה
// נקרא מ: routes/locations.js כשהמורה לוחצת "קראי לה להתקרב"
const callBack = async (id) => {
    outliers[id] = false;
    returning[id] = true;
    console.log(`[Simulation] תלמיד ${id} מתחיל לחזור`);
    const returnInterval = setInterval(async () => {
        await simulate();
        if (!returning[id]) clearInterval(returnInterval); // עצור כשהגיעה
    }, 3000);
};

let interval = null;

// start - מפעיל את הסימולציה
// נקרא מ-index.js אחרי שהשרת עלה בהצלחה
const start = async () => {
    await simulate();
    interval = setInterval(simulate, 20000);           // עדכון כל 20 שניות
    outlierInterval = setInterval(triggerNextOutlier, 120000); // חריגה כל 2 דקות
    console.log('[Simulation] הדמיה הופעלה');
};

// stop - עוצר את כל ה-intervals של הסימולציה
// נקרא מ-index.js בעת סגירת השרת (SIGINT/SIGTERM)
const stop = () => {
    if (interval) clearInterval(interval);
    if (outlierInterval) clearInterval(outlierInterval);
    console.log('[Simulation] הדמיה נעצרה');
};

module.exports = { start, stop, callBack };
