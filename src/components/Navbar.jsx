import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, Bell, User, LayoutDashboard, Building2, Settings } from "lucide-react";

const Navbar = () => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand" onClick={() => navigate(userRole === "admin" ? "/admin" : "/dashboard")}>
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="brand-text">Ethereal Workplace</span>
        </div>

        <div className="navbar-links">
          <a
            className={`nav-link ${isActive("/home") ? "active" : ""}`}
            onClick={() => navigate("/home")}
          >
            Home
          </a>
          {userRole === "admin" && (
            <>
              <a
                className={`nav-link ${isActive("/admin") ? "active" : ""}`}
                onClick={() => navigate("/admin")}
              >
                Dashboard
              </a>
            </>
          )}
          {userRole === "user" && (
            <>
              <a
                className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </a>
            </>
          )}
          <a 
            className={`nav-link ${isActive("/settings") ? "active" : ""}`}
            onClick={() => navigate("/settings")}
          >
            Settings
          </a>
        </div>

        <div className="navbar-actions">
          <button className="nav-icon-btn" title="Notifications">
            <Bell size={18} />
            <span className="notification-dot"></span>
          </button>
          <div className="nav-user-info">
            <div className="nav-avatar">
              <User size={16} />
            </div>
            <span className="nav-email">{currentUser?.email?.split("@")[0]}</span>
          </div>
          <button className="nav-logout-btn" onClick={handleLogout} title="Sign Out">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
