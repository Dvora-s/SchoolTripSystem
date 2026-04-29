/*
 * routes/teachers.js - נתיבי המורות
 * ------------------------------------
 * קובץ זה אחראי על הגדרת הנתיבים (routes) של המורות.
 * הוא מקשר בין כתובות ה-URL לפונקציות המתאימות ב-controller.
 * הלוגיקה עצמה נמצאת ב-controllers/teachersController.js.
 *
 * POST /api/teachers              - הוספת מורה חדשה
 * POST /api/teachers/login        - כניסת מורה למערכת
 * GET  /api/teachers/:id/students - שליפת תלמידות לפי מורה
 */

const express = require('express');
const router = express.Router();
const { login, getStudents, addTeacher } = require('../controllers/teachersController');

router.post('/login', login);            // POST /api/teachers/login
router.get('/:id/students', getStudents); // GET  /api/teachers/:id/students
router.post('/', addTeacher);            // POST /api/teachers

module.exports = router;
