
import React, { useState } from 'react';
import DB from '../services/db';

const ROLES = [
    {
        key: "candidate", label: "Candidate", icon: "👤",
        demo: { email: "candidate@example.com", password: "pass123" },
        hint: "Apply for onboarding & track your application status."
    },
    {
        key: "hr", label: "HR", icon: "📋",
        demo: { email: "hr@bank.com", password: "hr123" },
        hint: "Review applications and schedule interviews."
    },
    {
        key: "admin", label: "Admin", icon: "🛡️",
        demo: { email: "admin@bank.com", password: "admin" },
        hint: "Full access: approve, reject, and manage all applications."
    },
];

export default function AuthView({ onLogin }) {
    const [mode, setMode] = useState("login");
    const [role, setRole] = useState("candidate");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const selectedRole = ROLES.find(r => r.key === role);

    const handleRoleChange = (key) => {
        setRole(key);
        setError("");
        setEmail("");
        setPassword("");
    };

    const fillDemo = (e) => {
        e.preventDefault();
        setEmail(selectedRole.demo.email);
        setPassword(selectedRole.demo.password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            let user;
            if (mode === "login") {
                user = await DB.login(email, password, role);
                if (!user) throw new Error("Invalid credentials. Check email, password, and role tab.");
            } else {
                user = await DB.signup(email, password, name, role);
            }
            onLogin(user);
        } catch (err) {
            setError(err.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            minHeight: "100vh", width: "100vw",
            background: "linear-gradient(135deg, var(--navy) 0%, #1a4060 50%, #0d6e6b 100%)",
            position: "fixed", top: 0, left: 0,
        }}>
            <div className="card" style={{ width: 440, padding: 40 }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <div style={{ fontSize: 48, marginBottom: 10 }}>🏦</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "var(--navy)" }}>SmartOnboarder</div>
                    <div style={{ color: "var(--gray-500)", fontSize: 14, marginTop: 4 }}>
                        {mode === "login" ? "Sign in to continue" : "Create your account"}
                    </div>
                </div>

                {/* Role Tabs */}
                <div className="tab-bar" style={{ marginBottom: 20 }}>
                    {ROLES.map(r => (
                        <div
                            key={r.key}
                            className={`tab ${role === r.key ? "active" : ""}`}
                            style={{ flex: 1, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                            onClick={() => handleRoleChange(r.key)}
                        >
                            <span>{r.icon}</span> {r.label}
                        </div>
                    ))}
                </div>

                {/* Role description */}
                <div style={{
                    background: "var(--gray-50)", border: "1px solid var(--gray-200)",
                    borderRadius: 10, padding: "10px 14px", marginBottom: 20,
                    fontSize: 12, color: "var(--gray-500)"
                }}>
                    {selectedRole.hint}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {mode === "signup" && (
                        <div className="input-group">
                            <label className="input-label">Full Name</label>
                            <input className="input-field" value={name} onChange={e => setName(e.target.value)} required placeholder="Your full name" />
                        </div>
                    )}
                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@email.com" />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <input className="input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
                    </div>

                    {error && (
                        <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 14, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px" }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <button className="btn btn-primary w-full" disabled={loading} style={{ padding: 12, marginBottom: 10 }}>
                        {loading ? "Processing..." : mode === "login" ? `Sign In as ${selectedRole.label}` : "Create Account"}
                    </button>
                </form>

                {/* Demo credentials */}
                {mode === "login" && (
                    <button
                        onClick={fillDemo}
                        style={{ width: "100%", padding: "8px", background: "var(--teal-50)", border: "1px solid var(--teal-100)", borderRadius: 8, fontSize: 12, color: "var(--teal)", fontWeight: 600, cursor: "pointer", marginBottom: 12 }}
                    >
                        ⚡ Fill Demo Credentials ({selectedRole.demo.email})
                    </button>
                )}

                <div style={{ textAlign: "center", fontSize: 13, color: "var(--gray-500)" }}>
                    {mode === "login" ? (
                        <span>New here? <button className="text-teal" style={{ background: "none", border: "none", fontWeight: 700, cursor: "pointer" }} onClick={() => setMode("signup")}>Create account</button></span>
                    ) : (
                        <span>Already have an account? <button className="text-teal" style={{ background: "none", border: "none", fontWeight: 700, cursor: "pointer" }} onClick={() => setMode("login")}>Sign in</button></span>
                    )}
                </div>
            </div>
        </div>
    );
}
