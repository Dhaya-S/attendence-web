import { useState, useEffect } from "react";
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
import Navbar from "../components/Navbar";
import {
  Building2, MapPin, Mail, Users, Clock, Check, X,
  Search, Filter, BarChart3, TrendingUp, AlertCircle,
  ChevronRight, Eye, MoreVertical, Download, RefreshCw,
  Shield, CheckCircle2, XCircle, Hourglass, UserCog,
  ChevronDown, ChevronUp, Phone, Globe, Briefcase,
  FileText, Lock,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [companies, setCompanies] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [passwords, setPasswords] = useState({});

  const handlePasswordChange = (companyId, value) => {
    setPasswords(prev => ({ ...prev, [companyId]: value }));
  };

  useEffect(() => {
    const q = query(collection(db, "companies"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const companyList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCompanies(companyList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching companies:", error);
      toast.error("Failed to load companies");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * When admin approves a company:
   * 1. Update company status to "approved"
   * 2. Create a unique companyId-based document under "approved_companies"
   * 3. Set up the manager as a user under that company's subcollection
   * 4. Each company gets isolated subcollections:
   *    - approved_companies/{companyId}/users/
   *    - approved_companies/{companyId}/attendance/
   *    - approved_companies/{companyId}/leave_requests/
   *    - approved_companies/{companyId}/notifications/
   */
  const handleApprove = async (company) => {
    setActionLoading(company.id);
    try {
      const companyId = company.id;
      const managerEmail = company.managerEmail || `manager_${companyId}@placeholder.com`;
      const managerName = company.managerName || "Company Manager";

      const password = passwords[companyId]?.trim() || Math.random().toString(36).slice(-8);

      // Validate password length for Firebase Auth (min 6 chars)
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }

      // 0. Create the manager in Firebase Auth
      let authUid = null;
      const secondaryAppName = `SecondaryApp_${companyId}_${Date.now()}`;
      const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
      const secondaryAuth = getAuth(secondaryApp);
      
      try {
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, managerEmail, password);
        authUid = userCredential.user.uid;
        await signOut(secondaryAuth);
        await deleteApp(secondaryApp);
      } catch (authError) {
        console.warn("Auth creation step failed:", authError);
        await deleteApp(secondaryApp);
        // Only ignore if the user already exists
        if (authError.code !== 'auth/email-already-in-use') {
          throw new Error(`Auth Error: ${authError.message}`);
        }
      }

      // 1. Update 'companies' registration status
      try {
        await updateDoc(doc(db, "companies", companyId), {
          status: "approved",
          approvedAt: serverTimestamp(),
          companyId: companyId,
          authUid: authUid,
        });
      } catch (e) { throw new Error(`Companies Table Error: ${e.message}`); }

      // 2. Create 'approved_companies' document
      try {
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
        });
      } catch (e) { throw new Error(`Approved Companies Error: ${e.message} (Check Firestore Rules)`); }

      // 3. Create manager user record
      try {
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
      } catch (e) { throw new Error(`Manager Record Error: ${e.message}`); }

      // 4. Create 'approved_users' mapping
      try {
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
      } catch (e) { throw new Error(`Global User Mapping Error: ${e.message}`); }

      // 5. Send Welcome Email
      try {
        console.log("Attempting to queue welcome email for:", managerEmail);
        
        // 1. Firebase Mail Extension approach (fallback)
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
                    <p style="margin: 4px 0;"><strong>Password:</strong> <code style="background: #fff; padding: 2px 4px; border-radius: 4px; border: 1px solid #d1d5db;">${password}</code></p>
                  </div>

                  <p>You can now log in to the manager dashboard to start managing your employees and attendance.</p>
                  
                  <div style="text-align: center; margin-top: 32px;">
                    <a href="${window.location.origin}/login" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log In Now</a>
                  </div>
                </div>
                <div style="background-color: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e0e0e0;">
                  <p>© ${new Date().getFullYear()} Attendance System. All rights reserved.</p>
                </div>
              </div>
            `,
          },
        });
        console.log("Email successfully queued in Firestore 'mail' collection.");

      } catch (e) {
        console.error("Failed to process welcome email:", e);
        toast.error("Company approved, but system encountered an issue sending the email. Check Console for details.");
      }

      // 6. Success Notification
      toast.success(
        `${company.companyName} approved successfully! \nManager: ${managerEmail}\nPassword: ${password}`,
        { duration: 10000 }
      );
    } catch (error) {
      console.error("Critical Approval Failure:", error);
      toast.error(error.message, { duration: 6000 });
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
    } catch (error) {
      console.error("Reject error:", error);
      toast.error("Failed to reject company");
    }
    setActionLoading(null);
  };

  const toggleExpand = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesTab = activeTab === "all"
      ? true
      : company.status === activeTab;
    const matchesSearch = company.companyName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      company.officialEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.adminFullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.managerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = {
    total: companies.length,
    pending: companies.filter((c) => c.status === "pending").length,
    approved: companies.filter((c) => c.status === "approved").length,
    rejected: companies.filter((c) => c.status === "rejected").length,
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="app-layout">
      <Navbar />
      <div className="page-content">
        <div className="admin-dashboard">
          {/* Dashboard Header */}
          <div className="dashboard-header">
            <div>
              <h1>Admin Dashboard</h1>
              <p>Manage company registrations and onboarding</p>
            </div>
            <div className="header-actions">
              <button className="btn-icon" title="Refresh">
                <RefreshCw size={16} />
              </button>
              <button className="btn-icon" title="Download Report">
                <Download size={16} />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-card-icon">
                <Building2 size={20} />
              </div>
              <div className="stat-card-content">
                <span className="stat-card-value">{stats.total}</span>
                <span className="stat-card-label">Total Companies</span>
              </div>
            </div>
            <div className="stat-card pending">
              <div className="stat-card-icon">
                <Hourglass size={20} />
              </div>
              <div className="stat-card-content">
                <span className="stat-card-value">{stats.pending}</span>
                <span className="stat-card-label">Pending Review</span>
              </div>
            </div>
            <div className="stat-card approved">
              <div className="stat-card-icon">
                <CheckCircle2 size={20} />
              </div>
              <div className="stat-card-content">
                <span className="stat-card-value">{stats.approved}</span>
                <span className="stat-card-label">Approved</span>
              </div>
            </div>
            <div className="stat-card rejected">
              <div className="stat-card-icon">
                <XCircle size={20} />
              </div>
              <div className="stat-card-content">
                <span className="stat-card-value">{stats.rejected}</span>
                <span className="stat-card-label">Rejected</span>
              </div>
            </div>
          </div>

          {/* Tabs & Search */}
          <div className="dashboard-controls">
            <div className="tab-bar">
              <button
                className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
                onClick={() => setActiveTab("pending")}
              >
                <Hourglass size={14} />
                Pending
                {stats.pending > 0 && <span className="tab-count">{stats.pending}</span>}
              </button>
              <button
                className={`tab-btn ${activeTab === "approved" ? "active" : ""}`}
                onClick={() => setActiveTab("approved")}
              >
                <CheckCircle2 size={14} />
                Approved
                {stats.approved > 0 && <span className="tab-count approved">{stats.approved}</span>}
              </button>
              <button
                className={`tab-btn ${activeTab === "rejected" ? "active" : ""}`}
                onClick={() => setActiveTab("rejected")}
              >
                <XCircle size={14} />
                Rejected
              </button>
              <button
                className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                All
              </button>
            </div>

            <div className="search-bar">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search companies, manager emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Company List */}
          <div className="companies-list">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading companies...</p>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="empty-state">
                <Building2 size={48} />
                <h3>No companies found</h3>
                <p>
                  {activeTab === "pending"
                    ? "No pending applications at the moment."
                    : activeTab === "approved"
                    ? "No approved companies yet."
                    : activeTab === "rejected"
                    ? "No rejected companies."
                    : "No companies registered yet."}
                </p>
              </div>
            ) : (
              filteredCompanies.map((company) => (
                <div key={company.id} className={`company-card status-${company.status}`}>
                  <div className="company-card-main">
                    <div className="company-avatar">
                      <Building2 size={20} />
                    </div>
                    <div className="company-info">
                      <div className="company-name-row">
                        <h3>{company.companyName}</h3>
                        <span className={`status-badge ${company.status}`}>
                          {company.status === "pending" && <Hourglass size={12} />}
                          {company.status === "approved" && <CheckCircle2 size={12} />}
                          {company.status === "rejected" && <XCircle size={12} />}
                          {company.status}
                        </span>
                      </div>
                      <div className="company-meta">
                        <span className="meta-item">
                          <UserIcon size={13} />
                          {company.adminFullName || "N/A"}
                        </span>
                        <span className="meta-item">
                          <Mail size={13} />
                          {company.officialEmail || company.registeredEmail}
                        </span>
                        <span className="meta-item">
                          <MapPin size={13} />
                          {company.location?.city
                            ? `${company.location.city}, ${company.location.state}`
                            : "Location not set"}
                        </span>
                        <span className="meta-item">
                          <Users size={13} />
                          {company.employeeCount || "N/A"} employees
                        </span>
                        <span className="meta-item">
                          <Clock size={13} />
                          {formatDate(company.createdAt)}
                        </span>
                      </div>

                      {/* Manager Info Highlight */}
                      {company.managerEmail && (
                        <div className="manager-highlight">
                          <UserCog size={14} />
                          <span>Manager: <strong>{company.managerName || "N/A"}</strong> — {company.managerEmail}</span>
                        </div>
                      )}
                    </div>

                    <button
                      className="expand-btn"
                      onClick={() => toggleExpand(company.id)}
                      title="View details"
                    >
                      {expandedCard === company.id ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {expandedCard === company.id && (
                    <div className="company-expanded">
                      <div className="expanded-grid">
                        <div className="expanded-item">
                          <Globe size={14} />
                          <span className="expanded-label">Website</span>
                          <span className="expanded-value">{company.website || "N/A"}</span>
                        </div>
                        <div className="expanded-item">
                          <Briefcase size={14} />
                          <span className="expanded-label">Industry</span>
                          <span className="expanded-value">{company.industry || "N/A"}</span>
                        </div>
                        <div className="expanded-item">
                          <Phone size={14} />
                          <span className="expanded-label">Phone</span>
                          <span className="expanded-value">{company.phone || "N/A"}</span>
                        </div>
                        <div className="expanded-item">
                          <Mail size={14} />
                          <span className="expanded-label">Work Email</span>
                          <span className="expanded-value">{company.adminWorkEmail || "N/A"}</span>
                        </div>
                        <div className="expanded-item full-span">
                          <MapPin size={14} />
                          <span className="expanded-label">Full Address</span>
                          <span className="expanded-value">
                            {company.location?.streetAddress
                              ? `${company.location.streetAddress}, ${company.location.city}, ${company.location.state} - ${company.location.pinCode}`
                              : "Not provided"}
                          </span>
                        </div>
                        {company.additionalNotes && (
                          <div className="expanded-item full-span">
                            <FileText size={14} />
                            <span className="expanded-label">Notes</span>
                            <span className="expanded-value">{company.additionalNotes}</span>
                          </div>
                        )}
                        {company.status === "approved" && (
                          <div className="expanded-item full-span approved-info">
                            <Shield size={14} />
                            <span className="expanded-label">Company ID</span>
                            <span className="expanded-value mono">{company.companyId || company.id}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {company.status === "pending" && (
                      <div className="approval-actions-container">
                        <div className="password-setup">
                          <Lock size={14} className="input-icon" />
                          <input
                            type="text"
                            placeholder="Manager password (optional)"
                            value={passwords[company.id] || ""}
                            onChange={(e) => handlePasswordChange(company.id, e.target.value)}
                            className="password-input"
                          />
                        </div>
                        <div className="action-buttons-row">
                          <button
                            className="action-btn approve"
                            onClick={() => handleApprove(company)}
                            disabled={actionLoading === company.id}
                          >
                            {actionLoading === company.id ? (
                              <span className="btn-spinner small"></span>
                            ) : (
                              <>
                                <Check size={14} />
                                Approve
                              </>
                            )}
                          </button>
                          <button
                            className="action-btn reject"
                            onClick={() => handleReject(company.id)}
                            disabled={actionLoading === company.id}
                          >
                            <X size={14} />
                            Reject
                          </button>
                        </div>
                      </div>
                  )}

                  {company.status === "approved" && (
                    <div className="company-actions">
                      <button
                        className="action-btn view"
                        title="View Details"
                        onClick={() => toggleExpand(company.id)}
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// User icon component used in company cards
const UserIcon = ({ size, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default AdminDashboard;
