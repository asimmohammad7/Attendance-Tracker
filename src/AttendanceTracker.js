import { useContext, useEffect, useState, useCallback } from "react";
import { AttendanceContext } from "./AttendanceContext";
import StudentList from "./StudentList";
import { useNavigate } from "react-router-dom";
import { Icon } from '@mui/material';
import './styles.css';

const AttendanceTracker = () => {
  const {
    totalClasses,
    teacherInfo,
    isFormSubmitted,
    logoutTeacher,
    students,
    endSemester,
    processClassAttendance,
  } = useContext(AttendanceContext);

  const [isTakingClass, setIsTakingClass] = useState(false);
  const [studentSelections, setStudentSelections] = useState({});
  const [preselectAll, setPreselectAll] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isFormSubmitted || !teacherInfo?.name) navigate("/login");
  }, [isFormSubmitted, teacherInfo, navigate]);

  useEffect(() => {
    if (teacherInfo?.name) {
      document.title = `${teacherInfo.name} - Attendance Tracker`;
    } else {
      document.title = "Attendance Tracker";
    }
  }, [teacherInfo]);

  useEffect(() => {
    if (isTakingClass) {
      const defaultSelections = students.reduce((acc, student) => {
        acc[student.id] = preselectAll ? 'present' : 'absent';
        return acc;
      }, {});
      setStudentSelections(defaultSelections);
    }
  }, [isTakingClass, preselectAll, students]);

  const handleClassMarking = useCallback((studentId, status) => {
    setStudentSelections(prev => ({ ...prev, [studentId]: status }));
  }, []);

  const handlePreselectAll = useCallback(() => setPreselectAll(true), []);

  const handleSubmitClass = useCallback(() => {
    if (window.confirm("Confirm attendance for this class?")) {
      processClassAttendance(studentSelections);
      setIsTakingClass(false);
      setStudentSelections({});
      setPreselectAll(false);
    }
  }, [studentSelections, processClassAttendance]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logoutTeacher();
      navigate("/login");
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="teacher-profile">
          <div className="teacher-avatar">{teacherInfo?.name?.[0].toUpperCase() || 'T'}</div>
          <div className="teacher-meta">
            <h1 className="teacher-name">{teacherInfo?.name}</h1>
            <p className="teacher-subject">{teacherInfo?.subject} • Semester {teacherInfo?.semester}</p>
          </div>
        </div>

        <div className="header-actions">
          <button className="action-button danger" onClick={endSemester} type="button"><Icon>event_busy</Icon> End Semester</button>
          <button className="action-button logout-btn" onClick={handleLogout} type="button"><Icon>logout</Icon> Sign Out</button>
          {!isTakingClass && <button className="action-button primary" onClick={() => setIsTakingClass(true)} type="button"><Icon>event_available</Icon> Take Class</button>}
          {isTakingClass && (
            <div className="class-controls">
              <button className="btn-success" onClick={handlePreselectAll} type="button"><Icon>check_box</Icon> Mark All Present</button>
            </div>
          )}
        </div>
      </header>

      {isTakingClass && (
        <div className="class-taking-interface" aria-label="Class Attendance Interface">
          <div className="class-header">
            <h2>Class Attendance - {new Date().toLocaleDateString()}</h2>
            <div className="class-stats" aria-live="polite">
              <span className="present-stat" title="Present students count"><Icon>check_circle</Icon>{Object.values(studentSelections).filter(status => status === 'present').length} Present</span>
              <span className="absent-stat" title="Absent students count"><Icon>cancel</Icon>{students.length - Object.values(studentSelections).filter(status => status === 'present').length} Absent</span>
            </div>
            <div className="class-controls">
              <button className="btn-primary" onClick={handleSubmitClass} type="button"><Icon>save</Icon> Save Class</button>
              <button className="btn-warning" onClick={() => {
                if (window.confirm("Cancel this class attendance? All changes will be lost.")) {
                  setIsTakingClass(false);
                  setStudentSelections({});
                  setPreselectAll(false);
                }
              }} type="button"><Icon>close</Icon> Cancel</button>
            </div>
          </div>

          <div className="attendance-grid" role="list" aria-label="Student attendance list">
            {students.map((student) => (
              <div key={student.id} role="listitem" className={`attendance-card ${studentSelections[student.id] === 'present' ? 'present' : 'absent'}`}>
                <div className="student-info">
                  <div className="student-avatar" aria-hidden="true">{student.name[0].toUpperCase()}</div>
                  <div>
                    <h3>{student.name}</h3>
                    <p>Roll: #{student.rollNo}</p>
                    <small>Total Attendance: {student.attendanceCount} (
                      {totalClasses > 0 ? ((student.attendanceCount / totalClasses) * 100).toFixed(1) : 0}%)</small>
                  </div>
                </div>
                <div className="attendance-options" role="group" aria-label={`Mark attendance for ${student.name}`}>
                  <button className={`present-toggle ${studentSelections[student.id] === 'present' ? 'active' : ''}`} onClick={() => handleClassMarking(student.id, 'present')} aria-pressed={studentSelections[student.id] === 'present'} type="button" aria-label={`Mark ${student.name} as Present`}><Icon>check</Icon></button>
                  <button className={`absent-toggle ${studentSelections[student.id] === 'absent' ? 'active' : ''}`} onClick={() => handleClassMarking(student.id, 'absent')} aria-pressed={studentSelections[student.id] === 'absent'} type="button" aria-label={`Mark ${student.name} as Absent`}><Icon>close</Icon></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <StudentList />
    </div>
  );
};

export default AttendanceTracker;