import React from 'react';
import { useNavigate } from "react-router-dom";
import { Settings as SettingsIcon, Bell, Lock, User, Shield, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from "../contexts/AuthContext";

const Settings = () => {
  const navigate = useNavigate();
  const { logout, currentUser, userRole } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="premium-page" style={{ paddingBottom: '80px' }}>
      {/* Navigation */}
      <header className="premium-navbar-v2 animate-centered-fade-up">
        <div className="navbar-brand" style={{ cursor: 'pointer' }} onClick={() => navigate(userRole === "admin" ? "/admin" : "/dashboard")}>
          <ArrowLeft size={16} style={{ marginRight: '8px' }} />
          <span className="brand-text">Account Settings</span>
        </div>
        <div className="navbar-actions">
           <button className="btn-shimmer" style={{ padding: '8px 20px', fontSize: '12px' }} onClick={() => navigate(userRole === "admin" ? "/admin" : "/dashboard")}>
              Exit to Dashboard
           </button>
        </div>
      </header>

      <div className="features-container" style={{ marginTop: '60px', maxWidth: '800px' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ color: '#1e293b', fontSize: '40px', fontWeight: '800', marginBottom: '8px' }}>Settings</h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>Manage your account preferences and security protocols.</p>
        </div>

        {/* Profile Card */}
        <div className="premium-card-v3 animate-fade-up delay-1" style={{ padding: '40px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '32px', background: 'var(--premium-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '32px', boxShadow: '0 10px 25px var(--primary-glow)' }}>
            <User size={48} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 4px', color: '#1e293b' }}>{currentUser?.email?.split('@')[0] || "User Profile"}</h2>
            <p style={{ color: '#64748b', margin: '0 0 20px', fontSize: '16px', fontWeight: '500' }}>{currentUser?.email || "user@company.com"}</p>
            <button className="btn-shimmer" style={{ padding: '10px 24px', fontSize: '13px' }}>Edit Enterprise Profile</button>
          </div>
        </div>

        {/* Links Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { icon: <User size={24} />, title: 'Personal Information', desc: 'Update your name, contact details, and role' },
            { icon: <Lock size={24} />, title: 'Security & Authentication', desc: 'Change password, manage 2FA and active sessions' },
            { icon: <Bell size={24} />, title: 'Notification Preferences', desc: 'Configure email and push notification alerts' },
            { icon: <Shield size={24} />, title: 'Privacy Settings', desc: 'Manage data visibility and connected apps' },
          ].map((item, i) => (
            <div key={i} className={`premium-card-v3 animate-fade-up delay-${i + 1}`} style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '24px', cursor: 'pointer' }}>
              <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '16px', borderRadius: '20px', display: 'flex' }}>
          {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px' }}>{item.title}</h3>
                <p style={{ color: '#64748b', fontSize: '14px', margin: 0, fontWeight: '500' }}>{item.desc}</p>
              </div>
            </div>
          ))}

          {/* Logout Button */}
          <div className="premium-card-v3 animate-fade-up delay-4" style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '24px', cursor: 'pointer', border: '1px solid #fee2e2' }} onClick={handleLogout}>
            <div style={{ background: '#fee2e2', color: '#ef4444', padding: '16px', borderRadius: '20px', display: 'flex' }}>
              <LogOut size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#ef4444', margin: '0 0 4px' }}>Terminate Session</h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0, fontWeight: '500' }}>Securely log out of your account on this device</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
