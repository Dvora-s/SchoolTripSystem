import { useState } from 'react';
import './App.css';

const API = 'http://localhost:3001/api';
const CLASSES = ['א1','א2','ב1','ב2','ג1','ג2','ד1','ד2','ה1','ה2','ו1','ו2'];

function RegistrationForm() {
  const [form, setForm] = useState({ id: '', fullName: '', className: '', role: 'student' });
  const [msg, setMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.id.length !== 9 || !/^\d{9}$/.test(form.id)) {
      setMsg({ type: 'error', text: 'תעודת זהות חייבת להכיל בדיוק 9 ספרות' });
      return;
    }
    const endpoint = form.role === 'teacher' ? 'teachers' : 'students';
    try {
      const res = await fetch(`${API}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: form.id, fullName: form.fullName, className: form.className }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg({ type: 'success', text: data.message });
      setForm({ id: '', fullName: '', className: '', role: 'student' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="card">
      <h2>רישום חדש</h2>
      <form onSubmit={handleSubmit} className="form">
        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
          <option value="student">תלמידה</option>
          <option value="teacher">מורה</option>
        </select>
        <input required placeholder="שם פרטי ומשפחה" value={form.fullName}
          onChange={e => setForm({ ...form, fullName: e.target.value })} />
        <input required placeholder="תעודת זהות (9 ספרות)" value={form.id} maxLength={9}
          onChange={e => setForm({ ...form, id: e.target.value })} />
        <select required value={form.className} onChange={e => setForm({ ...form, className: e.target.value })}>
          <option value="">בחרי כיתה</option>
          {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="submit">הוספה</button>
      </form>
      {msg && <p className={`msg ${msg.type}`}>{msg.text}</p>}
    </div>
  );
}

function TeacherView() {
  const [teacherId, setTeacherId] = useState('');
  const [teacher, setTeacher] = useState(null);
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState(false);
  const [error, setError] = useState(null);

  const login = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API}/teachers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: teacherId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTeacher(data);
      const studRes = await fetch(`${API}/students`);
      setStudents(await studRes.json());
      setFiltered(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const displayedStudents = filtered
    ? students.filter(s => s.ClassName === teacher.ClassName)
    : students;

  if (!teacher) {
    return (
      <div className="card">
        <h2>כניסה למורה</h2>
        <form onSubmit={login} className="form">
          <input required placeholder="תעודת זהות" value={teacherId}
            onChange={e => setTeacherId(e.target.value)} />
          <button type="submit">כניסה</button>
        </form>
        {error && <p className="msg error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="card">
      <div className="teacher-header">
        <span>שלום, {teacher.FullName} | כיתה {teacher.ClassName}</span>
        <div className="actions">
          <button onClick={() => setFiltered(!filtered)}>
            {filtered ? 'כל התלמידות' : 'תלמידות הכיתה שלי'}
          </button>
          <button className="secondary" onClick={() => setTeacher(null)}>יציאה</button>
        </div>
      </div>
      <table>
        <thead>
          <tr><th>שם מלא</th><th>תעודת זהות</th><th>כיתה</th></tr>
        </thead>
        <tbody>
          {displayedStudents.map(s => (
            <tr key={s.ID}><td>{s.FullName}</td><td>{s.ID}</td><td>{s.ClassName}</td></tr>
          ))}
        </tbody>
      </table>
      {displayedStudents.length === 0 && <p className="empty">אין תלמידות להצגה</p>}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('register');

  return (
    <>
      <nav className="navbar">
        <span className="logo">מערכת טיולים</span>
        <div className="nav-links">
          <button className={view === 'register' ? 'active' : ''} onClick={() => setView('register')}>רישום חדש</button>
          <button className={view === 'teacher' ? 'active' : ''} onClick={() => setView('teacher')}>צפייה בנתונים</button>
        </div>
      </nav>
      <main>
        {view === 'register' ? <RegistrationForm /> : <TeacherView />}
      </main>
    </>
  );
}
