/*
 * routes/students.js - נתיבי התלמידות
 * ---------------------------------------
 * קובץ זה אחראי על הגדרת הנתיבים (routes) של התלמידות.
 * הוא מקשר בין כתובות ה-URL לפונקציות המתאימות ב-controller.
 * הלוגיקה עצמה נמצאת ב-controllers/studentsController.js.
 *
 * GET  /api/students   - שליפת כל התלמידות
 * POST /api/students   - הוספת תלמידה חדשה
 */

const express = require('express');
const router = express.Router();
const { getAllStudents, addStudent } = require('../controllers/studentsController');

router.get('/', getAllStudents);  // GET /api/students
router.post('/', addStudent);    // POST /api/students

module.exports = router;
