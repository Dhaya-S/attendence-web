import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Bell, User, ArrowRight, Mail, Phone, Lock, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";

const LoginPage = () => {
  const location = useLocation();
  const [isLoginTab, setIsLoginTab] = useState(!location.state?.showSignup);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup State
  const [signupData, setSignupData] = useState({
    fullName: "",
    companyName: "",
    workEmail: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false
  });
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();

  useEffect(() => {
    if (currentUser && userRole) {
      if (userRole === "admin") navigate("/admin");
      else navigate("/home");
    }
  }, [currentUser, userRole, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Please enter both email and password");
      return;
    }
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const adminDoc = await getDoc(doc(db, "admin_users", userCred.user.uid));
      const role = adminDoc.exists() ? "admin" : "user";
      
      toast.success(`Welcome back! Logged in as ${role === 'admin' ? 'Administrator' : 'Manager'}`);
      
      if (role === "admin") navigate("/admin");
      else navigate("/home");
    } catch (error) {
      console.error("Login error:", error);
      let message = "Login failed. Please check your credentials.";
      if (error.code === 'auth/user-not-found') message = "No account found with this email.";
      if (error.code === 'auth/wrong-password') message = "Incorrect password.";
      toast.error(message);
    }
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { fullName, companyName, workEmail, phone, password, confirmPassword, agreeTerms } = signupData;
    
    if (!fullName || !workEmail || !password || !confirmPassword || !companyName) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password should be at least 6 characters");
      return;
    }
    if (!agreeTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    setLoading(true);
    try {
      // Instead of creating auth user directly, submit registration request
      await addDoc(collection(db, "companies"), {
        companyName: companyName,
        adminFullName: fullName,
        officialEmail: workEmail,
        phone: phone,
        status: "pending",
        createdAt: serverTimestamp(),
        managerName: fullName,
        managerEmail: workEmail,
        password: password,
      });

      toast.success("Registration request submitted! Please wait for admin approval.", {
        duration: 5000,
      });
      
      setSignupData({
        fullName: "", companyName: "", workEmail: "", phone: "", password: "", confirmPassword: "", agreeTerms: false
      });
      setIsLoginTab(true);
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Failed to submit registration. Please try again.");
    }
    setLoading(false);
  };

  const handleSignupChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSignupData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .login-exact-container {
          display: flex;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          background: #F7F8FA;
        }

        .login-exact-left {
          flex: 1;
          background: #7664f5;
          padding: 60px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .login-exact-left-content {
          max-width: 500px;
          position: relative;
          z-index: 2;
        }

        .login-exact-title {
          font-size: 48px;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 24px;
          letter-spacing: -1px;
        }

        .login-exact-subtitle {
          font-size: 16px;
          line-height: 1.6;
          opacity: 0.8;
          max-width: 440px;
          font-weight: 400;
        }

        .login-exact-mockup {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          padding: 32px;
          max-width: 420px;
          margin-top: 60px;
          position: relative;
          z-index: 2;
          backdrop-filter: blur(10px);
        }

        .mockup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .mockup-avatar-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .mockup-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mockup-lines {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mockup-line-long { width: 80px; height: 8px; background: rgba(255,255,255,0.2); border-radius: 4px; }
        .mockup-line-short { width: 50px; height: 8px; background: rgba(255,255,255,0.2); border-radius: 4px; }

        .mockup-card-white {
          background: white;
          border-radius: 20px;
          padding: 24px;
          color: #333;
          margin-bottom: 24px;
        }

        .mockup-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .mockup-card-label {
          font-size: 12px;
          font-weight: 600;
          color: #888;
          letter-spacing: 1px;
        }

        .mockup-card-live {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          color: #7664f5;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          background: #7664f5;
          border-radius: 50%;
        }

        .mockup-time {
          font-size: 36px;
          font-weight: 800;
          color: #111;
          margin-bottom: 4px;
        }

        .mockup-started {
          font-size: 13px;
          color: #666;
        }

        .mockup-slide-btn {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 100px;
          height: 60px;
          display: flex;
          align-items: center;
          padding: 6px;
          position: relative;
          margin-bottom: 24px;
        }

        .mockup-slide-handle {
          width: 48px;
          height: 48px;
          background: #7664f5;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .mockup-slide-text {
          flex: 1;
          text-align: center;
          font-size: 14px;
          font-weight: 500;
          margin-right: 48px;
        }

        .mockup-bottom-stats {
          display: flex;
          gap: 16px;
        }

        .mockup-stat {
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 16px;
        }

        .mockup-stat-label {
          font-size: 12px;
          opacity: 0.8;
          margin-bottom: 4px;
        }

        .mockup-stat-val {
          font-size: 20px;
          font-weight: 700;
        }

        .login-exact-footer {
          font-size: 11px;
          letter-spacing: 1px;
          opacity: 0.6;
          position: relative;
          z-index: 2;
          font-weight: 500;
          text-transform: uppercase;
        }

        .login-exact-right {
          flex: 1.2;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          position: relative;
        }

        .login-exact-form-card {
          background: white;
          border-radius: 24px;
          padding: 48px;
          width: 100%;
          max-width: 520px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.02);
        }

        .login-exact-toggle {
          background: #F3F4F6;
          border-radius: 100px;
          display: flex;
          padding: 6px;
          margin-bottom: 40px;
        }

        .login-exact-toggle button {
          flex: 1;
          padding: 12px;
          border: none;
          background: transparent;
          border-radius: 100px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          color: #666;
        }

        .login-exact-toggle button.active {
          background: #7664f5;
          color: white;
          box-shadow: 0 4px 12px rgba(118, 100, 245, 0.3);
        }

        .login-exact-form h2 {
          font-size: 32px;
          font-weight: 800;
          color: #111;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .login-exact-form > p {
          color: #666;
          font-size: 15px;
          margin-bottom: 32px;
        }

        .exact-input-group {
          margin-bottom: 20px;
        }

        .exact-input-group label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #444;
          margin-bottom: 8px;
        }

        .exact-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .exact-input-wrapper input {
          width: 100%;
          background: #F0F2F5;
          border: 1px solid transparent;
          border-radius: 12px;
          padding: 16px 16px 16px 48px;
          font-size: 15px;
          color: #333;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }

        .exact-input-wrapper input:focus {
          outline: none;
          background: white;
          border-color: #7664f5;
          box-shadow: 0 0 0 4px rgba(118, 100, 245, 0.1);
        }

        .exact-input-icon {
          position: absolute;
          left: 16px;
          color: #666;
        }

        .exact-row {
          display: flex;
          gap: 20px;
        }

        .exact-row > div {
          flex: 1;
        }

        .exact-checkbox {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          cursor: pointer;
        }

        .exact-checkbox input {
          width: 18px;
          height: 18px;
          accent-color: #7664f5;
        }

        .exact-checkbox span {
          font-size: 13px;
          color: #666;
        }

        .exact-checkbox a {
          color: #7664f5;
          text-decoration: none;
        }

        .exact-btn {
          width: 100%;
          background: #7664f5;
          color: white;
          border: none;
          padding: 18px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 16px;
        }

        .exact-btn:hover {
          background: #6250d4;
        }

        .exact-switch-text {
          text-align: center;
          font-size: 14px;
          color: #666;
        }

        .exact-switch-text span {
          color: #7664f5;
          font-weight: 600;
          cursor: pointer;
        }

        .exact-divider {
          height: 1px;
          background: #eee;
          margin: 32px 0;
        }

        .exact-footer-text {
          text-align: center;
          font-size: 12px;
          color: #888;
          line-height: 1.6;
        }

        .exact-bottom-link {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 13px;
          color: #666;
        }

        .exact-bottom-link span {
          color: #7664f5;
          font-weight: 600;
          cursor: pointer;
        }

        @media (max-width: 1024px) {
          .login-exact-left { display: none; }
          .login-exact-right { padding: 20px; }
        }
      `}</style>

      <div className="login-exact-container">
        {/* Left Panel */}
        <div className="login-exact-left">
          <div className="login-exact-left-content">
            <h1 className="login-exact-title">Smart Attendance Management for Modern Companies</h1>
            <p className="login-exact-subtitle">Track employee check-ins, manage work hours, and streamline attendance with location-based accuracy.</p>
            
            <div className="login-exact-mockup">
              <div className="mockup-header">
                <div className="mockup-avatar-row">
                  <div className="mockup-avatar">
                    <User size={20} />
                  </div>
                  <div className="mockup-lines">
                    <div className="mockup-line-long"></div>
                    <div className="mockup-line-short"></div>
                  </div>
                </div>
                <Bell size={20} />
              </div>

              <div className="mockup-card-white">
                <div className="mockup-card-top">
                  <span className="mockup-card-label">ACTIVE SHIFT</span>
                  <div className="mockup-card-live">
                    <span className="live-dot"></span> LIVE
                  </div>
                </div>
                <div className="mockup-time">08:42:15</div>
                <div className="mockup-started">Started at 09:00 A</div>
              </div>

              <div className="mockup-slide-btn">
                <div className="mockup-slide-handle">
                  <ArrowRight size={20} />
                </div>
                <div className="mockup-slide-text">Slide to Clock Out</div>
              </div>

              <div className="mockup-bottom-stats">
                <div className="mockup-stat">
                  <div className="mockup-stat-label">Weekly Hours</div>
                  <div className="mockup-stat-val">38.5h</div>
                </div>
                <div className="mockup-stat">
                  <div className="mockup-stat-label">Accuracy</div>
                  <div className="mockup-stat-val">99.2%</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="login-exact-footer">
            © 2024 ETHEREAL WORKPLACE. BUILT FOR HIGH-PERFORMANCE TEAMS.
          </div>
        </div>

        {/* Right Panel */}
        <div className="login-exact-right">
          <div className="login-exact-form-card">
            <div className="login-exact-toggle">
              <button 
                className={isLoginTab ? "active" : ""} 
                onClick={() => setIsLoginTab(true)}
              >
                Login
              </button>
              <button 
                className={!isLoginTab ? "active" : ""} 
                onClick={() => setIsLoginTab(false)}
              >
                Sign up
              </button>
            </div>

            {isLoginTab ? (
              <form className="login-exact-form" onSubmit={handleLogin}>
                <h2>Welcome Back</h2>
                <p>Log in to access your dashboard</p>
                
                <div className="exact-input-group">
                  <label>Work Email</label>
                  <div className="exact-input-wrapper">
                    <Mail className="exact-input-icon" size={18} />
                    <input 
                      type="email" 
                      placeholder="elena@company.com" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="exact-input-group">
                  <label>Password</label>
                  <div className="exact-input-wrapper">
                    <Lock className="exact-input-icon" size={18} />
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="exact-btn" disabled={loading}>
                  {loading ? "Logging in..." : "Login to Dashboard"}
                </button>
                <div className="exact-switch-text">
                  Don't have an account? <span onClick={() => setIsLoginTab(false)}>Sign up</span>
                </div>
              </form>
            ) : (
              <form className="login-exact-form" onSubmit={handleSignup}>
                <h2>Create Your Account</h2>
                <p>Sign up to get started with attendance management</p>
                
                <div className="exact-row">
                  <div className="exact-input-group">
                    <label>Full Name</label>
                    <div className="exact-input-wrapper">
                      <User className="exact-input-icon" size={18} />
                      <input 
                        type="text" 
                        name="fullName"
                        placeholder="Elena Rossi" 
                        value={signupData.fullName}
                        onChange={handleSignupChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="exact-input-group">
                    <label>Company Name</label>
                    <div className="exact-input-wrapper">
                      <User className="exact-input-icon" size={18} />
                      <input 
                        type="text" 
                        name="companyName"
                        placeholder="Elena Rossi" 
                        value={signupData.companyName}
                        onChange={handleSignupChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="exact-input-group">
                  <label>Work Email</label>
                  <div className="exact-input-wrapper">
                    <Mail className="exact-input-icon" size={18} />
                    <input 
                      type="email" 
                      name="workEmail"
                      placeholder="elena@company.com" 
                      value={signupData.workEmail}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>
                </div>

                <div className="exact-input-group">
                  <label>Phone Number (Optional)</label>
                  <div className="exact-input-wrapper">
                    <Phone className="exact-input-icon" size={18} />
                    <input 
                      type="tel" 
                      name="phone"
                      placeholder="+1 (555) 000-0000" 
                      value={signupData.phone}
                      onChange={handleSignupChange}
                    />
                  </div>
                </div>

                <div className="exact-row">
                  <div className="exact-input-group">
                    <label>Password</label>
                    <div className="exact-input-wrapper">
                      <Lock className="exact-input-icon" size={18} />
                      <input 
                        type="password" 
                        name="password"
                        placeholder="••••••••" 
                        value={signupData.password}
                        onChange={handleSignupChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="exact-input-group">
                    <label>Confirm Password</label>
                    <div className="exact-input-wrapper">
                      <RefreshCcw className="exact-input-icon" size={18} />
                      <input 
                        type="password" 
                        name="confirmPassword"
                        placeholder="••••••••" 
                        value={signupData.confirmPassword}
                        onChange={handleSignupChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <label className="exact-checkbox">
                  <input 
                    type="checkbox" 
                    name="agreeTerms"
                    checked={signupData.agreeTerms}
                    onChange={handleSignupChange}
                  />
                  <span>I agree to the <a href="#">Terms & Conditions</a> and <a href="#">Privacy Policy</a></span>
                </label>

                <button type="submit" className="exact-btn" disabled={loading}>
                  {loading ? "Creating..." : "Create Account"}
                </button>
                
                <div className="exact-switch-text">
                  Already have an account? <span onClick={() => setIsLoginTab(true)}>Login</span>
                </div>

                <div className="exact-divider"></div>
                <div className="exact-footer-text">
                  After signup, you can register your company and start<br />managing attendance.
                </div>
              </form>
            )}

            {!isLoginTab && (
              <div className="exact-bottom-link">
                Already registered? <span onClick={() => setIsLoginTab(true)}>Log in to your workspace</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
