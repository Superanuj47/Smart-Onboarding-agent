
import React, { useState } from 'react';
import DB from './services/db';
import AuthView from './components/AuthView';
import OnboardingView from './components/OnboardingView';
import AdminDashboard from './components/AdminDashboard';
import HRDashboard from './components/HRDashboard';
import './styles/App.css';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error("Uncaught error:", error, info); }
  render() {
    if (this.state.hasError) return (
      <div style={{ padding: 40, textAlign: "center", color: "#ef4444" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ marginBottom: 8 }}>Something went wrong</h2>
        <p style={{ color: "var(--gray-500)", marginBottom: 20, fontSize: 14 }}>{this.state.error?.message}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload Application</button>
      </div>
    );
    return this.props.children;
  }
}

// Nav links per role
const NAV_LINKS = {
  admin: [{ id: "home", label: "Home" }, { id: "onboard", label: "New Application" }, { id: "admin", label: "Admin Dashboard" }],
  hr: [{ id: "home", label: "Home" }, { id: "hr", label: "HR Dashboard" }],
  candidate: [{ id: "home", label: "Home" }, { id: "onboard", label: "My Application" }],
};

const ROLE_BADGE = { admin: { label: "Admin", color: "#ef4444", bg: "#fef2f2" }, hr: { label: "HR", color: "#8b5cf6", bg: "#f5f3ff" }, candidate: { label: "Candidate", color: "#3b82f6", bg: "#eff6ff" } };

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => setRefreshKey(k => k + 1);

  const handleLogout = () => { setUser(null); setView("home"); };

  if (!user) return <ErrorBoundary><AuthView onLogin={u => { setUser(u); setView("home"); }} /></ErrorBoundary>;

  const links = NAV_LINKS[user.role] || NAV_LINKS.candidate;
  const badge = ROLE_BADGE[user.role] || ROLE_BADGE.candidate;

  return (
    <ErrorBoundary>
      <div className="so-app">
        {/* ── Navigation ── */}
        <nav className="topnav">
          <div className="nav-left">
            <div className="nav-logo" onClick={() => setView("home")}>
              <div className="nav-logo-icon">🏦</div>
              <div className="nav-logo-text">SmartOnboarder</div>
            </div>
          </div>

          <div className="nav-center">
            <div className="nav-links">
              {links.map(l => (
                <button
                  key={l.id}
                  className={`nav-link ${view === l.id ? "active" : ""}`}
                  onClick={() => setView(l.id)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="nav-right">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>{user.name}</div>
                <span style={{ fontSize: 10, fontWeight: 700, background: badge.bg, color: badge.color, padding: "2px 8px", borderRadius: 20, letterSpacing: "0.5px" }}>
                  {badge.label.toUpperCase()}
                </span>
              </div>
              <button className="nav-cta" onClick={handleLogout}>Sign Out</button>
            </div>
          </div>
        </nav>

        {/* ── Home Hero ── */}
        {view === "home" && (
          <div className="hero">
            <div className="hero-inner">
              <div className="hero-badge">✨ AI-POWERED KYC PLATFORM</div>
              <h1 className="hero-h1">The Future of <br /><em>Secure Onboarding</em></h1>
              <p className="hero-sub">Role-based access for Admins, HR, and Candidates. Intelligent OCR document verification with risk-based approvals.</p>
              <div className="hero-btns">
                {(user.role === "candidate") && (
                  <button className="btn-hero-primary" onClick={() => setView("onboard")}>Start Application →</button>
                )}
                {(user.role === "admin") && (
                  <button className="btn-hero-primary" onClick={() => setView("admin")}>Open Admin Dashboard →</button>
                )}
                {(user.role === "hr") && (
                  <button className="btn-hero-primary" onClick={() => setView("hr")}>Open HR Dashboard →</button>
                )}
                {(user.role === "admin") && (
                  <button className="btn-hero-secondary" onClick={() => setView("onboard")}>New Application</button>
                )}
              </div>
              <div className="hero-stats">
                {[["98%", "Auto-Approval"], ["<2m", "Avg. Time"], ["3", "Roles"], ["24/7", "AI Support"]].map(([v, l]) => (
                  <div className="stat-item" key={l}><div className="stat-val">{v}</div><div className="stat-label">{l}</div></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Content Area ── */}
        {view !== "home" && (
          <div className="page-body">
            {view === "onboard" && <OnboardingView onRefresh={handleRefresh} user={user} />}
            {view === "admin" && user.role === "admin" && <AdminDashboard key={refreshKey} onRefresh={handleRefresh} user={user} />}
            {view === "hr" && user.role === "hr" && <HRDashboard key={refreshKey} onRefresh={handleRefresh} user={user} />}
            {/* Access denied */}
            {((view === "admin" && user.role !== "admin") || (view === "hr" && user.role !== "hr")) && (
              <div style={{ textAlign: "center", padding: 80 }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>🔒</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--gray-700)" }}>Access Restricted</div>
                <div style={{ color: "var(--gray-500)", marginTop: 8 }}>You don't have permission to view this page.</div>
              </div>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
