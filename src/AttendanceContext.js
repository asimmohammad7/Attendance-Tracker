import { createContext, useState } from "react";

export const AttendanceContext = createContext();

export const AttendanceProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [totalClasses, setTotalClasses] = useState(0);

  const addStudent = (name, rollNo) => {
    setStudents((prev) => [
      ...prev,
      { id: Date.now(), name, rollNo, attendanceCount: 0 },
    ]);
  };

  const markAttendance = (id) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id
          ? { ...student, attendanceCount: student.attendanceCount + 1 }
          : student
      )
    );
  };

  const takeClass = () => {
    setTotalClasses((prev) => prev + 1);
  };

  const endSemester = () => {
    setTotalClasses(0);
    setStudents([]);
  };

  return (
    <AttendanceContext.Provider
      value={{ students, addStudent, markAttendance, takeClass, endSemester, totalClasses }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};