import { useContext } from "react";
import { AttendanceContext } from "./AttendanceContext";

const StudentList = () => {
  const { students, markAttendance, totalClasses } = useContext(AttendanceContext);

  return (
    <div className="attendance-tracker">
      <h2>Student Attendance</h2>
      <ul className="student-list">
        {students.map((student) => (
          <li key={student.id}>
            <span>
              {student.name} (Roll No: {student.rollNo}) — Attendance: {student.attendanceCount} / {totalClasses} (
              {totalClasses > 0 ? ((student.attendanceCount / totalClasses) * 100).toFixed(2) : 0}%)
            </span>
            <button
              className="toggle-btn present"
              onClick={() => markAttendance(student.id)}
            >
              Mark Present for Current Class
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentList;