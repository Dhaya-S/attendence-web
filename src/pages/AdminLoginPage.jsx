import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";
import { Briefcase, Mail, Lock, Shield, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import "../index.css";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();

  useEffect(() => {
    // If already logged in as admin, redirect to admin dashboard
    if (currentUser && userRole === "admin") {
      navigate("/admin");
    }
  }, [currentUser, userRole, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if it's an Admin trying to login
      const adminDoc = await getDoc(doc(db, "admin_users", userCred.user.uid));
      if (adminDoc.exists() && adminDoc.data().role === "admin") {
        toast.success("Admin Login successful!");
        navigate("/home");
      } else {
        toast.error("Access denied. You do not have admin privileges.");
        // Sign out if not admin
        await auth.signOut();
      }
    } catch (error) {
      toast.error(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#f1f5f9',
      padding: '40px'
    }}>
      <div className="auth-container admin-auth" style={{ 
        width: '100%', 
        maxWidth: '520px',
        background: 'white',
        padding: '60px',
        borderRadius: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e2e8f0'
      }}>
        <div className="auth-card">
          <div className="auth-header" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="auth-icon-wrapper admin-icon" style={{ 
              width: '80px', 
              height: '80px', 
              background: '#eff6ff', 
              color: '#3b82f6', 
              borderRadius: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <Shield size={40} />
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>Admin Portal</h2>
            <p className="auth-subtitle" style={{ color: '#64748b', fontSize: '16px' }}>Secure entry for system administrators only</p>
          </div>

          <form className="auth-form" onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '15px', fontWeight: '700', color: '#334155', marginBottom: '10px' }}>Email Address</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <Mail size={22} className="input-icon" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email"
                  placeholder="admin@ethereal.work"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '16px 16px 16px 52px', 
                    borderRadius: '12px', 
                    border: '1px solid #cbd5e1',
                    fontSize: '17px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '15px', fontWeight: '700', color: '#334155', marginBottom: '10px' }}>Password</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <Lock size={22} className="input-icon" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '16px 16px 16px 52px', 
                    borderRadius: '12px', 
                    border: '1px solid #cbd5e1',
                    fontSize: '17px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary auth-submit admin-submit"
              disabled={loading}
              style={{ 
                padding: '18px', 
                fontSize: '17px', 
                fontWeight: '700',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '10px',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.4)'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
              onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
            >
              {loading ? (
                <div className="spinner-sm"></div>
              ) : (
                <>
                  <Shield size={20} style={{ marginRight: '10px' }} />
                  Sign In to System Control
                </>
              )}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '48px', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '32px' }}>
            <p style={{ fontSize: '16px', color: '#64748b' }}>
              Not an administrator?{" "}
              <button
                type="button"
                className="text-btn"
                onClick={() => navigate("/login")}
                style={{ 
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Exit to User Portal
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
