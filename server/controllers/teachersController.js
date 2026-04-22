const { sql, connectDB } = require('../config/db');

const login = async (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'נא לספק תעודת זהות' });

    try {
        await connectDB();
        const result = await sql.query`SELECT * FROM Teachers WHERE ID = ${id}`;
        if (result.recordset.length === 0)
            return res.status(404).json({ error: 'מורה לא נמצאה' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getStudents = async (req, res) => {
    const { id } = req.params;

    try {
        await connectDB();
        const teacher = await sql.query`SELECT ClassName FROM Teachers WHERE ID = ${id}`;
        if (teacher.recordset.length === 0)
            return res.status(404).json({ error: 'מורה לא נמצאה' });

        const { ClassName } = teacher.recordset[0];
        const students = await sql.query`SELECT * FROM Students WHERE ClassName = ${ClassName}`;
        res.json(students.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const addTeacher = async (req, res) => {
    const { id, fullName, className } = req.body;
    if (!id || !fullName || !className)
        return res.status(400).json({ error: 'נא למלא את כל השדות' });

    try {
        await connectDB();
        await sql.query`INSERT INTO Teachers (ID, FullName, ClassName) VALUES (${id}, ${fullName}, ${className})`;
        res.status(201).json({ message: 'מורה נוספה בהצלחה' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { login, getStudents, addTeacher };
