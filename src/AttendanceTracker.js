import { useContext, useState } from "react";
import { AttendanceContext } from "./AttendanceContext";
import StudentList from "./StudentList";

const AttendanceTracker = () => {
  const { addStudent, takeClass, endSemester, totalClasses } = useContext(AttendanceContext);
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");

  const handleAddStudent = () => {
    if (name && rollNo) {
      addStudent(name, rollNo);
      setName("");
      setRollNo("");
    }
  };

  return (
    <div>
      <h1>Attendance Tracker</h1>
      <div>
        <input
          type="text"
          placeholder="Student Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Roll No"
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
        />
        <button onClick={handleAddStudent}>Add Student</button>
        <button onClick={takeClass}>Take Class</button>
        <button onClick={endSemester}>End Semester</button>
        <p>Total Classes Held: {totalClasses}</p>
      </div>
      <StudentList />
    </div>
  );
};

export default AttendanceTracker;