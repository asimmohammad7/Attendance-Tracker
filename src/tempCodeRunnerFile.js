import { createContext, useEffect, useState } from "react";

export const AttendanceContext = createContext();

export const AttendanceProvider = ({ children }) => {
  const [teacherInfo, setTeacherInfo] = useState(() => {
    const savedInfo = localStorage.getItem("teacherInfo");
    return savedInfo
      ? JSON.parse(savedInfo)
      : { name: "", subject: "", semester: "" };
  });

  const [isFormSubmitted, setIsFormSubmitted] = useState(() => {
    const savedFlag = localStorage.getItem("isFormSubmitted");
    return savedFlag ? JSON.parse(savedFlag) : false;
  });

  // Get key based on teacher name
  const getStudentKey = (teacherName) => {
    return teacherName ? `students_${teacherName}` : "students_default";
  };

  const getClassKey = (teacherName) => {
    return teacherName ? `classes_${teacherName}` : "classes_default";
  };

  const [students, setStudents] = useState(() => {
    const teacherName = teacherInfo?.name;
    const key = getStudentKey(teacherName);
    const savedData = localStorage.getItem(key);
    return savedData ? JSON.parse(savedData) : [];
  });

  const [totalClasses, setTotalClasses] = useState(() => {
    const teacherName = teacherInfo?.name;
    const key = getClassKey(teacherName);
    const savedTotal = localStorage.getItem(`${key}_total`);
    return savedTotal ? Number(savedTotal) : 0;
  });

  const [plannedClasses, setPlannedClasses] = useState(() => {
    const teacherName = teacherInfo?.name;
    const key = getClassKey(teacherName);
    const savedPlanned = localStorage.getItem(`${key}_planned`);
    return savedPlanned ? Number(savedPlanned) : 0;
  });

  useEffect(() => {
    const teacherName = teacherInfo?.name;
    if (!teacherName) return;

    const studentKey = getStudentKey(teacherName);
    const classKey = getClassKey(teacherName);

    localStorage.setItem(studentKey, JSON.stringify(students));
    localStorage.setItem(`${classKey}_total`, totalClasses);
    localStorage.setItem(`${classKey}_planned`, plannedClasses);
    localStorage.setItem("teacherInfo", JSON.stringify(teacherInfo));
    localStorage.setItem("isFormSubmitted", JSON.stringify(isFormSubmitted));
  }, [students, totalClasses, plannedClasses, teacherInfo, isFormSubmitted]);

  const addStudent = (name, rollNo) => {
    setStudents((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        rollNo,
        attendanceCount: 0,
        absentCount: 0,
        markedToday: false,
      },
    ]);
  };

  const markAttendance = (id) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id
          ? {
              ...student,
              attendanceCount: student.attendanceCount + 1,
              markedToday: true,
            }
          : student
      )
    );
  };

  const markAbsent = (id) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id
          ? {
              ...student,
              absentCount: student.absentCount + 1,
              markedToday: true,
            }
          : student
      )
    );
  };

  const deleteStudent = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      setStudents((prev) => prev.filter((student) => student.id !== id));
    }
  };

  const takeClass = () => {
    setStudents((prev) =>
      prev.map((student) =>
        student.markedToday
          ? { ...student, markedToday: false }
          : { ...student, absentCount: student.absentCount + 1 }
      )
    );
    setTotalClasses((prev) => prev + 1);
  };

  const endSemester = () => {
    if (window.confirm("Are you sure you want to reset the semester?")) {
      setStudents([]);
      setTotalClasses(0);
      setPlannedClasses(0);
      setTeacherInfo({ name: "", subject: "", semester: "" });
      setIsFormSubmitted(false);
    }
  };

  // Login functionality
  const loginTeacher = (teacherData) => {
    setTeacherInfo(teacherData);
    localStorage.setItem("teacherInfo", JSON.stringify(teacherData));
  };

  // Logout functionality
  const logoutTeacher = () => {
    setTeacherInfo({ name: "", subject: "", semester: "" });
    localStorage.removeItem("teacherInfo");
    setStudents([]);
    setTotalClasses(0);
    setPlannedClasses(0);
    setIsFormSubmitted(false);
  };

  return (
    <AttendanceContext.Provider
      value={{
        students,
        addStudent,
        markAttendance,
        markAbsent,
        deleteStudent,
        takeClass,
        endSemester,
        totalClasses,
        plannedClasses,
        setPlannedClasses,
        teacherInfo,
        setTeacherInfo,
        isFormSubmitted,
        setIsFormSubmitted,
        loginTeacher,
        logoutTeacher,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};