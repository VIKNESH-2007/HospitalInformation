import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminLogin.css";
import { loginUser } from "../services/AuthServices";

// Premium inline SVG medical shield logo
const MedicalLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "36px", height: "36px", color: "#38bdf8", marginRight: "12px", flexShrink: 0 }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(56, 189, 248, 0.15)" stroke="currentColor" />
    <path d="M12 8v8" stroke="currentColor" strokeWidth="3" />
    <path d="M8 12h8" stroke="currentColor" strokeWidth="3" />
  </svg>
);

function AdminLogin() {
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
        if (response.data.role !== "Admin") {
          setErrorMsg("Access denied. Only administrators are allowed to log in here.");
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
      console.error("Admin Login failed:", error);
      if (error.response && error.response.data) {
        const data = error.response.data;
        setErrorMsg(data.message || (typeof data === "string" ? data : "Invalid admin credentials. Please try again."));
      } else {
        setErrorMsg("Unable to connect to server. Please verify your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="admin-login-page-wrapper">
      <div className="admin-login-container">
        
        {/* Left Side: Brand Panel */}
        <div className="admin-brand-panel">
          <div className="admin-brand-panel-content">
            <div className="admin-brand-logo" style={{ display: "flex", alignItems: "center" }}>
              <MedicalLogo />
              <h2>NovaCare Hospital</h2>
            </div>
            <div className="admin-brand-text">
              <h1>Hospital Admin Control Center</h1>
              <p>Manage system-wide configuration, access audits, register departments, assign doctors, control billing, and oversee HIMS metrics.</p>
            </div>
            <div className="admin-brand-stats">
              <div className="admin-stat-item">
                <h3>99.99%</h3>
                <p>Uptime & Reliability</p>
              </div>
              <div className="admin-stat-divider"></div>
              <div className="admin-stat-item">
                <h3>Strict</h3>
                <p>Audits & Access Logs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Panel */}
        <div className="admin-login-form-panel">
          <div className="admin-login-card">
            <div className="admin-login-header">
              <h1>Admin Access Portal</h1>
              <p>Secure login for HIMS site administrators</p>
            </div>

            {errorMsg && (
              <div className="admin-error-alert">
                <span className="admin-alert-icon">🔒</span>
                <p>{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="admin-form-fields">
              <div className="admin-input-group">
                <input
                  type="text"
                  name="username"
                  id="username"
                  required
                  placeholder=" "
                  value={login.username}
                  onChange={handleChange}
                />
                <label htmlFor="username">Admin Username</label>
              </div>

              <div className="admin-input-group admin-password-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  required
                  placeholder=" "
                  value={login.password}
                  onChange={handleChange}
                />
                <label htmlFor="password">Admin Password</label>
                <button
                  type="button"
                  className="admin-password-toggle-btn"
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
                className="admin-login-btn"
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : "Admin Access"}
              </button>
            </form>



            <div className="admin-login-footer">
              <p>
                Not an administrator?{" "}
                <Link to="/login" className="admin-staff-link">
                  Go to Staff Portal
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminLogin;
