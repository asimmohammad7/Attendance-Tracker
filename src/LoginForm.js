import { useContext, useState, useEffect } from "react";
import { AttendanceContext } from "./AttendanceContext";
import { useNavigate } from "react-router-dom";
import { Icon } from "@mui/material";
import "./styles.css";

const LoginForm = () => {
  const {
    loginTeacher,
    setIsFormSubmitted,
    error: contextError,
    setError: setContextError,
    teacherInfo,
  } = useContext(AttendanceContext);

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (contextError) setContextError(null);
    if (localError) setLocalError("");
  }, [name, subject, semester, password, contextError, setContextError, localError]);

  useEffect(() => {
    if (teacherInfo?.name) navigate("/attendance", { replace: true });
  }, [teacherInfo, navigate]);

  const validateInputs = () => {
    const trimmed = {
      name: name.trim(),
      subject: subject.trim(),
      semester: semester.trim(),
      password: password.trim(),
    };

    if (!trimmed.name || !trimmed.subject || !trimmed.semester || !trimmed.password) {
      setLocalError("Please fill in all fields.");
      return null;
    }

    if (!/^\d+$/.test(trimmed.semester)) {
      setLocalError("Semester must be a number.");
      return null;
    }

    if (!/^[a-zA-Z]+$/.test(trimmed.subject)) {
      setLocalError("Subject must contain only letters.");
      return null;
    }

    if (trimmed.password.length < 6) {
      setLocalError("Password should be at least 6 characters.");
      return null;
    }

    return trimmed;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError("");
    setContextError(null);

    const trimmed = validateInputs();
    if (!trimmed) return;

    const success = loginTeacher(trimmed);
    if (success) {
      setIsFormSubmitted(true);
      navigate("/attendance");
    }
  };

  return (
    <div className="auth-container" role="main">
      <div className="auth-card" aria-labelledby="login-title" aria-describedby="login-desc">
        <div className="auth-header">
          <div className="auth-icon-container" aria-hidden="true">
            <Icon className="auth-icon" sx={{ fontSize: 40 }}>lock</Icon>
          </div>
          <h1 id="login-title" className="auth-title">Attendance Portal</h1>
          <p id="login-desc" className="auth-subtitle">Teacher Login</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <span className="input-icon" aria-hidden="true">
              <Icon>person</Icon>
            </span>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="auth-input"
              aria-label="Teacher Name"
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <span className="input-icon" aria-hidden="true">
              <Icon>book</Icon>
            </span>
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="auth-input"
              aria-label="Subject"
              required
            />
          </div>

          <div className="form-group">
            <span className="input-icon" aria-hidden="true">
              <Icon>calendar_month</Icon>
            </span>
            <input
              type="text"
              placeholder="Semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="auth-input"
              aria-label="Semester"
              required
            />
          </div>

          <div className="form-group">
            <span className="input-icon" aria-hidden="true">
              <Icon>key</Icon>
            </span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              aria-label="Password"
              required
              minLength={6}
            />
          </div>

          {(localError || contextError) && (
            <div className="form-error" role="alert" aria-live="assertive">
              <Icon sx={{ fontSize: 20, mr: 1, verticalAlign: "middle" }}>error</Icon>
              <span>{localError || contextError}</span>
            </div>
          )}

          <button className="auth-button" type="submit" aria-label="Sign In">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;