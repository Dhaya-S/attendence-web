import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  addDoc,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db, firebaseConfig } from "../services/firebase";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  Home, LayoutDashboard, Settings, LogOut,
  Building2, Users, CheckCircle, FileText,
  Clock, CheckCircle2, XCircle, Filter, Download,
  MapPin, ChevronLeft, ChevronRight, Eye, RefreshCw, X, Check, Lock, Save, Shield
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard"); // "home", "dashboard", "settings"
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Modal State
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [managerPassword, setManagerPassword] = useState("");

  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const q = query(collection(db, "companies"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const companyList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCompanies(companyList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  const handleApprove = async (company) => {
    setActionLoading(company.id);
    try {
      const companyId = company.id;
      const managerEmail = company.managerEmail;
      const managerName = company.managerName || company.adminFullName || "Company Manager";

      const automaticPassword = Math.random().toString(36).slice(-8);
      const finalPassword = managerPassword.trim() !== "" 
        ? managerPassword 
        : (company.password || automaticPassword);

      if (finalPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }

      let authUid = null;
      const secondaryAppName = `SecondaryApp_${companyId}_${Date.now()}`;
      const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
      const secondaryAuth = getAuth(secondaryApp);
      
      try {
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, managerEmail, finalPassword);
        authUid = userCredential.user.uid;
        await signOut(secondaryAuth);
        await deleteApp(secondaryApp);
      } catch (authError) {
        console.warn("Auth creation step failed:", authError);
        await deleteApp(secondaryApp);
        if (authError.code !== 'auth/email-already-in-use') {
          throw new Error(`Auth Error: ${authError.message}`);
        }
      }

      await updateDoc(doc(db, "companies", companyId), {
        status: "approved",
        approvedAt: serverTimestamp(),
        companyId: companyId,
        authUid: authUid,
        password: finalPassword
      });

      await setDoc(doc(db, "approved_companies", companyId), {
        companyName: company.companyName || "Unnamed Company",
        officialEmail: company.officialEmail || "",
        phone: company.phone || "",
        industry: company.industry || "",
        website: company.website || "",
        employeeCount: company.employeeCount || "0-10",
        location: company.location || {},
        managerName: managerName,
        managerEmail: managerEmail,
        adminFullName: company.adminFullName || "Admin",
        status: "active",
        approvedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        password: finalPassword,
      });

      const managerDocId = managerEmail.replace(/[.#$/\[\]]/g, "_");
      await setDoc(
        doc(db, "approved_companies", companyId, "users", managerDocId),
        {
          uid: authUid,
          email: managerEmail,
          name: managerName,
          role: "manager",
          status: "approved",
          companyId: companyId,
          joinedAt: serverTimestamp(),
        }
      );

      const normalizedEmail = managerEmail.toLowerCase().trim();
      await setDoc(doc(db, "approved_users", normalizedEmail), {
        uid: authUid,
        companyId: companyId,
        role: "manager",
        email: normalizedEmail,
        name: managerName,
        status: "active",
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, "mail"), {
        to: managerEmail,
        message: {
          subject: `Welcome to Attendance System - ${company.companyName}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #4f46e5; padding: 24px; text-align: center; color: white;">
                <h1 style="margin: 0;">Welcome to the Platform!</h1>
              </div>
              <div style="padding: 24px; color: #374151; line-height: 1.6;">
                <p>Hello <strong>${managerName}</strong>,</p>
                <p>Your company registration for <strong>${company.companyName}</strong> has been approved by our administrators.</p>
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 24px 0;">
                  <h3 style="margin-top: 0; color: #111827;">Your Login Credentials</h3>
                  <p style="margin: 4px 0;"><strong>Email:</strong> ${managerEmail}</p>
                  <p style="margin: 4px 0;"><strong>Password:</strong> ${finalPassword}</p>
                </div>
                <p>You can now log in to the manager dashboard to start managing your employees and attendance.</p>
                <div style="text-align: center; margin-top: 32px;">
                  <a href="${window.location.origin}/login" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log In Now</a>
                </div>
              </div>
            </div>
          `,
        },
      });

      toast.success(`${company.companyName} approved successfully!`);
      setManagerPassword("");
      setSelectedCompany(null);
    } catch (error) {
      console.error("Critical Approval Failure:", error);
      toast.error(error.message);
    }
    setActionLoading(null);
  };

  const handleReject = async (companyId) => {
    setActionLoading(companyId);
    try {
      await updateDoc(doc(db, "companies", companyId), {
        status: "rejected",
        rejectedAt: serverTimestamp(),
      });
      toast.success("Company rejected");
      setSelectedCompany(null);
    } catch (error) {
      console.error("Reject error:", error);
      toast.error("Failed to reject company");
    }
    setActionLoading(null);
  };

  // Status Counts
  const stats = {
    total: companies.length,
    pending: companies.filter(c => c.status === "pending").length,
    approved: companies.filter(c => c.status === "approved").length,
    rejected: companies.filter(c => c.status === "rejected").length,
  };

  const activeCompanies = stats.approved;
  const totalEmployees = companies.reduce((acc, c) => {
    const num = parseInt(c.employeeCount) || 0;
    return acc + num;
  }, 0);

  // Component Renders
  const renderHome = () => (
    <div className="admin-content animate-fade-in">
      <div className="admin-header">
        <div>
          <h1 className="admin-page-title">Admin Dashboard</h1>
          <p className="admin-page-subtitle">Monitor companies, employees, and platform activity</p>
        </div>
        <button className="admin-btn-outline">
          <Download size={16} /> Export Report
        </button>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-card-header">
            <div className="stat-icon purple"><Building2 size={18} /></div>
            <div className="stat-badge positive">+12%</div>
          </div>
          <h2 className="stat-value">{stats.total}</h2>
          <p className="stat-label">TOTAL COMPANIES</p>
        </div>
        
        <div className="admin-stat-card">
          <div className="stat-card-header">
            <div className="stat-icon blue"><Users size={18} /></div>
            <div className="stat-badge positive">+5.4%</div>
          </div>
          <h2 className="stat-value">{totalEmployees.toLocaleString()}</h2>
          <p className="stat-label">TOTAL EMPLOYEES</p>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-header">
            <div className="stat-icon dark-purple"><CheckCircle size={18} /></div>
            <div className="stat-target">Target: 100</div>
          </div>
          <h2 className="stat-value">{activeCompanies}</h2>
          <p className="stat-label">ACTIVE COMPANIES</p>
        </div>
      </div>

      <div className="admin-chart-card">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Company Growth</h3>
            <p className="chart-subtitle">Active subscription trend over 6 months</p>
          </div>
          <div className="chart-toggles">
            <button className="chart-toggle">Month</button>
            <button className="chart-toggle active">Week</button>
          </div>
        </div>
        <div className="chart-body">
          {/* Mock CSS Bar Chart to match image */}
          <div className="mock-chart">
            <div className="chart-bar"><div className="bar-fill" style={{ height: '40%' }}></div></div>
            <div className="chart-bar"><div className="bar-fill" style={{ height: '55%' }}></div></div>
            <div className="chart-bar"><div className="bar-fill" style={{ height: '35%' }}></div></div>
            <div className="chart-bar"><div className="bar-fill" style={{ height: '70%' }}></div></div>
            <div className="chart-bar"><div className="bar-fill" style={{ height: '45%' }}></div></div>
            <div className="chart-bar"><div className="bar-fill" style={{ height: '85%' }}></div></div>
            <div className="chart-bar"><div className="bar-fill active" style={{ height: '100%' }}></div></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="admin-content animate-fade-in">
      <div className="admin-header">
        <div>
          <h1 className="admin-page-title">Welcome Back, Admin</h1>
          <p className="admin-page-subtitle">Monitor and manage company onboarding requests with precision.</p>
        </div>
      </div>

      <div className="admin-stats-grid four-cols">
        <div className="admin-stat-card">
          <div className="stat-card-header">
            <div className="stat-icon purple"><FileText size={18} /></div>
            <div className="stat-badge positive">+12%</div>
          </div>
          <p className="stat-label-top">Total Applications</p>
          <h2 className="stat-value">{stats.total}</h2>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-header">
            <div className="stat-icon pink"><Clock size={18} /></div>
            <div className="stat-toggle-switch"></div>
          </div>
          <p className="stat-label-top">Pending Reviews</p>
          <h2 className="stat-value">{stats.pending}</h2>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-header">
            <div className="stat-icon gray"><CheckCircle2 size={18} /></div>
          </div>
          <p className="stat-label-top">Approved Companies</p>
          <h2 className="stat-value">{stats.approved}</h2>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-header">
            <div className="stat-icon red"><XCircle size={18} /></div>
          </div>
          <p className="stat-label-top">Rejected Applications</p>
          <h2 className="stat-value">{stats.rejected}</h2>
        </div>
      </div>

      <div className="admin-table-card">
        <div className="table-header">
          <div>
            <h3 className="table-title">Recent Applications</h3>
            <p className="table-subtitle">Review and action the latest incoming requests</p>
          </div>
          <div className="table-actions">
            <button className="admin-btn-gray"><Filter size={14} /> Filter</button>
            <button className="admin-btn-gray"><Download size={14} /> Export</button>
          </div>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>COMPANY NAME</th>
                <th>CONTACT PERSON</th>
                <th>EMPLOYEES</th>
                <th>LOCATION</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {companies.slice(0, 10).map((company) => {
                const initials = company.companyName?.substring(0, 2).toUpperCase() || "C";
                return (
                  <tr key={company.id}>
                    <td>
                      <div className="table-cell-company">
                        <div className="company-avatar">{initials}</div>
                        <div>
                          <div className="company-name-bold">{company.companyName}</div>
                          <div className="company-subtext">{company.website || "No website"}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="contact-name">{company.adminFullName || company.managerName}</div>
                        <div className="contact-email">{company.officialEmail || company.managerEmail}</div>
                      </div>
                    </td>
                    <td>
                      <div className="employee-badge">{company.employeeCount || "N/A"}</div>
                    </td>
                    <td>
                      <div className="location-cell">
                        <MapPin size={14} className="loc-icon" />
                        <span>{company.location?.city || "Remote"}</span>
                      </div>
                    </td>
                    <td>
                      <div className={`status-pill ${company.status}`}>
                        <span className="dot"></span>
                        {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                      </div>
                    </td>
                    <td>
                      <button 
                        className="view-btn"
                        onClick={() => setSelectedCompany(company)}
                      >
                        <span className="view-dot"></span> View Application
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          <div className="table-pagination">
            <span className="pagination-info">Showing 1-{Math.min(companies.length, 10)} of {companies.length} results</span>
            <div className="pagination-controls">
              <button className="page-btn"><ChevronLeft size={16}/></button>
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
              <button className="page-btn"><ChevronRight size={16}/></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const [settingsForm, setSettingsForm] = useState({
    platformName: "Ethereal Workplace",
    supportEmail: "support@ethereal.com",
    sessionTimeout: "30",
    emailAlerts: true,
    weeklyReports: true,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    // Fetch existing settings
    import('firebase/firestore').then(({ doc, getDoc }) => {
      const fetchSettings = async () => {
        try {
          const settingsRef = doc(db, "system_config", "admin_settings");
          const settingsSnap = await getDoc(settingsRef);
          if (settingsSnap.exists()) {
            setSettingsForm(prev => ({ ...prev, ...settingsSnap.data() }));
          }
        } catch (error) {
          console.error("Error fetching settings:", error);
        }
      };
      fetchSettings();
    });
  }, []);

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettingsForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const settingsRef = doc(db, "system_config", "admin_settings");
      await setDoc(settingsRef, {
        ...settingsForm,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const renderSettings = () => (
    <div className="admin-content animate-fade-in">
      <div className="admin-header">
        <div>
          <h1 className="admin-page-title">Platform Settings</h1>
          <p className="admin-page-subtitle">Configure global preferences and system behavior</p>
        </div>
        <button 
          className="modal-btn-approve" 
          onClick={handleSaveSettings}
          disabled={savingSettings}
          style={{ width: 'auto', padding: '10px 24px', opacity: savingSettings ? 0.7 : 1 }}
        >
          <Save size={18} /> {savingSettings ? "Saving..." : "Save Changes"}
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* General Settings */}
        <div className="admin-stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
            <Building2 size={18} style={{ color: '#7664f5' }}/> General Configuration
          </h3>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#64748B', marginBottom: '8px' }}>Platform Name</label>
            <input 
              type="text" 
              name="platformName"
              className="modal-password-input" 
              style={{ marginTop: 0 }} 
              value={settingsForm.platformName}
              onChange={handleSettingChange}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#64748B', marginBottom: '8px' }}>Support Email Contact</label>
            <input 
              type="email" 
              name="supportEmail"
              className="modal-password-input" 
              style={{ marginTop: 0 }} 
              value={settingsForm.supportEmail}
              onChange={handleSettingChange}
            />
          </div>
        </div>

        {/* Security & Notifications */}
        <div className="admin-stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
            <Shield size={18} style={{ color: '#10b981' }}/> Security & Alerts
          </h3>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#64748B', marginBottom: '8px' }}>Session Timeout (Minutes)</label>
            <select 
              name="sessionTimeout"
              className="modal-password-input" 
              style={{ marginTop: 0 }}
              value={settingsForm.sessionTimeout}
              onChange={handleSettingChange}
            >
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes</option>
              <option value="60">1 Hour</option>
              <option value="120">2 Hours</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1A1D27' }}>New Application Alerts</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Receive email when new company registers</div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px' }}>
              <input 
                type="checkbox" 
                name="emailAlerts"
                style={{ opacity: 0, width: 0, height: 0 }} 
                checked={settingsForm.emailAlerts}
                onChange={handleSettingChange}
              />
              <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: settingsForm.emailAlerts ? '#7664f5' : '#CBD5E1', transition: '.4s', borderRadius: '24px' }}>
                <span style={{ position: 'absolute', content: '""', height: '16px', width: '16px', left: settingsForm.emailAlerts ? '20px' : '4px', bottom: '4px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1A1D27' }}>Weekly Summary Reports</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Send platform statistics to admin email</div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px' }}>
              <input 
                type="checkbox" 
                name="weeklyReports"
                style={{ opacity: 0, width: 0, height: 0 }} 
                checked={settingsForm.weeklyReports}
                onChange={handleSettingChange}
              />
              <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: settingsForm.weeklyReports ? '#7664f5' : '#CBD5E1', transition: '.4s', borderRadius: '24px' }}>
                <span style={{ position: 'absolute', content: '""', height: '16px', width: '16px', left: settingsForm.weeklyReports ? '20px' : '4px', bottom: '4px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #F7F8FA;
          font-family: 'Inter', sans-serif;
          color: #1A1D27;
        }

        /* Sidebar Styles */
        .admin-sidebar {
          width: 260px;
          background: white;
          border-right: 1px solid #EAECEF;
          padding: 24px 0;
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          z-index: 10;
        }

        .sidebar-brand {
          padding: 0 24px;
          margin-bottom: 40px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 700;
          font-size: 18px;
          color: #1A1D27;
        }
        
        .brand-icon {
          width: 32px;
          height: 32px;
          background: #7664f5;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 0 16px;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 500;
          color: #64748B;
          transition: all 0.2s;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
          font-size: 14px;
        }

        .nav-item:hover {
          background: #F3F4F6;
          color: #1A1D27;
        }

        .nav-item.active {
          background: #7664f5;
          color: white;
        }

        .sidebar-footer {
          padding: 16px;
          margin-top: auto;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 500;
          color: #EF4444;
          transition: all 0.2s;
          border: none;
          background: rgba(239, 68, 68, 0.05);
          width: 100%;
          font-size: 14px;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        /* Main Content Area */
        .admin-main {
          flex: 1;
          margin-left: 260px;
          padding: 40px;
          max-width: 1400px;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 32px;
        }

        .admin-page-title {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }

        .admin-page-subtitle {
          color: #64748B;
          font-size: 14px;
        }

        .admin-btn-outline {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border: 1px solid #E2E8F0;
          background: white;
          border-radius: 100px;
          font-weight: 500;
          font-size: 13px;
          cursor: pointer;
          color: #1A1D27;
          transition: all 0.2s;
        }

        .admin-btn-outline:hover {
          background: #F8FAFC;
        }

        /* Stats Grid */
        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }

        .admin-stats-grid.four-cols {
          grid-template-columns: repeat(4, 1fr);
        }

        .admin-stat-card {
          background: white;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
        }

        .stat-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon.purple { background: #F0EEFE; color: #7664f5; }
        .stat-icon.blue { background: #EBF3FE; color: #3B82F6; }
        .stat-icon.dark-purple { background: #EFEFFA; color: #5B4DE3; }
        .stat-icon.pink { background: #FDF2F8; color: #EC4899; }
        .stat-icon.gray { background: #F1F5F9; color: #475569; }
        .stat-icon.red { background: #FEF2F2; color: #EF4444; }

        .stat-badge {
          background: #ECFDF5;
          color: #10B981;
          padding: 4px 8px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
        }

        .stat-target {
          font-size: 12px;
          color: #64748B;
          font-weight: 500;
        }

        .stat-toggle-switch {
          width: 36px;
          height: 20px;
          background: #CBD5E1;
          border-radius: 10px;
          position: relative;
        }
        .stat-toggle-switch::after {
          content: '';
          position: absolute;
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          top: 2px;
          left: 2px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 4px;
          color: #1A1D27;
        }

        .stat-label {
          font-size: 11px;
          font-weight: 600;
          color: #64748B;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .stat-label-top {
          font-size: 13px;
          font-weight: 500;
          color: #64748B;
          margin-bottom: 8px;
        }

        /* Chart Card */
        .admin-chart-card {
          background: white;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
        }

        .chart-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .chart-subtitle {
          font-size: 13px;
          color: #64748B;
        }

        .chart-toggles {
          display: flex;
          background: #F1F5F9;
          border-radius: 100px;
          padding: 4px;
        }

        .chart-toggle {
          padding: 6px 16px;
          border: none;
          background: transparent;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 500;
          color: #64748B;
          cursor: pointer;
        }

        .chart-toggle.active {
          background: #7664f5;
          color: white;
        }

        .chart-body {
          height: 240px;
          display: flex;
          align-items: flex-end;
          position: relative;
        }

        .mock-chart {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          width: 100%;
          height: 100%;
          gap: 12px;
        }

        .chart-bar {
          flex: 1;
          height: 100%;
          display: flex;
          align-items: flex-end;
        }

        .bar-fill {
          width: 100%;
          background: #D5D1FC;
          border-radius: 16px 16px 0 0;
          transition: all 0.3s;
        }

        .bar-fill.active {
          background: #7664f5;
        }

        /* Table Card */
        .admin-table-card {
          background: white;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .table-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .table-subtitle {
          font-size: 13px;
          color: #64748B;
        }

        .table-actions {
          display: flex;
          gap: 12px;
        }

        .admin-btn-gray {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
        }

        .admin-table th {
          text-align: left;
          padding: 16px;
          font-size: 11px;
          font-weight: 600;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 1px;
          background: #F8FAFC;
          border-bottom: 1px solid #E2E8F0;
        }

        .admin-table th:first-child { border-radius: 8px 0 0 8px; }
        .admin-table th:last-child { border-radius: 0 8px 8px 0; }

        .admin-table td {
          padding: 20px 16px;
          border-bottom: 1px solid #F1F5F9;
          vertical-align: middle;
        }

        .table-cell-company {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .company-avatar {
          width: 40px;
          height: 40px;
          background: #F0EEFE;
          color: #7664f5;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
        }

        .company-name-bold {
          font-weight: 600;
          font-size: 14px;
          color: #1A1D27;
        }

        .company-subtext {
          font-size: 12px;
          color: #64748B;
          margin-top: 2px;
        }

        .contact-name {
          font-weight: 500;
          font-size: 14px;
          color: #1A1D27;
        }

        .contact-email {
          font-size: 12px;
          color: #64748B;
          margin-top: 2px;
        }

        .employee-badge {
          display: inline-block;
          padding: 4px 10px;
          background: #F1F5F9;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 500;
          color: #475569;
        }

        .location-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #64748B;
          font-size: 13px;
        }

        .loc-icon {
          color: #7664f5;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-pill .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .status-pill.pending {
          background: #FEF9C3;
          color: #A16207;
        }
        .status-pill.pending .dot { background: #EAB308; }

        .status-pill.approved {
          background: #DCFCE7;
          color: #15803D;
        }
        .status-pill.approved .dot { background: #22C55E; }

        .status-pill.rejected {
          background: #FEE2E2;
          color: #B91C1C;
        }
        .status-pill.rejected .dot { background: #EF4444; }

        .view-btn {
          background: #F0EEFE;
          color: #7664f5;
          border: none;
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .view-btn:hover {
          background: #E4E0FD;
        }

        .view-dot {
          width: 6px;
          height: 6px;
          background: #7664f5;
          border-radius: 50%;
        }

        .table-pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 24px;
        }

        .pagination-info {
          font-size: 13px;
          color: #64748B;
        }

        .pagination-controls {
          display: flex;
          gap: 4px;
        }

        .page-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: #475569;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }

        .page-btn.active {
          background: #7664f5;
          color: white;
        }

        .page-btn:hover:not(.active) {
          background: #F1F5F9;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-content {
          background: white;
          border-radius: 24px;
          padding: 32px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .modal-title {
          font-size: 20px;
          font-weight: 700;
        }

        .modal-close {
          background: transparent;
          border: none;
          color: #64748B;
          cursor: pointer;
        }

        .modal-body {
          margin-bottom: 24px;
        }

        .modal-detail-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #F1F5F9;
          font-size: 14px;
        }

        .modal-detail-label {
          color: #64748B;
          font-weight: 500;
        }

        .modal-detail-value {
          font-weight: 600;
          color: #1A1D27;
        }

        .modal-password-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          margin-top: 16px;
          font-size: 14px;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
        }

        .modal-btn-reject {
          flex: 1;
          padding: 12px;
          background: #FEF2F2;
          color: #EF4444;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .modal-btn-approve {
          flex: 1;
          padding: 12px;
          background: #7664f5;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .settings-placeholder-card {
          background: white;
          border-radius: 24px;
          padding: 60px;
          text-align: center;
          color: #64748B;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          margin-top: 24px;
        }

        .settings-icon-large {
          margin-bottom: 16px;
          color: #CBD5E1;
        }

      `}</style>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="sidebar-brand">
            <div className="brand-icon"><Building2 size={18} /></div>
            Admin Portal
          </div>
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === "home" ? "active" : ""}`}
              onClick={() => setActiveTab("home")}
            >
              <Home size={18} /> Home Overview
            </button>
            <button 
              className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <LayoutDashboard size={18} /> Applications
            </button>
            <button 
              className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <Settings size={18} /> Settings
            </button>
          </nav>
          <div className="sidebar-footer">
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={18} /> Logout
            </button>
          </div>
        </aside>

        <main className="admin-main">
          {activeTab === "home" && renderHome()}
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "settings" && renderSettings()}
        </main>

        {/* Action Modal */}
        {selectedCompany && (
          <div className="modal-overlay" onClick={() => { setSelectedCompany(null); setManagerPassword(""); }}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Application Details</h3>
                <button className="modal-close" onClick={() => { setSelectedCompany(null); setManagerPassword(""); }}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="modal-detail-row">
                  <span className="modal-detail-label">Company</span>
                  <span className="modal-detail-value">{selectedCompany.companyName}</span>
                </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">Applicant</span>
                  <span className="modal-detail-value">{selectedCompany.adminFullName || selectedCompany.managerName}</span>
                </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">Manager Mail ID</span>
                  <span className="modal-detail-value">{selectedCompany.managerEmail}</span>
                </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">Phone Number</span>
                  <span className="modal-detail-value">{selectedCompany.phone || "Not Provided"}</span>
                </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">Registered Password</span>
                  <span className="modal-detail-value">{selectedCompany.password || "Not Provided (Will generate automatic password)"}</span>
                </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">Status</span>
                  <span className={`status-pill ${selectedCompany.status}`}>
                    <span className="dot"></span>
                    {selectedCompany.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              {selectedCompany.status === 'pending' && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#64748B', marginBottom: '8px' }}>Assign Custom Password (Optional)</label>
                  <input
                    type="text"
                    className="modal-password-input"
                    placeholder="Leave empty to use registered or automatic password"
                    value={managerPassword}
                    onChange={(e) => setManagerPassword(e.target.value)}
                    style={{ marginTop: 0 }}
                  />
                </div>
              )}

              {selectedCompany.status === 'pending' && (
                <div className="modal-actions">
                  <button 
                    className="modal-btn-reject"
                    onClick={() => handleReject(selectedCompany.id)}
                    disabled={actionLoading === selectedCompany.id}
                  >
                    {actionLoading === selectedCompany.id ? <RefreshCw className="spinner" size={18} /> : <X size={18} />} Reject
                  </button>
                  <button 
                    className="modal-btn-approve"
                    onClick={() => handleApprove(selectedCompany)}
                    disabled={actionLoading === selectedCompany.id}
                  >
                    {actionLoading === selectedCompany.id ? <RefreshCw className="spinner" size={18} /> : <Check size={18} />} Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;
