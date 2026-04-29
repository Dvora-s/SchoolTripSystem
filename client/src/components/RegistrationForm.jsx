/*
 * RegistrationForm.jsx - טופס רישום מורה חדשה
 * ==============================================
 * תפקיד הקומפוננט:
 *   מאפשר למורה חדשה להירשם למערכת על ידי הזנת שם, תעודת זהות וכיתה.
 *   לאחר רישום מוצלח - המורה מחוברת אוטומטית ועוברת ישירות ללוח הבקרה.
 *
 * Props שמקבל:
 *   onRegister(teacher) - פונקציה מ-App.jsx שנקראת אחרי רישום מוצלח.
 *                         מקבלת אובייקט { ID, FullName, ClassName } ומעבירה ל-dashboard.
 *
 * תקשורת עם השרת:
 *   registerTeacher (מ-api.js) → POST /api/teachers
 */

import { useState } from 'react';
import { registerTeacher } from '../api/api';

// רשימת כל הכיתות האפשריות במערכת - מוצגת ב-dropdown
const CLASSES = ['א1','א2','ב1','ב2','ג1','ג2','ד1','ד2','ה1','ה2','ו1','ו2'];

export default function RegistrationForm({ onRegister }) {
  // form - מצב שדות הטופס: שם, תעודת זהות, כיתה
  const [form, setForm] = useState({ id: '', fullName: '', className: '' });

  // msg - הודעה שמוצגת למשתמש אחרי שליחה: { type: 'success'|'error', text: '...' }
  const [msg, setMsg] = useState(null);

  // handleSubmit - נקראת בלחיצה על "הרשמה" (שליחת הטופס)
  // 1. מונעת רענון דף (e.preventDefault)
  // 2. מבצעת ולידציה על תעודת הזהות
  // 3. שולחת את הנתונים לשרת דרך registerTeacher
  // 4. אם הצליח - קוראת ל-onRegister כדי לעבור ל-dashboard
  // 5. אם נכשל - מציגה הודעת שגיאה מהשרת
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ולידציה: תעודת זהות חייבת להיות בדיוק 9 ספרות
    if (form.id.length !== 9 || !/^\d{9}$/.test(form.id)) {
      setMsg({ type: 'error', text: 'תעודת זהות חייבת להכיל בדיוק 9 ספרות' });
      return;
    }

    // שליחת הנתונים לשרת - registerTeacher מחזיר { ok, data }
    // ok = true אם השרת החזיר סטטוס 2xx, false אחרת
    const { ok, data } = await registerTeacher({ id: form.id, fullName: form.fullName, className: form.className });

    // אם השרת החזיר שגיאה (למשל: מורה כבר קיימת) - מציג את הודעת השגיאה
    if (!ok) return setMsg({ type: 'error', text: data.error });

    // הצלחה - קורא ל-onRegister עם פרטי המורה החדשה
    // App.jsx יקבל את האובייקט הזה, יגדיר אותה כמחוברת ויעבור ל-dashboard
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
