import { useContext, useState } from "react";
import { AttendanceContext } from "./AttendanceContext";
import { useNavigate } from "react-router-dom";
import { Icon } from "@mui/material";
import "./styles.css";

const TeacherForm = () => {
  const {
    loginTeacher,
    setIsFormSubmitted,
    setError,
  } = useContext(AttendanceContext);

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedSubject = subject.trim();
    const trimmedSemester = semester.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName || !trimmedSubject || !trimmedSemester || !trimmedPassword) {
      setFormError("Please fill in all fields.");
      return;
    }

    if (trimmedPassword.length < 4) {
      setFormError("Password must be at least 4 characters long.");
      return;
    }

    setIsLoading(true);

    const success = loginTeacher(
      {
        name: trimmedName,
        subject: trimmedSubject,
        semester: trimmedSemester,
        password: trimmedPassword,
      },
      setError
    );

    setIsLoading(false);

    if (success) {
      setIsFormSubmitted(true);
      setFormError("");
      setName("");
      setSubject("");
      setSemester("");
      setPassword("");
      navigate("/attendance");
    } else {
      setFormError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Icon className="auth-icon">school</Icon>
          <h1>Teacher Registration</h1>
          <p>Create your attendance portal</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <Icon>person</Icon>
            <input
              type="text"
              placeholder="Your Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="auth-input"
              required
              aria-label="Teacher Full Name"
            />
          </div>

          <div className="form-group">
            <Icon>book</Icon>
            <input
              type="text"
              placeholder="Teaching Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="auth-input"
              required
              aria-label="Teaching Subject"
            />
          </div>

          <div className="form-group">
            <Icon>calendar_month</Icon>
            <input
              type="text"
              placeholder="Current Semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="auth-input"
              required
              aria-label="Current Semester"
            />
          </div>

          <div className="form-group">
            <Icon>lock</Icon>
            <input
              type="password"
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              required
              aria-label="Password"
              minLength={4}
            />
          </div>

          {formError && (
            <div className="form-error" role="alert" aria-live="assertive">
              <Icon>error</Icon>
              <span>{formError}</span>
            </div>
          )}

          <button
            className="auth-button"
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <div className="spinner" aria-hidden="true"></div>
            ) : (
              <>
                <Icon>arrow_forward</Icon>
                Continue
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherForm;