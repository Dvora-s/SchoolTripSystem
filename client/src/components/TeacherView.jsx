/*
 * TeacherView.jsx - תצוגת המורה (התחברות + לוח בקרה)
 * ======================================================
 * קומפוננט זה משמש לשני מצבים שונים לפי ה-props שמקבל:
 *
 * מצב 1 - התחברות (כשמקבל את prop ה-onLogin):
 *   מציג טופס עם שדה תעודת זהות.
 *   לאחר התחברות מוצלחת קורא ל-onLogin עם פרטי המורה.
 *
 * מצב 2 - לוח בקרה (כשמקבל את prop ה-teacher):
 *   מציג טופס הוספת תלמידה לכיתה של המורה המחוברת.
 *   מציג טבלת כל תלמידות הכיתה.
 *   מציג מפה חיה עם מיקומי התלמידות (LiveMap).
 *
 * Props שמקבל:
 *   onLogin(teacher)  - פונקציה מ-App.jsx, נקראת אחרי התחברות מוצלחת
 *   teacher           - אובייקט { ID, FullName, ClassName } של המורה המחוברת
 *
 * תקשורת עם השרת (דרך api.js):
 *   loginTeacher      → POST /api/teachers/login       - בדיקת תעודת זהות והחזרת פרטי מורה
 *   getStudentsByClass → GET /api/teachers/:id/students - שליפת תלמידות לפי כיתת המורה
 *   registerStudent   → POST /api/students             - הוספת תלמידה חדשה
 */

import { useState, useEffect } from 'react';
import { loginTeacher, getStudentsByClass, registerStudent } from '../api/api';
import LiveMap from './LiveMap';

export default function TeacherView({ onLogin, teacher }) {
  // teacherId - מה שהמורה מקלידה בשדה תעודת הזהות בטופס ההתחברות
  const [teacherId, setTeacherId] = useState('');

  // error - הודעת שגיאה שמוצגת אם ההתחברות נכשלה
  const [error, setError] = useState(null);

  // students - מערך תלמידות הכיתה של המורה המחוברת, מגיע מהשרת
  const [students, setStudents] = useState([]);

  // studentForm - שדות טופס הוספת תלמידה: שם ותעודת זהות
  // הכיתה נלקחת אוטומטית מ-teacher.ClassName ולא מוזנת ידנית
  const [studentForm, setStudentForm] = useState({ id: '', fullName: '' });

  // studentMsg - הודעת הצלחה/שגיאה אחרי ניסיון הוספת תלמידה
  const [studentMsg, setStudentMsg] = useState(null);

  // handleAddStudent - נקראת בלחיצה על "הוספה מהירה" בטופס הוספת תלמידה
  // 1. מבצעת ולידציה על תעודת הזהות
  // 2. שולחת POST לשרת עם הנתונים + כיתת המורה
  // 3. אם הצליח - מאפסת הטופס ומרענת את רשימת התלמידות
  // 4. אם נכשל - מציגה הודעת שגיאה (למשל: תלמידה כבר קיימת)
  const handleAddStudent = async (e) => {
    e.preventDefault();

    // ולידציה: תעודת זהות חייבת להיות בדיוק 9 ספרות
    if (studentForm.id.length !== 9 || !/^\d{9}$/.test(studentForm.id)) {
      setStudentMsg({ type: 'error', text: 'תעודת זהות חייבת להכיל בדיוק 9 ספרות' });
      return;
    }

    // שליחה לשרת - הכיתה נלקחת אוטומטית מהמורה המחוברת
    const { ok, data } = await registerStudent({
      id: studentForm.id,
      fullName: studentForm.fullName,
      className: teacher.ClassName
    });

    if (!ok) return setStudentMsg({ type: 'error', text: data.error });

    // הצלחה - מאפס הטופס, מציג הודעה, ומרענן את רשימת התלמידות
    setStudentMsg({ type: 'success', text: data.message });
    setStudentForm({ id: '', fullName: '' });
    fetchStudents(); // קריאה מחדש לשרת לעדכון הטבלה
  };

  // fetchStudents - שולפת מהשרת את כל תלמידות הכיתה של המורה המחוברת
  // נקראת בשני מקרים:
  //   1. כשהמורה מתחברת (useEffect למטה)
  //   2. אחרי הוספת תלמידה חדשה (handleAddStudent למעלה)
  const fetchStudents = async () => {
    try {
      const data = await getStudentsByClass(teacher.ID);
      if (Array.isArray(data)) setStudents(data);
    } catch (err) {
      console.error(err);
    }
  };

  // useEffect - רץ אוטומטית כשהקומפוננט נטען עם מורה מחוברת
  // מביא את רשימת התלמידות מהשרת לטבלה
  // [teacher] = תלוי ב-teacher, כלומר ירוץ שוב אם המורה תתחלף
  useEffect(() => {
    if (teacher) fetchStudents();
  }, [teacher]);

  // handleLogin - נקראת בלחיצה על "התחברות למערכת"
  // שולחת את תעודת הזהות לשרת, ואם נמצאה מורה תואמת - קוראת ל-onLogin
  // onLogin מוגדרת ב-App.jsx ותעביר ל-dashboard
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    const { ok, data } = await loginTeacher(teacherId);
    if (!ok) return setError(data.error || 'שגיאת התחברות');
    onLogin(data); // data = אובייקט המורה מהשרת { ID, FullName, ClassName }
  };

  // ===== מצב לוח בקרה - מוצג כשיש מורה מחוברת =====
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

  // ===== מצב התחברות - מוצג כשאין מורה מחוברת =====
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
