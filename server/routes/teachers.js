const express = require('express');
const router = express.Router();
const { login, getStudents, addTeacher } = require('../controllers/teachersController');

router.post('/login', login);
router.get('/:id/students', getStudents);
router.post('/', addTeacher);

module.exports = router;
