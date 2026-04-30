import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock, Shield, Clock, Users, BarChart3, MapPin, ChevronRight, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const LoginPage = () => {
  const location = useLocation();
  const [isLoginTab, setIsLoginTab] = useState(!location.state?.showSignup);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser, userRole, loading: authLoading } = useAuth();

  // Auto-redirect is disabled to ensure the login screen shows first on localhost
  // We handle navigation manually after login in handleLogin
  useEffect(() => {
    // Initial load will stay on this page even if logged in
  }, [currentUser, userRole, authLoading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      
      // Fetch user role to determine where to navigate
      // Check both collections if needed, though typically handleLogin is for company users
      const adminDoc = await getDoc(doc(db, "admin_users", userCred.user.uid));
      const companyDoc = await getDoc(doc(db, "company_users", userCred.user.uid));
      
      const role = adminDoc.exists() ? "admin" : "user";
      
      toast.success("Login successful!");
      navigate("/home");
    } catch (error) {
      console.error("Login error:", error);
      if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
        toast.error("Invalid email or password");
      } else if (error.code === "auth/wrong-password") {
        toast.error("Incorrect password");
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    }
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, password, confirmPassword } = signupData;
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      // Registration always goes to company_users
      await setDoc(doc(db, "company_users", userCred.user.uid), {
        email: email,
        firstName: firstName,
        lastName: lastName,
        role: "user",
        createdAt: new Date(),
      });
      
      // Force sign out because Firebase auto-logs in after signup.
      // We want the user to go through the login flow manually.
      await signOut(auth);
      
      toast.success("Account created successfully! Please login.");
      setIsLoginTab(true); // Switch to login tab
      setSignupData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        companyName: "",
        phone: "",
      });
      setEmail(email); // Pre-fill email for login
    } catch (error) {
      console.error("Signup error:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("An account with this email already exists");
      } else {
        toast.error("Signup failed. Please try again.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      {/* Left Hero Section */}
      <div className="login-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Smart Attendance<br />
            Management for<br />
            Modern Companies
          </h1>
          <p className="hero-subtitle">
            Track employee check-ins, manage work hours, and
            streamline attendance with location-based accuracy.
          </p>

          <div className="hero-card-container">
            {/* Live Clock Card */}
            <div className="hero-dashboard-card">
              <div className="dash-card-header">
                <div className="dash-card-dots">
                  <span className="dot dot-red"></span>
                  <span className="dot dot-yellow"></span>
                  <span className="dot dot-green"></span>
                </div>
                <div className="dash-badge">
                  <span className="status-dot green"></span>
                  ATTENDANCE TRACKER
                </div>
              </div>
              <div className="dash-time-display">
                <div className="time-icon">
                  <Clock size={18} />
                </div>
                <div className="time-block">
                  <span className="time-value">08:42:15</span>
                  <span className="time-label">Started at 09:17:5</span>
                </div>
              </div>
              <div className="dash-action-bar">
                <button className="slide-btn">
                  <span>Slide to Clock Out</span>
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="dash-stats-row">
                <div className="stat-pill">
                  <span className="stat-value">98.5h</span>
                </div>
                <div className="stat-pill">
                  <span className="stat-value">99.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="hero-gradient-orb orb-1"></div>
        <div className="hero-gradient-orb orb-2"></div>
      </div>

      {/* Right Auth Section */}
      <div className="login-form-section" style={{ position: 'relative' }}>
        <button 
          onClick={() => navigate("/admin-login")}
          title="System Administrator Login"
          className="admin-quick-login-btn"
          style={{ 
            position: 'absolute', 
            top: '24px', 
            right: '24px',
            background: 'var(--surf-2)', 
            border: '1px solid var(--border)', 
            borderRadius: '50%', 
            width: '40px', 
            height: '40px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'var(--text-secondary)', 
            cursor: 'pointer', 
            transition: 'all 0.2s ease',
            zIndex: 10
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = 'var(--primary)';
            e.currentTarget.style.background = 'calc(var(--primary-rgb) * 0.1)';
            e.currentTarget.style.borderColor = 'calc(var(--primary-rgb) * 0.3)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.background = 'var(--surf-2)';
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Shield size={18} />
        </button>

        <div className="auth-container">
          {/* Tab Switcher */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${isLoginTab ? "active" : ""}`}
              onClick={() => setIsLoginTab(true)}
            >
              Login
            </button>
            <button
              className={`auth-tab ${!isLoginTab ? "active" : ""}`}
              onClick={() => setIsLoginTab(false)}
            >
              Sign Up
            </button>
          </div>

          {isLoginTab ? (
            /* Login Form */
            <div className="auth-form-wrapper">
              <div className="auth-header">
                <h2>Company Portal</h2>
                <p>Register your company and manage your workplace.</p>
              </div>

              <form onSubmit={handleLogin} className="auth-form">
                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input
                      type="email"
                      placeholder="contact@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="label-row">
                    <label>Password</label>
                    <a href="#" className="forgot-link">Forgot Password?</a>
                  </div>
                  <div className="input-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="btn-loading">
                      <span className="btn-spinner"></span>
                      Signing in...
                    </span>
                  ) : (
                    <>
                      Login to Dashboard
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>


            </div>
          ) : (
            /* Signup Form */
            <div className="auth-form-wrapper">
              <div className="auth-header">
                <h2>Create Your Account</h2>
                <p>Sign up to get started with attendance management.</p>
              </div>

              <form onSubmit={handleSignup} className="auth-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        placeholder="John"
                        value={signupData.firstName}
                        onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        placeholder="Doe"
                        value={signupData.lastName}
                        onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <div className="input-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input
                      type="email"
                      placeholder="john@company.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Company Name</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Acme Innovations"
                      value={signupData.companyName}
                      onChange={(e) => setSignupData({ ...signupData, companyName: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number (Optional)</label>
                  <div className="input-wrapper">
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={signupData.phone}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <div className="input-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                    >
                      {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <div className="input-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input
                      type={showSignupConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                    >
                      {showSignupConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="btn-loading">
                      <span className="btn-spinner"></span>
                      Creating Account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>
            </div>
          )}

          <div className="auth-bottom-links">
            <a href="#">Support Center</a>
            <a href="#">System Status</a>
            <a href="#">Legal</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
