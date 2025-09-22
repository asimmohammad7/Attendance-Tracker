import React, { createContext, useState, useCallback, useEffect } from "react";

export const AttendanceContext = createContext();

export const AttendanceProvider = ({ children }) => {
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [totalClasses, setTotalClasses] = useState(0);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const generateKey = useCallback((info) => {
    if (!info?.name || !info?.subject || !info?.semester) return "unknown_teacher_key";
    return `${info.name.trim()}_${info.subject.trim()}_${info.semester.trim()}`.toLowerCase();
  }, []);

  const saveToStorage = useCallback((key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }, []);

  const loadFromStorage = useCallback((key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Failed to load from localStorage:", e);
      return null;
    }
  }, []);

  const loginTeacher = useCallback(
    (info, errorSetter = setError) => {
      if (!info?.name || !info?.subject || !info?.semester || !info?.password) {
        errorSetter("All teacher fields are required.");
        return false;
      }

      const teachers = loadFromStorage("teachers") || {};
      const key = generateKey(info);

      if (teachers[key]) {
        // Existing teacher - validate password
        if (teachers[key].password !== info.password) {
          errorSetter("Invalid password!");
          return false;
        }
      } else {
        // New teacher - save credentials
        teachers[key] = { password: info.password };
        saveToStorage("teachers", teachers);
      }

      setTeacherInfo({ ...info, key });
      const storedStudents = loadFromStorage(`${key}-students`) || [];
      const storedTotalClasses = loadFromStorage(`${key}-totalClasses`) || 0;
      setStudents(storedStudents);
      setTotalClasses(storedTotalClasses);
      errorSetter(null);
      return true;
    },
    [generateKey, loadFromStorage, saveToStorage]
  );

  const logoutTeacher = useCallback(() => {
    setTeacherInfo(null);
    setStudents([]);
    setTotalClasses(0);
    setIsFormSubmitted(false);
    setError(null);
  }, []);

  const saveStudentData = useCallback(
    (updatedStudents, updatedTotal) => {
      if (!teacherInfo) return;
      const key = teacherInfo.key || generateKey(teacherInfo);

      setStudents(updatedStudents);
      if (typeof updatedTotal === "number") setTotalClasses(updatedTotal);

      saveToStorage(`${key}-students`, updatedStudents);
      if (typeof updatedTotal === "number") saveToStorage(`${key}-totalClasses`, updatedTotal);
    },
    [teacherInfo, generateKey, saveToStorage]
  );

  const addStudent = useCallback(
    (name, rollNo) => {
      if (!name.trim() || !rollNo.trim()) {
        setError("Student name and roll number are required.");
        return;
      }

      const rollNoLower = rollNo.trim().toLowerCase();
      const duplicate = students.some((s) => s.rollNo.toLowerCase() === rollNoLower);

      if (duplicate) {
        setError("Student with this roll number already exists.");
        return;
      }

      const newStudent = {
        id: `${Date.now()}`,
        name: name.trim(),
        rollNo: rollNo.trim(),
        attendanceCount: 0,
        absentCount: 0,
        teacherKey: teacherInfo?.key || generateKey(teacherInfo),
      };

      saveStudentData([...students, newStudent], totalClasses);
      setError(null);
    },
    [students, teacherInfo, generateKey, saveStudentData, totalClasses]
  );

  const markAttendance = useCallback(
    (id) => {
      const updated = students.map((s) =>
        s.id === id ? { ...s, attendanceCount: (s.attendanceCount || 0) + 1 } : s
      );
      saveStudentData(updated, totalClasses);
    },
    [students, saveStudentData, totalClasses]
  );

  const markAbsent = useCallback(
    (id) => {
      const updated = students.map((s) =>
        s.id === id ? { ...s, absentCount: (s.absentCount || 0) + 1 } : s
      );
      saveStudentData(updated, totalClasses);
    },
    [students, saveStudentData, totalClasses]
  );

  const deleteStudent = useCallback(
    (id) => {
      const updated = students.filter((s) => s.id !== id);
      saveStudentData(updated, totalClasses);
    },
    [students, saveStudentData, totalClasses]
  );

  const endSemester = useCallback(() => {
    if (!teacherInfo) return;

    const updatedStudents = students.map((student) => ({
      ...student,
      attendanceCount: 0,
      absentCount: 0,
    }));

    saveStudentData(updatedStudents, 0);
    setError("Semester data reset.");
  }, [students, saveStudentData, teacherInfo]);

  const processClassAttendance = useCallback(
    (studentSelections) => {
      if (!teacherInfo) return;

      setStudents((prevStudents) => {
        const updatedStudents = prevStudents.map((student) => {
          const status = studentSelections[student.id] || "absent";
          const isPresent = status === "present";

          return {
            ...student,
            attendanceCount: isPresent ? (student.attendanceCount || 0) + 1 : (student.attendanceCount || 0),
            absentCount: !isPresent ? (student.absentCount || 0) + 1 : (student.absentCount || 0),
          };
        });

        setTotalClasses((prevTotal) => {
          const newTotal = prevTotal + 1;
          const key = teacherInfo.key || generateKey(teacherInfo);
          saveToStorage(`${key}-students`, updatedStudents);
          saveToStorage(`${key}-totalClasses`, newTotal);

          return newTotal;
        });

        return updatedStudents;
      });
    },
    [teacherInfo, generateKey, saveToStorage]
  );

  useEffect(() => {
    if (teacherInfo) {
      const key = teacherInfo.key || generateKey(teacherInfo);
      const storedStudents = loadFromStorage(`${key}-students`) || [];
      const storedTotalClasses = loadFromStorage(`${key}-totalClasses`) || 0;

      setStudents(storedStudents);
      setTotalClasses(storedTotalClasses);
    }
  }, [teacherInfo, loadFromStorage, generateKey]);

  return (
    <AttendanceContext.Provider
      value={{
        teacherInfo,
        students,
        totalClasses,
        isFormSubmitted,
        error,
        setError,
        loginTeacher,
        logoutTeacher,
        addStudent,
        markAttendance,
        markAbsent,
        deleteStudent,
        endSemester,
        setIsFormSubmitted,
        processClassAttendance,
        setStudents,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};