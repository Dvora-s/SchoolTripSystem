
import { useState, useEffect } from 'react';
import { loginTeacher, getStudentsByClass, registerStudent } from '../api/api';
import LiveMap from './LiveMap';

export default function TeacherView({ onLogin, teacher }) {
  const [teacherId, setTeacherId] = useState('');
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentForm, setStudentForm] = useState({ id: '', fullName: '' });
  const [studentMsg, setStudentMsg] = useState(null);
  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (studentForm.id.length !== 9 || !/^\d{9}$/.test(studentForm.id)) {
      setStudentMsg({ type: 'error', text: 'תעודת זהות חייבת להכיל בדיוק 9 ספרות' });
      return;
    }
    const { ok, data } = await registerStudent({
      id: studentForm.id,
      fullName: studentForm.fullName,
      className: teacher.ClassName
    });

    if (!ok) return setStudentMsg({ type: 'error', text: data.error });
    setStudentMsg({ type: 'success', text: data.message });
    setStudentForm({ id: '', fullName: '' });
    fetchStudents(); 
  };
  const fetchStudents = async () => {
    try {
      const data = await getStudentsByClass(teacher.ID);
      if (Array.isArray(data)) setStudents(data);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    if (teacher) fetchStudents();
  }, [teacher]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    const { ok, data } = await loginTeacher(teacherId);
    if (!ok) return setError(data.error || 'שגיאת התחברות');
    onLogin(data); // data = אובייקט המורה מהשרת { ID, FullName, ClassName }
  };

  if (teacher) {
    return (
      <div className="card">

        {/* טופס הוספת תלמידה - הכיתה נקבעת אוטומטית לפי המורה המחוברת */}
        <h3>הוספת תלמידה לכיתה {teacher.ClassName}</h3>
        <form onSubmit={handleAddStudent} className="form-row">
          <input required placeholder="שם פרטי ומשפחה" value={studentForm.fullName}
            onChange={e => setStudentForm({ ...studentForm, fullName: e.target.value })} />
          <input required placeholder="תעודת זהות (9 ספרות)" value={studentForm.id} maxLength={9}
            onChange={e => setStudentForm({ ...studentForm, id: e.target.value })} />
          <button type="submit">הוספה מהירה</button>
        </form>
        {studentMsg && <p className={`msg ${studentMsg.type}`}>{studentMsg.text}</p>}

        <LiveMap className={teacher.ClassName} teacherId={teacher.ID} />

        {/* טבלת תלמידות - מתרעננת אחרי כל הוספה */}
        <h3 style={{marginTop: '2rem'}}>רשימת התלמידות</h3>
        <table>
          <thead>
            <tr><th>ת"ז</th><th>שם מלא</th><th>כיתה</th></tr>
          </thead>
          <tbody>
            {students.length > 0 ? students.map(s => (
              <tr key={s.ID}><td>{s.ID}</td><td>{s.FullName}</td><td>{s.ClassName}</td></tr>
            )) : (
              <tr><td colSpan="3" style={{textAlign: 'center'}}>אין תלמידות להצגה</td></tr>
            )}
          </tbody>
        </table>


      </div>
    );
  }

  // ===== מצב התחברות - מוצג    יש כשאין מורה מחוברת =====
  return (
    <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2>כניסת מורה</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input required placeholder="הקלידי תעודת זהות" value={teacherId}
          onChange={e => setTeacherId(e.target.value)} />
        <button type="submit">התחברות למערכת</button>
      </form>
      {error && <p className="msg error">{error}</p>}
    </div>
  );
}
