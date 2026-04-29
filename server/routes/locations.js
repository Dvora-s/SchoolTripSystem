/*
 * routes/locations.js - נתיבי המיקומים
 * ----------------------------------------
 * קובץ זה אחראי על הגדרת הנתיבים (routes) של המיקומים.
 * הוא מקשר בין כתובות ה-URL לפונקציות המתאימות.
 *
 * POST /api/locations                  - עדכון מיקום ממכשיר (טלפון/GPS)
 * POST /api/locations/callback/:id     - קריאה לתלמידה לחזור (מפעיל מצב returning בסימולציה)
 * GET  /api/locations/:className       - שליפת מיקומי כל תלמידות הכיתה + המורה
 *
 * הערה: /callback/:id חייב להיות לפני /:className כדי שלא יתפרש כ-className
 */

const express = require('express');
const router = express.Router();
const { updateLocation, getLocationsByClass } = require('../controllers/locationsController');
const { callBack } = require('../simulation');

// POST /api/locations - עדכון מיקום ממכשיר אמיתי
router.post('/', updateLocation);

// POST /api/locations/callback/:id - קריאה לתלמידה לחזור
// :id = תעודת זהות התלמידה
// מפעיל את callBack בסימולציה שמתחיל להזיז אותה חזרה למורה
router.post('/callback/:id', (req, res) => {
    callBack(req.params.id);
    res.json({ ok: true });
});

// GET /api/locations/:className?teacherId=... - שליפת מיקומים לפי כיתה
// :className = שם הכיתה (לדוגמה: ו1)
// ?teacherId = תעודת זהות המורה (אופציונלי, להצגת המורה על המפה)
router.get('/:className', getLocationsByClass);

module.exports = router;
