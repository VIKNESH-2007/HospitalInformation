import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";
import { registerUser } from "../services/AuthServices";

function Register() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "User"
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
    if (errorMsg) setErrorMsg("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      !user.fullName ||
      !user.username ||
      !user.email ||
      !user.phone ||
      !user.password ||
      !user.confirmPassword
    ) {
      setErrorMsg("Please fill in all the required fields.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (user.password !== user.confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Prepare payload - note: we exclude confirmPassword before sending to API
      const { confirmPassword, ...payload } = user;
      
      await registerUser(payload);
      
      setSuccessMsg("Registration successful! Redirecting to login page...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (error) {
      console.error("Registration failed:", error);
      if (error.response && error.response.data) {
        const data = error.response.data;
        setErrorMsg(data.message || (typeof data === "string" ? data : "Failed to create account. Please try again."));
      } else {
        setErrorMsg("Unable to connect to server. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page-wrapper">
      <div className="register-container">
        
        {/* Left Side: Brand Panel */}
        <div className="brand-panel">
          <div className="brand-panel-content">
            <div className="brand-logo">
              <span className="logo-icon">🏥</span>
              <h2>HIMS</h2>
            </div>
            <div className="brand-text">
              <h1>Join Our Digital Medical Platform</h1>
              <p>Sign up to gain access to patient data insights, schedule management, instant reporting, and smart hospital workflows.</p>
            </div>
            <div className="brand-stats">
              <div className="stat-item">
                <h3>100%</h3>
                <p>HIPAA Compliant</p>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <h3>Realtime</h3>
                <p>Sync Engine</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Panel */}
        <div className="register-form-panel">
          <div className="register-card">
            <div className="register-header">
              <h1>Create Account</h1>
              <p>Register as a new hospital staff member</p>
            </div>

            {errorMsg && (
              <div className="error-alert">
                <span className="alert-icon">⚠️</span>
                <p>{errorMsg}</p>
              </div>
            )}

            {successMsg && (
              <div className="success-alert">
                <span className="alert-icon">✅</span>
                <p>{successMsg}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="form-fields">
              <div className="input-group">
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  required
                  placeholder=" "
                  value={user.fullName}
                  onChange={handleChange}
                />
                <label htmlFor="fullName">Full Name</label>
              </div>

              <div className="input-group">
                <input
                  type="text"
                  name="username"
                  id="username"
                  required
                  placeholder=" "
                  value={user.username}
                  onChange={handleChange}
                />
                <label htmlFor="username">Username</label>
              </div>

              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  placeholder=" "
                  value={user.email}
                  onChange={handleChange}
                />
                <label htmlFor="email">Email Address</label>
              </div>

              <div className="input-group">
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  required
                  placeholder=" "
                  value={user.phone}
                  onChange={handleChange}
                />
                <label htmlFor="phone">Phone Number</label>
              </div>

              <div className="input-group select-group">
                <select
                  name="role"
                  id="role"
                  required
                  value={user.role}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "16px 14px 12px",
                    fontSize: "15px",
                    border: "1.5px solid var(--border-color)",
                    borderRadius: "12px",
                    outline: "none",
                    background: "transparent",
                    color: "var(--text-light)",
                    transition: "all 0.2s ease"
                  }}
                >
                  <option value="User" style={{ background: "#0f172a", color: "#f8fafc" }}>Patient / General User</option>
                  <option value="Staff" style={{ background: "#0f172a", color: "#f8fafc" }}>Hospital Staff Member</option>
                </select>
                <label htmlFor="role" style={{
                  position: "absolute",
                  left: "14px",
                  top: "0px",
                  fontSize: "12px",
                  color: "var(--primary-color)",
                  fontWeight: "600",
                  background: "#0f172a",
                  padding: "0 4px"
                }}>Account Type</label>
              </div>

              <div className="input-group password-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  required
                  placeholder=" "
                  value={user.password}
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

              <div className="input-group password-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  id="confirmPassword"
                  required
                  placeholder=" "
                  value={user.confirmPassword}
                  onChange={handleChange}
                />
                <label htmlFor="confirmPassword">Confirm Password</label>
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
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
                className="register-btn"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </button>
            </form>

            <div className="register-footer">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="login-link">
                  Sign in instead
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Register;