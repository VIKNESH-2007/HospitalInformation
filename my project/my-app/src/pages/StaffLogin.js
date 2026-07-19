import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css"; // Reuse Login styles since it has a premium design system
import { loginUser } from "../services/AuthServices";

// Premium inline SVG medical shield logo
const MedicalLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="brand-logo-svg">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(6, 182, 212, 0.15)" stroke="currentColor" />
    <path d="M12 8v8" stroke="currentColor" strokeWidth="3" />
    <path d="M8 12h8" stroke="currentColor" strokeWidth="3" />
  </svg>
);

function StaffLogin() {
  const navigate = useNavigate();
  const [login, setLogin] = useState({
    username: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setLogin({
      ...login,
      [e.target.name]: e.target.value
    });
    if (errorMsg) setErrorMsg("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!login.username || !login.password) {
      setErrorMsg("Please enter both username and password.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await loginUser({
        username: login.username,
        password: login.password
      });

      if (response.data) {
        if (response.data.role !== "Staff") {
          setErrorMsg("Access denied. Only staff members are allowed to log in here.");
          setIsLoading(false);
          return;
        }

        localStorage.setItem("user", JSON.stringify({
          username: response.data.username,
          role: response.data.role,
          token: response.data.token,
          fullName: response.data.fullName,
          email: response.data.email
        }));

        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Staff Login failed:", error);
      if (error.response && error.response.data) {
        const data = error.response.data;
        setErrorMsg(data.message || (typeof data === "string" ? data : "Invalid staff credentials. Please try again."));
      } else {
        setErrorMsg("Unable to connect to server. Please verify your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        
        {/* Left Side: Brand Panel */}
        <div className="brand-panel" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)" }}>
          <div className="brand-panel-content">
            <div className="brand-logo">
              <span className="logo-icon-svg">
                <MedicalLogo />
              </span>
              <h2>NovaCare Hospital</h2>
            </div>
            <div className="brand-text">
              <h1>Doctor & Nurse Portal</h1>
              <p>Sign in to manage patient diagnostics, view clinical appointment queues, update laboratory and pharmaceutical prescriptions, and coordinate shift rosters.</p>
            </div>
            <div className="brand-stats">
              <div className="stat-item">
                <h3>Clinical</h3>
                <p>Workstation</p>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <h3>Hi-Res</h3>
                <p>Diagnostics</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Panel */}
        <div className="login-form-panel">
          <div className="login-card">
            <div className="login-header">
              <h1>Staff Login</h1>
              <p>Please enter your clinical account credentials</p>
            </div>

            {errorMsg && (
              <div className="error-alert">
                <span className="alert-icon">⚠️</span>
                <p>{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="form-fields">
              <div className="input-group">
                <input
                  type="text"
                  name="username"
                  id="username"
                  required
                  placeholder=" "
                  value={login.username}
                  onChange={handleChange}
                />
                <label htmlFor="username">Staff Username</label>
              </div>

              <div className="input-group password-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  required
                  placeholder=" "
                  value={login.password}
                  onChange={handleChange}
                />
                <label htmlFor="password">Password</label>
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                      <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
                      <path d="M15.713 14.653L13.9 12.84a3 3 0 00-3.74-3.74L8.347 7.287a5.25 5.25 0 017.366 7.366zM4.747 6.471a11.196 11.196 0 00-3.424 4.976 1.743 1.743 0 000 1.112c1.487 4.472 5.705 7.697 10.677 7.697 1.88 0 3.654-.46 5.233-1.272l-2.072-2.072a5.223 5.223 0 01-3.161.947 5.25 5.25 0 01-5.25-5.25c0-1.129.356-2.174.962-3.03L4.747 6.47z" />
                    </svg>
                  )}
                </button>
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={isLoading}
                style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)" }}
              >
                {isLoading ? "Signing in..." : "Access Portal"}
              </button>
            </form>



            <div className="login-footer">
              <div className="alternate-login-links">
                <Link to="/login" className="alt-link">
                  Patient Portal
                </Link>
                <span className="alt-divider">•</span>
                <Link to="/admin-login" className="alt-link">
                  Admin Portal
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default StaffLogin;
