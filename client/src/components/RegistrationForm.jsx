
import { useState } from 'react';
import { registerTeacher } from '../api/api';

const CLASSES = ['א1','א2','ב1','ב2','ג1','ג2','ד1','ד2','ה1','ה2','ו1','ו2'];

export default function RegistrationForm({ onRegister }) {
  const [form, setForm] = useState({ id: '', fullName: '', className: '' });

  const [msg, setMsg] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.id.length !== 9 || !/^\d{9}$/.test(form.id)) {
      setMsg({ type: 'error', text: 'תעודת זהות חייבת להכיל בדיוק 9 ספרות' });
      return;
    }

    const { ok, data } = await registerTeacher({ id: form.id, fullName: form.fullName, className: form.className });

    if (!ok) return setMsg({ type: 'error', text: data.error });

    onRegister({ ID: form.id, FullName: form.fullName, ClassName: form.className });
  };

  return (
    <div className="card">
      <h2>רישום מורה חדשה</h2>
      <form onSubmit={handleSubmit} className="form">

        {/* שדה שם מלא - חובה */}
        <input required placeholder="שם פרטי ומשפחה" value={form.fullName}
          onChange={e => setForm({ ...form, fullName: e.target.value })} />

        {/* שדה תעודת זהות - מוגבל ל-9 תווים, ולידציה נוספת ב-handleSubmit */}
        <input required placeholder="תעודת זהות (9 ספרות)" value={form.id} maxLength={9}
          onChange={e => setForm({ ...form, id: e.target.value })} />

        {/* בחירת כיתה מתוך רשימת CLASSES */}
        <select required value={form.className} onChange={e => setForm({ ...form, className: e.target.value })}>
          <option value="">בחרי כיתה</option>
          {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <button type="submit">הרשמה</button>
      </form>

      {/* הודעת הצלחה/שגיאה - מוצגת רק אחרי ניסיון שליחה */}
      {msg && <p className={`msg ${msg.type}`}>{msg.text}</p>}
    </div>
  );
}
