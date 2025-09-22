import React, { useContext } from "react";
import { AttendanceProvider, AttendanceContext } from "./AttendanceContext";
import AttendanceTracker from "./AttendanceTracker";
import TeacherForm from "./TeacherForm";
import LoginForm from "./LoginForm";
import './styles.css';

const AppContent = () => {
  const {
    isFormSubmitted,
    teacherInfo,
    logoutTeacher,
    setIsFormSubmitted,
  } = useContext(AttendanceContext);

  const generateKey = (info) => {
    if (!info?.name || !info?.subject || !info?.semester) return "unknown_teacher_key";
    return `${info.name.trim()}_${info.subject.trim()}_${info.semester.trim()}`.toLowerCase();
  };

  const handleLogout = () => {
    if (!teacherInfo) return;

    const key = teacherInfo.key || generateKey(teacherInfo);
    localStorage.removeItem(`${key}-students`);
    localStorage.removeItem(`${key}-totalClasses`);

    logoutTeacher();
    setIsFormSubmitted(false);
  };

  if (!teacherInfo || !teacherInfo.name?.trim()) {
    return <LoginForm />;
  }

  if (!isFormSubmitted) {
    return <TeacherForm />;
  }

  return (
    <main className="container" role="main">
      <header className="teacher-info" aria-label="Teacher Information">
        <p>
          Welcome, <strong>{teacherInfo.name}</strong> ({teacherInfo.subject} - Semester {teacherInfo.semester})
        </p>
        <button
          className="logout-btn"
          onClick={handleLogout}
          aria-label="Logout"
          type="button"
        >
          Logout
        </button>
      </header>

      <AttendanceTracker />
    </main>
  );
};

const App = () => (
  <AttendanceProvider>
    <AppContent />
  </AttendanceProvider>
);

export default App;