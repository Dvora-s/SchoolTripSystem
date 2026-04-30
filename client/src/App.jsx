/*
 * זהו הקובץ הראשי של הצד הלקוח 
 * תפקידו:
 *   1. לנהל את מצב ההתחברות - האם יש מורה מחוברת ומי היא
 *   2. לנהל את הניווט בין שלושת המסכים: התחברות / הרשמה / לוח בקרה
 *   3. להציג את סרגל הניווט העליון בהתאם למצב הנוכחי
 *   4. להחליט איזה קומפוננט להציג בגוף הדף
 */

import { useState } from 'react';
import RegistrationForm from './components/RegistrationForm';
import TeacherView from './components/TeacherView';
import './App.css';

export default function App() {
  const [loggedInTeacher, setLoggedInTeacher] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const handleLogin = (teacher) => {
    setLoggedInTeacher(teacher);
    setCurrentView('dashboard');
  };

  const handleRegister = (teacher) => {
    setLoggedInTeacher(teacher);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setLoggedInTeacher(null);
    setCurrentView('login');
  };

  return (
    <>
      <nav className="navbar">
        <span className="logo">🛡️ מערכת איכון טיולים</span>
        <div className="nav-links">
          {loggedInTeacher ? (
            <>
              <span>שלום, <strong>{loggedInTeacher.FullName}</strong></span>
              <button onClick={handleLogout}>התנתקות</button>
            </>
          ) : (
            <>
              <button className={currentView === 'login' ? 'active' : ''} onClick={() => setCurrentView('login')}>התחברות</button>
              <button className={currentView === 'register' ? 'active' : ''} onClick={() => setCurrentView('register')}>הרשמה למערכת</button>
            </>
          )}
        </div>
      </nav>

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
