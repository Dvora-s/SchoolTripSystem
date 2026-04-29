/*
 * App.jsx - קומפוננט השורש של האפליקציה
 * =========================================
 * זהו הקובץ הראשי של הצד הלקוח (React).
 * תפקידו:
 *   1. לנהל את מצב ההתחברות - האם יש מורה מחוברת ומי היא
 *   2. לנהל את הניווט בין שלושת המסכים: התחברות / הרשמה / לוח בקרה
 *   3. להציג את סרגל הניווט העליון בהתאם למצב הנוכחי
 *   4. להחליט איזה קומפוננט להציג בגוף הדף
 *
 * זרימת הנתונים:
 *   App.jsx
 *     ├── TeacherView (מצב login)   ← מקבל את פונקציית handleLogin
 *     ├── RegistrationForm          ← מקבל את פונקציית handleRegister
 *     └── TeacherView (מצב dashboard) ← מקבל את אובייקט המורה המחוברת
 */

import { useState } from 'react';
import RegistrationForm from './components/RegistrationForm';
import TeacherView from './components/TeacherView';
import './App.css';

export default function App() {
  // loggedInTeacher - שומר את פרטי המורה המחוברת (אובייקט עם ID, FullName, ClassName)
  // כל עוד null - אף מורה לא מחוברת
  const [loggedInTeacher, setLoggedInTeacher] = useState(null);

  // currentView - קובע איזה מסך מוצג כרגע
  // ערכים אפשריים: 'login' | 'register' | 'dashboard'
  const [currentView, setCurrentView] = useState('login');

  // handleLogin - נקראת מ-TeacherView כשמורה מתחברת בהצלחה
  // מקבלת את אובייקט המורה מהשרת, שומרת אותו ועוברת ל-dashboard
  const handleLogin = (teacher) => {
    setLoggedInTeacher(teacher);
    setCurrentView('dashboard');
  };

  // handleRegister - נקראת מ-RegistrationForm כשמורה נרשמת בהצלחה
  // מקבלת את פרטי המורה החדשה, מחברת אותה אוטומטית ועוברת ל-dashboard
  const handleRegister = (teacher) => {
    setLoggedInTeacher(teacher);
    setCurrentView('dashboard');
  };

  // handleLogout - נקראת בלחיצה על כפתור "התנתקות"
  // מאפסת את המורה המחוברת וחוזרת למסך ההתחברות
  const handleLogout = () => {
    setLoggedInTeacher(null);
    setCurrentView('login');
  };

  return (
    <>
      {/* סרגל ניווט עליון - משתנה בהתאם למצב ההתחברות */}
      <nav className="navbar">
        <span className="logo">🛡️ מערכת איכון טיולים</span>
        <div className="nav-links">
          {loggedInTeacher ? (
            // מורה מחוברת - מציג שם ברכה וכפתור התנתקות
            <>
              <span>שלום, <strong>{loggedInTeacher.FullName}</strong></span>
              <button onClick={handleLogout}>התנתקות</button>
            </>
          ) : (
            // אין מורה מחוברת - מציג כפתורי מעבר בין התחברות להרשמה
            <>
              <button className={currentView === 'login' ? 'active' : ''} onClick={() => setCurrentView('login')}>התחברות</button>
              <button className={currentView === 'register' ? 'active' : ''} onClick={() => setCurrentView('register')}>הרשמה למערכת</button>
            </>
          )}
        </div>
      </nav>

      {/* גוף הדף - מציג קומפוננט אחד בכל פעם לפי currentView */}
      <main>
        {/* מסך התחברות - TeacherView ללא prop של teacher, רק עם onLogin */}
        {currentView === 'login' && <TeacherView onLogin={handleLogin} />}

        {/* מסך הרשמה - RegistrationForm מקבל את handleRegister למעבר אוטומטי */}
        {currentView === 'register' && <RegistrationForm onRegister={handleRegister} />}

        {/* לוח בקרה - TeacherView עם אובייקט המורה המחוברת */}
        {currentView === 'dashboard' && <TeacherView teacher={loggedInTeacher} />}
      </main>
    </>
  );
}
