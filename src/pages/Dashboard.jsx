import { useNavigate } from "react-router-dom";
import { 
  MapPin, Clock, Zap, ArrowRight, Shield, 
  BarChart3, Calendar, CheckCircle2, Users, 
  ChevronRight, Bell, User, MoreVertical, Search
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const feed = [
    { name: "David Kola", role: "Product Designer", time: "08:24 AM", status: "Checked-in", location: "New York, USA", img: "https://i.pravatar.cc/150?u=david" },
    { name: "Elena Rodriguez", role: "Lead Developer", time: "08:35 AM", status: "Checked-in", location: "Berlin, Germany", img: "https://i.pravatar.cc/150?u=elena" },
    { name: "Julian Wright", role: "Sales Manager", time: "09:42 AM", status: "Late", location: "London, UK", img: "https://i.pravatar.cc/150?u=julian" },
  ];

  return (
    <div className="premium-page">
      {/* Navigation */}
      {/* Navigation */}
      <header className="premium-navbar-v2 animate-centered-fade-up">
        <div className="navbar-brand" style={{ cursor: 'pointer' }} onClick={() => navigate("/dashboard")}>
          <span className="brand-text" style={{ transition: 'all 0.3s ease' }}>Ethereal Workplace</span>
        </div>
        <nav className="nav-links-wrap">
          <span className="nav-link-v2" onClick={() => navigate("/home")}>Home</span>
          <span className="nav-link-v2 active">Dashboard</span>
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
      <section className="premium-hero animate-fade-up" style={{ minHeight: '400px', borderRadius: '0', padding: '60px 40px', backgroundSize: '200% 200%', animation: 'gradientPan 10s ease infinite, fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards', backgroundImage: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 40%, #a855f7 70%, #6366f1 100%)' }}>
        <div className="hero-content-v2 animate-fade-up delay-1">
          <h1 style={{ color: 'white' }}>
            Real-time Check-in Tracking
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)' }}>
            Instant visibility into employee attendance. Monitor your workforce live with accurate timestamps and location-based tracking. Seamlessly manage your desk and remote teams in one view.
          </p>
          <button className="btn-shimmer">
            View Live Dashboard
          </button>
        </div>

        <div className="hero-image-v2 animate-fade-up delay-2">
          {/* Live Feed Miniature Overlay */}
          <div className="insight-card-v2" style={{ width: '380px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ fontWeight: '700' }}>Live Feed</span>
                <span style={{ fontSize: '10px', background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80', padding: '2px 8px', borderRadius: '10px' }}>● LIVE NOW</span>
             </div>
             {feed.slice(0, 2).map((user, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                   <img src={user.img} style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt="" />
                   <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{user.name}</div>
                      <div style={{ fontSize: '10px', opacity: 0.7 }}>{user.role}</div>
                   </div>
                   <Zap size={12} style={{ color: '#facc15' }} />
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="features-container" style={{ marginTop: '60px' }}>
        
        {/* Attendance Feed Table */}
        <div className="premium-card-v3 animate-fade-up delay-3" style={{ marginBottom: '40px' }}>
           <div className="feed-header">
              <div>
                 <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>Global Workforce Activity</h3>
                 <p style={{ fontSize: '14px', color: '#64748b' }}>Real-time status updates across all company departments</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '16px', display: 'flex', gap: '8px', border: '1px solid #e2e8f0' }}>
                 <button style={{ border: 'none', padding: '8px 20px', borderRadius: '12px', background: 'var(--primary)', color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}>Active Now</button>
                 <button style={{ border: 'none', padding: '8px 20px', borderRadius: '12px', background: 'transparent', color: '#64748b', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Absentees</button>
              </div>
           </div>

           <div className="feed-table-v3" style={{ marginTop: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr 1fr', padding: '16px 24px', background: '#f8fafc', borderRadius: '12px', fontSize: '12px', fontWeight: '800', color: '#94a3b8', letterSpacing: '1px', marginBottom: '16px' }}>
                 <span>EMPLOYEE</span>
                 <span>DESIGNATION</span>
                 <span>STATUS</span>
                 <span>CHECK-IN TIME</span>
                 <span>LOCATION</span>
              </div>
              {feed.map((user, i) => (
                 <div key={i} className="feed-row-v3" style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr 1fr', alignItems: 'center', padding: '20px 24px', borderBottom: i === feed.length - 1 ? 'none' : '1px solid #f1f5f9', transition: 'all 0.2s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                       <img src={user.img} style={{ width: '44px', height: '44px', borderRadius: '14px', objectFit: 'cover' }} alt="" />
                       <div style={{ fontWeight: '700', color: '#1e293b' }}>{user.name}</div>
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>{user.role}</div>
                    <div>
                       <span style={{ 
                          padding: '6px 12px', 
                          borderRadius: '8px', 
                          fontSize: '11px', 
                          fontWeight: '800', 
                          background: user.status === 'Checked-in' ? '#dcfce7' : '#fee2e2', 
                          color: user.status === 'Checked-in' ? '#166534' : '#991b1b',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                       }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span>
                          {user.status.toUpperCase()}
                       </span>
                    </div>
                    <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>
                       {user.time}
                       <span style={{ fontWeight: '500', fontSize: '12px', color: '#94a3b8', display: 'block' }}>IST +5:30</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', fontWeight: '500' }}>
                       <MapPin size={14} style={{ color: 'var(--primary)' }} /> {user.location}
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Triple Feature Cards */}
        <div className="small-features animate-fade-up delay-4" style={{ marginBottom: '60px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
           <div className="premium-card-v3" style={{ padding: '32px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                 <Zap size={24} />
              </div>
              <h4 style={{ fontSize: '18px', marginBottom: '12px' }}>Instant Visibility</h4>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>Eliminate guesswork with a live dashboard that updates as soon as your team starts their day.</p>
           </div>
           <div className="premium-card-v3" style={{ padding: '32px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                 <Clock size={24} />
              </div>
              <h4 style={{ fontSize: '18px', marginBottom: '12px' }}>Accurate Tracking</h4>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>Precise logs up to the second, ensuring payroll and project hours are always 100% accurate.</p>
           </div>
           <div className="premium-card-v3" style={{ padding: '32px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                 <Shield size={24} />
              </div>
              <h4 style={{ fontSize: '18px', marginBottom: '12px' }}>Location Validation</h4>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>Verify every check-in with GPS or office geofencing to maintain accountability and security.</p>
           </div>
        </div>

        {/* Map Section */}
        <div className="feature-large animate-fade-up delay-2">
           <div className="feature-info">
              <div style={{ background: '#ede9fe', color: '#7c3aed', padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', display: 'inline-block', marginBottom: '16px' }}>
                 GEO-VERIFIED CLOCKING
              </div>
              <h2>Location-secured Attendance</h2>
              <p>Protect your workspace integrity. Our platform automatically validates check-ins against your company's physical locations or pre-approved remote zones.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                    <CheckCircle2 size={16} style={{ color: '#6366f1' }} /> Automatic Geofencing
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                    <CheckCircle2 size={16} style={{ color: '#6366f1' }} /> IP-address Verification
                 </div>
              </div>
           </div>
           <div style={{ flex: 1 }}>
              <div style={{ background: '#f8fafc', width: '100%', height: '360px', borderRadius: '24px', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                 {/* CSS Grid Pattern Background */}
                 <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#cbd5e1 2px, transparent 2px)', backgroundSize: '24px 24px', opacity: 0.5 }}></div>
                 
                 {/* Map Points and Nodes */}
                 <div style={{ position: 'absolute', top: '35%', left: '25%', width: '14px', height: '14px', background: '#6366f1', borderRadius: '50%', boxShadow: '0 0 0 6px rgba(99, 102, 241, 0.2)' }}></div>
                 <div style={{ position: 'absolute', top: '55%', left: '45%', width: '18px', height: '18px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 0 8px rgba(16, 185, 129, 0.2)' }}></div>
                 <div style={{ position: 'absolute', top: '30%', right: '20%', width: '12px', height: '12px', background: '#f59e0b', borderRadius: '50%', boxShadow: '0 0 0 6px rgba(245, 158, 11, 0.2)' }}></div>

                 {/* Simulated Validation Card */}
                 <div style={{ position: 'absolute', bottom: '24px', right: '24px', background: 'rgba(255,255,255,0.95)', padding: '16px', borderRadius: '16px', backdropFilter: 'blur(8px)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                       <CheckCircle2 size={18} />
                    </div>
                    <div>
                       <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '13px' }}>Location Verified</div>
                       <div style={{ color: '#64748b', fontSize: '11px' }}>Within 50m of Office HQ</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Insights Section */}
        <div style={{ textAlign: 'center', margin: '80px 0 40px' }}>
           <h2>Real-time Insights</h2>
           <p style={{ color: '#64748b' }}>Visualize your workforce dynamics with instant data analytics.</p>
        </div>

        <div className="insights-v2 animate-fade-up delay-3">
           <div className="insight-card-v2">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                 <BarChart3 size={18} style={{ color: '#6366f1' }} />
                 <span style={{ fontWeight: '700' }}>Peak Login Hours</span>
              </div>
              <div className="bar-chart-v2">
                 {[30, 45, 60, 95, 80, 50, 40].map((h, i) => (
                    <div key={i} className={`chart-bar-v2 ${i === 3 ? 'active' : ''}`} style={{ height: `${h}%` }}></div>
                 ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '10px' }}>
                 <span>07:00</span>
                 <span>08:00</span>
                 <span>09:00</span>
                 <span>10:00</span>
                 <span>11:00</span>
                 <span>12:00</span>
                 <span>13:00</span>
              </div>
           </div>

           <div className="insight-card-v2" style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', justifyContent: 'center' }}>
                 <Zap size={18} style={{ color: '#6366f1' }} />
                 <span style={{ fontWeight: '700' }}>On-time Performance</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '32px' }}>Weekly team punctuality score</p>
              
              <div className="radial-chart-v2">
                 <svg className="radial-svg" width="150" height="150">
                    <circle className="radial-bg" cx="75" cy="75" r="70" />
                    <circle className="radial-progress" cx="75" cy="75" r="70" style={{ strokeDashoffset: '40' }} />
                 </svg>
                 <div className="radial-text">94%</div>
              </div>

              <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '12px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }}></div> On-time (847)</div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f1f5f9' }}></div> Delayed (54)</div>
              </div>

              <button style={{ marginTop: '32px', width: '100%', background: '#f1f5f9', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '600', color: '#6366f1', cursor: 'pointer' }}>
                 Download Full Report
              </button>
           </div>
        </div>

      </div>

      {/* CTA Banner */}
      <section className="bottom-banner-v3 animate-fade-up delay-4" style={{ padding: '80px 60px', background: 'var(--premium-gradient)', borderRadius: '48px', margin: '60px 24px', position: 'relative', overflow: 'hidden', textAlign: 'center', boxShadow: '0 40px 100px -20px var(--primary-glow)' }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(80px)' }}></div>
        <h2 style={{ color: 'white', fontSize: '36px', fontWeight: '800', marginBottom: '24px', position: 'relative', zIndex: 1 }}>Start tracking attendance in real-time</h2>
        <button className="btn-white" style={{ borderRadius: '100px', padding: '16px 48px', fontSize: '15px' }} onClick={() => navigate("/register-company")}>
          Register Your Company
          <ArrowRight size={18} style={{ marginLeft: '12px', verticalAlign: 'middle' }} />
        </button>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
        <p>© 2026 Ethereal Workplace. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
