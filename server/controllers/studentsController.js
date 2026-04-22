const { sql, connectDB } = require('../config/db');

const getAllStudents = async (req, res) => {
    try {
        await connectDB();
        const result = await sql.query('SELECT * FROM Students');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const addStudent = async (req, res) => {
    const { id, fullName, className } = req.body;
    if (!id || !fullName || !className)
        return res.status(400).json({ error: 'נא למלא את כל השדות' });

    try {
        await connectDB();
        await sql.query`INSERT INTO Students (ID, FullName, ClassName) VALUES (${id}, ${fullName}, ${className})`;
        res.status(201).json({ message: 'תלמידה נוספה בהצלחה' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllStudents, addStudent };
