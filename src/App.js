import { AttendanceProvider } from "./AttendanceContext";
import AttendanceTracker from "./AttendanceTracker";
import "./App.css";

function App() {
  return (
    <AttendanceProvider>
      <AttendanceTracker />
    </AttendanceProvider>
  );
}

export default App;