import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import "./Login.css";
import { loginUser } from "../services/AuthServices";
import hospitalBg from "../assets/hospital_scenary_bg.jpg";

// Premium inline SVG medical shield logo
const MedicalLogo = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="#0284c7" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={{ width: "42px", height: "42px", marginRight: "12px", flexShrink: 0 }}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(2, 132, 199, 0.15)" />
    <path d="M12 8v8" strokeWidth="3" />
    <path d="M8 12h8" strokeWidth="3" />
  </svg>
);

function Login() {
  const navigate = useNavigate();
  const { language, changeLanguage, t } = useLanguage();

  const [selectedRole, setSelectedRole] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes("admin")) return "Admin";
    if (path.includes("staff")) return "Staff";
    return "User";
  });

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

  const handleTabChange = (role) => {
    setSelectedRole(role);
    setLogin({ username: "", password: "" }); // Clean inputs on tab click
    setErrorMsg("");
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
        const userRole = response.data.role;

        // Verify role authorization
        if (selectedRole === "Admin" && userRole !== "Admin") {
          setErrorMsg("Access denied. Only administrators are allowed to log in here.");
          setIsLoading(false);
          return;
        }

        if (selectedRole === "Staff" && userRole !== "Staff") {
          setErrorMsg("Access denied. Only clinical staff members are allowed to log in here.");
          setIsLoading(false);
          return;
        }

        if (selectedRole === "User" && userRole !== "User") {
          setErrorMsg("Access denied. Only registered patients are allowed to log in here.");
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

        if (userRole === "User") {
          navigate("/profile");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
      if (error.response && error.response.data) {
        const data = error.response.data;
        setErrorMsg(data.message || (typeof data === "string" ? data : "Invalid login credentials. Please try again."));
      } else {
        setErrorMsg("Unable to connect to server. Please verify your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Localized tagline and descriptions based on role
  const getBrandDetails = () => {
    switch (selectedRole) {
      case "Admin":
        return {
          tagline: t("adminPortalTagline"),
          desc: t("adminPortalDesc")
        };
      case "Staff":
        return {
          tagline: t("staffPortalTagline"),
          desc: t("staffPortalDesc")
        };
      default:
        return {
          tagline: t("patientPortalTagline"),
          desc: t("patientPortalDesc")
        };
    }
  };

  const brand = getBrandDetails();

  return (
    <div className="login-page-wrapper" style={{ backgroundImage: `url(${hospitalBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      
      {/* Background Graphic Blobs for Premium Glassmorphic UI */}
      <div className="login-bg-blob-1"></div>
      <div className="login-bg-blob-2"></div>

      {/* Global Language Selector Dropdown at Top Right of Login Page */}
      <div className="login-lang-container">
        <select 
          value={language} 
          onChange={(e) => changeLanguage(e.target.value)} 
          className="login-lang-select"
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी (Hindi)</option>
          <option value="ta">தமிழ் (Tamil)</option>
          <option value="te">తెలుగు (Telugu)</option>
          <option value="kn">ಕನ್ನಡ (Kannada)</option>
        </select>
      </div>

      <div className="login-container">
        
        {/* Left Side: Brand Panel */}
        <div className="brand-panel">
          <div className="brand-panel-content">
            <div className="brand-logo">
              <MedicalLogo />
              <h2>{t("title")}</h2>
            </div>
            <div className="brand-text">
              <h1>{brand.tagline}</h1>
              <p>{brand.desc}</p>
            </div>
            <div className="brand-stats">
              <div className="stat-item">
                <h3>Secure</h3>
                <p>HIPAA Shield</p>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <h3>24/7</h3>
                <p>Access & Support</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Panel */}
        <div className="login-form-panel">
          <div className="login-card">
            
            {/* Unified Role Switcher Tabs */}
            <div className="role-tabs">
              <button 
                type="button" 
                className={`role-tab ${selectedRole === "User" ? "active" : ""}`}
                onClick={() => handleTabChange("User")}
              >
                👤 {t("patientTab")}
              </button>
              <button 
                type="button" 
                className={`role-tab ${selectedRole === "Staff" ? "active" : ""}`}
                onClick={() => handleTabChange("Staff")}
              >
                🩺 {t("staffTab")}
              </button>
              <button 
                type="button" 
                className={`role-tab ${selectedRole === "Admin" ? "active" : ""}`}
                onClick={() => handleTabChange("Admin")}
              >
                ⚙️ {t("adminTab")}
              </button>
            </div>

            <div className="login-header">
              <h1>{selectedRole === "User" ? t("patientTab") : selectedRole === "Staff" ? t("staffTab") : t("adminTab")} {t("loginTitle")}</h1>
              <p>{t("enterCredentials")}</p>
            </div>

            {errorMsg && (
              <div className="error-alert">
                <span className="alert-icon">⚠️</span>
                <p>{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="form-fields" autoComplete="new-password">
              <div className="input-group">
                <input
                  type="text"
                  name="username"
                  id="username"
                  required
                  placeholder=" "
                  value={login.username}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <label htmlFor="username">{t("username")}</label>
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
                  autoComplete="new-password"
                />
                <label htmlFor="password">{t("password")}</label>
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

              {/* Localized Forget Password display for User login only */}
              {selectedRole === "User" && (
                <div className="forget-password-container">
                  <button 
                    type="button"
                    className="forget-pass-btn"
                    onClick={() => alert("Please contact hospital administration at admin@novacare.com to reset your password.")}
                  >
                    {t("forgetPassword")}
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="login-btn"
                disabled={isLoading}
              >
                {isLoading ? t("signingIn") : t("signIn")}
              </button>
            </form>

            <div className="login-footer">
              <p>
                {t("newUserRegistration")}{" "}
                <Link to="/register" className="register-link">
                  {t("createAccount")}
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;