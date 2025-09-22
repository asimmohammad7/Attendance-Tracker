import { useContext, useState, useMemo } from "react";
import { AttendanceContext } from "./AttendanceContext";
import { motion } from "framer-motion";
import { saveAs } from "file-saver";
import { debounce } from "lodash";
import { Icon } from "@mui/material";
import "./styles.css";

const StudentList = () => {
  const {
    students,
    markAttendance,
    markAbsent,
    deleteStudent,
    addStudent,
    totalClasses,
    teacherInfo,
  } = useContext(AttendanceContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [error, setError] = useState("");
  const [newStudent, setNewStudent] = useState({ name: "", rollNo: "" });

  const generateKey = (info) => {
    if (!info?.name || !info?.subject || !info?.semester) return "unknown_teacher_key";
    return `${info.name.trim()}_${info.subject.trim()}_${info.semester.trim()}`.toLowerCase();
  };

  const handleSearchChange = debounce((value) => setSearchQuery(value), 300);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddStudent = () => {
    if (!newStudent.name.trim() || !newStudent.rollNo.trim()) {
      setError("Name and Roll No are required.");
      return;
    }
    const currentTeacherKey = generateKey(teacherInfo);

    const duplicate = students.some(
      s =>
        s.teacherKey === currentTeacherKey &&
        s.rollNo.toLowerCase() === newStudent.rollNo.trim().toLowerCase()
    );

    if (duplicate) {
      setError("Student with this roll number already exists.");
      return;
    }

    addStudent(newStudent.name.trim(), newStudent.rollNo.trim());
    setNewStudent({ name: "", rollNo: "" });
    setError("");
  };

  const filteredStudents = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const currentTeacherKey = generateKey(teacherInfo);

    return students
      .filter(student =>
        student.teacherKey === currentTeacherKey &&
        (student.name.toLowerCase().includes(query) ||
          student.rollNo.toLowerCase().includes(query))
      )
      .sort((a, b) => {
        switch (sortOption) {
          case "name": return a.name.localeCompare(b.name);
          case "rollNo": return a.rollNo.localeCompare(b.rollNo);
          case "attendance": return (
            (b.attendanceCount / totalClasses || 0) -
            (a.attendanceCount / totalClasses || 0)
          );
          default: return 0;
        }
      });
  }, [students, searchQuery, sortOption, teacherInfo, totalClasses]);

  const handleExportCSV = () => {
    const key = generateKey(teacherInfo);
    const teacherStudents = students.filter(
      (student) => student.teacherKey === key
    );

    if (!teacherStudents.length || totalClasses === 0) {
      alert("No student data or classes available for export.");
      return;
    }

    let csv = "Name,Roll No,Attendance,Absents,Percentage\n";
    teacherStudents.forEach((s) => {
      const percent = totalClasses
        ? ((s.attendanceCount / totalClasses) * 100).toFixed(2)
        : "N/A";
      csv += `${s.name},${s.rollNo},${s.attendanceCount},${s.absentCount},${percent}%\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${teacherInfo.name}-attendance.csv`);
  };

  return (
    <div className="student-management" aria-label="Student Attendance Management">
      <h2>Student Attendance</h2>

      <div className="add-student-form">
        <input
          type="text"
          aria-label="New Student Name"
          placeholder="Name"
          name="name"
          value={newStudent.name}
          onChange={handleInputChange}
        />
        <input
          type="text"
          aria-label="New Student Roll Number"
          placeholder="Roll No"
          name="rollNo"
          value={newStudent.rollNo}
          onChange={handleInputChange}
        />
        <button
          onClick={handleAddStudent}
          disabled={!newStudent.name || !newStudent.rollNo}
          type="button"
          aria-label="Add New Student"
        >
          Add Student
        </button>
      </div>
      {error && <p className="error-message" role="alert">{error}</p>}

      <div className="controls-header">
        <div className="search-input">
          <Icon>search</Icon>
          <input
            type="text"
            aria-label="Search students"
            placeholder="Search students..."
            className="search-field"
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="action-buttons">
          <select
            className="styled-select"
            aria-label="Sort students"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="">Sort By</option>
            <option value="name">Name</option>
            <option value="rollNo">Roll No</option>
            <option value="attendance">Attendance</option>
          </select>
          <button
            className="btn-primary"
            onClick={handleExportCSV}
            type="button"
            aria-label="Export attendance data to CSV"
          >
            <Icon>download</Icon> Export
          </button>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <div className="student-grid" role="list" aria-label="Filtered student list">
          {filteredStudents.map((student) => {
            const attendancePercent = totalClasses
              ? (student.attendanceCount / totalClasses * 100).toFixed(1)
              : 0;

            return (
              <motion.div
                className="student-card"
                key={student.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                role="listitem"
                tabIndex={0}
                aria-label={`${student.name}, roll number ${student.rollNo}, attendance ${attendancePercent} percent`}
              >
                <div className="card-header">
                  <div className="student-avatar" aria-hidden="true">
                    {student.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h3>{student.name}</h3>
                    <p>Roll: #{student.rollNo}</p>
                  </div>
                </div>

                <div className="progress-bar" aria-label={`Attendance ${attendancePercent} percent`}>
                  <div style={{ width: `${attendancePercent}%` }} />
                </div>
                <span>{attendancePercent}%</span>

                <div className="card-actions">
                  <button
                    className="btn-success"
                    onClick={() => markAttendance(student.id)}
                    type="button"
                    aria-label={`Mark ${student.name} as Present`}
                  >
                    <Icon>check</Icon> Present
                  </button>
                  <button
                    className="btn-warning"
                    onClick={() => markAbsent(student.id)}
                    type="button"
                    aria-label={`Mark ${student.name} as Absent`}
                  >
                    <Icon>close</Icon> Absent
                  </button>
                  <button
                    className="btn-icon danger"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete ${student.name}?`)) {
                        deleteStudent(student.id);
                      }
                    }}
                    type="button"
                    aria-label={`Delete ${student.name}`}
                  >
                    <Icon>delete</Icon>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentList;