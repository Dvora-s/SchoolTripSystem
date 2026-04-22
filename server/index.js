const express = require('express');
const cors = require('cors');

const teachersRouter = require('./routes/teachers');
const studentsRouter = require('./routes/students');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Server is running'));
app.use('/api/teachers', teachersRouter);
app.use('/api/students', studentsRouter);

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
