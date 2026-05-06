import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  LogOut, User, Bell, Menu, X, 
  LayoutDashboard, Settings, Building2 
} from "lucide-react";
import toast from "react-hot-toast";

const Navbar = () => {
  const { logout, currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  const navLinks = [
    { name: "Dashboard", path: userRole === "admin" ? "/admin" : "/dashboard", icon: LayoutDashboard },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  // If not admin, they might want to register a company or see registration status
  if (userRole !== "admin") {
    navLinks.splice(1, 0, { name: "Register Company", path: "/register-company", icon: Building2 });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className={`premium-navbar-v2 ${isScrolled ? "scrolled" : ""} animate-centered-fade-up`}>
        <div className="navbar-brand" onClick={() => navigate(userRole === "admin" ? "/admin" : "/dashboard")}>
          <div className="brand-icon">
             <Building2 size={20} />
          </div>
          <span className="brand-text">Ethereal Workplace</span>
        </div>

        <div className="nav-links-wrap">
          {navLinks.map((link) => (
            <span
              key={link.path}
              className={`nav-link-v2 ${isActive(link.path) ? "active" : ""}`}
              onClick={() => navigate(link.path)}
            >
              {link.name}
            </span>
          ))}
        </div>

        <div className="navbar-actions">
          <Bell size={20} className="nav-action-icon" onClick={() => navigate("/settings")} />
          
          <div className="nav-user-profile" onClick={() => navigate("/settings")}>
            <div className="user-meta">
              <span className="user-name-short">{currentUser?.email?.split('@')[0]}</span>
              <span className="user-tag">{userRole}</span>
            </div>
            <div className="nav-avatar">
              <User size={18} />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
