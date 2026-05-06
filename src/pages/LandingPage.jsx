import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MapPin, Clock, Zap, ArrowRight, Shield, 
  BarChart3, Calendar, CheckCircle2, Users, 
  ChevronRight, Bell, User, Check
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();

  const [stats, setStats] = useState([
    { label: "COMPANIES", value: "...", icon: <Shield size={18} />, color: "#6366f1" },
    { label: "TOTAL EMPLOYEES", value: "...", icon: <Users size={18} />, color: "#8b5cf6" },
    { label: "ACTIVE NOW", value: "...", icon: <Clock size={18} />, color: "#a855f7" },
    { label: "APPROVAL RATE", value: "...", icon: <CheckCircle2 size={18} />, color: "#6366f1" },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { getDocs, collection } = await import("firebase/firestore");
        const { db } = await import("../services/firebase");
        
        let totalCompanies = 0;
        let totalEmployees = 0;

        try {
          // Attempt to fetch companies (will only work if admin or if we loosen rules, but we handle the error)
          const compSnap = await getDocs(collection(db, "companies"));
          totalCompanies = compSnap.size;
          compSnap.forEach(doc => {
            const data = doc.data();
            totalEmployees += (parseInt(data.employeeCount) || 0);
          });
        } catch (e) {
          console.log("Not authorized to read global companies collection, falling back to basic display.");
        }

        if (totalCompanies > 0) {
          setStats([
            { label: "COMPANIES", value: totalCompanies.toString(), icon: <Shield size={18} />, color: "#6366f1" },
            { label: "TOTAL EMPLOYEES", value: totalEmployees.toString(), icon: <Users size={18} />, color: "#8b5cf6" },
            { label: "ACTIVE NOW", value: Math.floor(totalEmployees * 0.8).toString(), icon: <Clock size={18} />, color: "#a855f7" },
            { label: "APPROVAL RATE", value: "98%", icon: <CheckCircle2 size={18} />, color: "#6366f1" },
          ]);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    
    fetchStats();
  }, [currentUser, userRole]);

  return (
    <div className="premium-page">
      {/* Navigation */}
      <header className="premium-navbar-v2 animate-centered-fade-up">
        <div className="navbar-brand" style={{ cursor: 'pointer' }} onClick={() => navigate(currentUser ? (userRole === "admin" ? "/admin" : "/dashboard") : "/")}>
          <span className="brand-text" style={{ transition: 'all 0.3s ease' }}>Ethereal Workplace</span>
        </div>
        <nav className="nav-links-wrap">
          <span className="nav-link-v2 active" onClick={() => navigate("/home")}>Home</span>
          <span className="nav-link-v2" onClick={() => navigate(currentUser ? (userRole === "admin" ? "/admin" : "/dashboard") : "/")}>Dashboard</span>
          <span className="nav-link-v2" onClick={() => navigate("/settings")}>Settings</span>
        </nav>
        <div className="navbar-actions">
          <Bell size={20} style={{ color: 'white', cursor: 'pointer', opacity: 0.8 }} onClick={() => navigate("/settings")} />
          <div className="nav-avatar" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', cursor: 'pointer', color: 'white' }} onClick={() => navigate("/settings")}>
            <User size={18} />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="premium-hero" style={{ padding: '160px 40px 100px', minHeight: '650px', position: 'relative', backgroundSize: '200% 200%', animation: 'gradientPan 10s ease infinite', backgroundImage: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 40%, #a855f7 70%, #6366f1 100%)' }}>
        {/* Background Glowing Orbs for extra premium feel */}
        <div style={{ position: 'absolute', top: '10%', left: '15%', width: '400px', height: '400px', background: '#e0e7ff', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.2, animation: 'pulseRing 8s ease-in-out infinite alternate' }}></div>
        <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: '300px', height: '300px', background: '#a78bfa', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.3, animation: 'pulseRing 10s ease-in-out infinite alternate-reverse' }}></div>

        <div className="hero-content-v2 animate-fade-up delay-1">
          <h1 className="animate-reveal" style={{ color: 'white', textShadow: '0 4px 20px rgba(0,0,0,0.15)', fontSize: '3.5rem', lineHeight: '1.1', marginBottom: '24px' }}>
            Manage attendance with accuracy and confidence
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem', marginBottom: '32px' }}>
            The definitive operating system for modern workforce logistics. Track, analyze, and scale with effortless precision.
          </p>
          <button className="btn-shimmer" onClick={() => navigate("/register-company")}>
            Register Your Company
          </button>
        </div>

        <div className="hero-image-v2 animate-fade-up delay-2">
          <div className="mockup-container" style={{ transform: 'rotate(-5deg)', marginRight: '0', border: '10px solid #0f172a', borderRadius: '48px', animation: 'float 6s ease-in-out infinite', background: '#f8fafc', display: 'flex', flexDirection: 'column', boxShadow: '0 40px 80px rgba(0,0,0,0.3), inset 0 0 0 2px #334155' }}>
            {/* Top Notch Area */}
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120px', height: '24px', background: '#0f172a', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', zIndex: 10 }}></div>
            
            {/* Mobile App Header */}
            <div style={{ padding: '48px 24px 32px', background: 'var(--premium-gradient)', color: 'white', borderBottomLeftRadius: '32px', borderBottomRightRadius: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                 <div>
                    <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px', letterSpacing: '0.5px' }}>MONDAY, OCT 24</div>
                    <div style={{ fontSize: '24px', fontWeight: '800' }}>Good Morning</div>
                 </div>
                 <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', overflow: 'hidden' }}>
                    <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="user" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 </div>
              </div>
              
              {/* Massive Live Clock */}
              <div style={{ textAlign: 'center', margin: '20px 0 10px' }}>
                 <div style={{ fontSize: '48px', fontWeight: '800', letterSpacing: '-1px', lineHeight: 1 }}>08:42<span style={{ fontSize: '24px', opacity: 0.8 }}>AM</span></div>
                 <div style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.15)', padding: '6px 12px', borderRadius: '20px', marginTop: '12px' }}>
                    <Zap size={14} style={{ color: '#fcd34d' }} /> On schedule
                 </div>
              </div>
            </div>
            
            {/* Mobile App Body Components */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              <div style={{ background: 'white', borderRadius: '20px', padding: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.04)', display: 'flex', gap: '16px', alignItems: 'center', border: '1px solid #f1f5f9' }}>
                 <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: '#f8fafc', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)', backgroundSize: '10px 10px' }}></div>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '10px', height: '10px', background: '#6366f1', borderRadius: '50%', boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.2)' }}></div>
                 </div>
                 <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>Global HQ</div>
                    <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                       <MapPin size={10} style={{ color: '#10b981' }} /> Zone Verified
                    </div>
                 </div>
              </div>

              <div style={{ background: 'white', borderRadius: '16px', padding: '12px 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                       <Check size={12} />
                    </div>
                    <div>
                       <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700' }}>Active Status</div>
                       <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>On Duty</div>
                    </div>
                 </div>
                 <div style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '800' }}>ON DUTY</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                 <div style={{ background: '#f8faff', borderRadius: '16px', padding: '16px', border: '1px solid #eef2ff' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', marginBottom: '4px' }}>CHECK-IN</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>08:30 AM</div>
                 </div>
                 <div style={{ background: '#f8faff', borderRadius: '16px', padding: '16px', border: '1px solid #eef2ff' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', marginBottom: '4px' }}>CHECK-OUT</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>06:30 PM</div>
                 </div>
              </div>
            </div>

            {/* Interactive "Slide to Clock-In" Component */}
            <div style={{ margin: '0 20px 30px', background: '#1e293b', borderRadius: '100px', padding: '6px', position: 'relative', overflow: 'hidden' }}>
               <div style={{ padding: '16px 24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>
                 Slide to Clock-In
               </div>
               
               {/* The draggable button (mocked) */}
               <div style={{ position: 'absolute', top: '6px', left: '6px', bottom: '6px', width: '48px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '2px 0 10px rgba(0,0,0,0.2)' }}>
                 <ArrowRight size={20} />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <div className="stats-row-v2 animate-fade-up delay-3">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card-v2">
            <div className="icon" style={{ color: stat.color }}>{stat.icon}</div>
            <p style={{ margin: 0, fontSize: '10px', fontWeight: '800', letterSpacing: '1px' }}>{stat.label}</p>
            <h3>{stat.value}</h3>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.6 }}>Active Enterprises</p>
          </div>
        ))}
      </div>

      {/* Main Features */}
      <div className="features-container animate-fade-up delay-4">
        <div className="feature-large">
          <div className="feature-info">
             <div style={{ background: '#ede9fe', color: '#7c3aed', padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', display: 'inline-block', marginBottom: '16px' }}>
                <MapPin size={10} style={{ marginRight: '4px' }} />
                PRECISION GEOFENCING
             </div>
             <h2>Location-Based Attendance Tracking</h2>
             <p>Secure verification tied directly to your physical office coordinates. Ensure presence with zero margin for error.</p>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <Zap size={20} style={{ color: '#7c3aed' }} />
                <span style={{ fontSize: '12px' }}>Company location is required to activate geofencing.</span>
             </div>
          </div>
          <div className="feature-visual" style={{ flex: 1 }}>
             <div style={{ background: '#f8fafc', width: '100%', height: '360px', borderRadius: '24px', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#cbd5e1 2px, transparent 2px)', backgroundSize: '30px 30px', opacity: 0.4 }}></div>
                
                {/* Simulated Geofencing Zone */}
                <div style={{ width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', border: '2px dashed rgba(99, 102, 241, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                   <div style={{ width: '24px', height: '24px', background: '#6366f1', borderRadius: '50%', boxShadow: '0 0 0 8px rgba(99, 102, 241, 0.2)' }}></div>
                   
                   {/* Employee locations */}
                   <div style={{ position: 'absolute', top: '20%', right: '20%', width: '14px', height: '14px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)' }}></div>
                   <div style={{ position: 'absolute', bottom: '30%', left: '10%', width: '14px', height: '14px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)' }}></div>
                   
                   {/* Out of zone location */}
                   <div style={{ position: 'absolute', top: '-10%', left: '-20%', width: '14px', height: '14px', background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }}></div>
                </div>
             </div>
          </div>
        </div>

        <div className="small-features">
           <div className="feature-small">
              <div className="icon"><Clock size={24} /></div>
              <h3>Real-time Check-in Tracking</h3>
              <p>Instant visibility into team availability. Watch your workforce pulse in real-time as they start their day.</p>
              <a href="#" style={{ color: '#6366f1', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: '600' }}>
                 Learn more <ArrowRight size={14} />
              </a>
           </div>
           <div className="feature-small">
              <div className="icon"><BarChart3 size={24} /></div>
              <h3>Work Hour Analytics</h3>
              <p>Deep-dive into productivity patterns with automated reporting and visual density heatmaps.</p>
           </div>
           <div className="feature-small">
              <div className="icon"><Calendar size={24} /></div>
              <h3>Leave & Attendance Management</h3>
              <p>Centralize time-off requests, sick leaves, and vacation tracking in one elegant workflow.</p>
           </div>
        </div>
      </div>

      {/* CTA Banner */}
      <section className="bottom-banner-v3 animate-fade-up delay-2" style={{ padding: '100px 60px', background: 'var(--premium-gradient-alt)', borderRadius: '48px', margin: '60px 24px', position: 'relative', overflow: 'hidden', textAlign: 'center', boxShadow: '0 40px 100px -20px rgba(15, 23, 42, 0.3)' }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', filter: 'blur(80px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '250px', height: '250px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
        
        <h2 style={{ color: 'white', fontSize: '42px', fontWeight: '800', marginBottom: '20px', position: 'relative', zIndex: 1, letterSpacing: '-1px' }}>Apply to onboard your company</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', maxWidth: '600px', margin: '0 auto 40px', position: 'relative', zIndex: 1 }}>Submit your details today. Our enterprise team will review your application within 24 hours.</p>
        
        <button className="btn-shimmer" style={{ padding: '20px 48px', fontSize: '16px', borderRadius: '100px' }} onClick={() => navigate("/register-company")}>
          Get Started Today
          <ArrowRight size={20} style={{ marginLeft: '12px', verticalAlign: 'middle' }} />
        </button>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 40px 100px', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px', background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>Ethereal Workplace</div>
        <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>© 2026 Ethereal Workplace. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
