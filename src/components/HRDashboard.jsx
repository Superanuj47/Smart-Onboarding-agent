
import React, { useState, useEffect, useCallback } from 'react';
import DB from '../services/db';
import { statusBg, statusColor, riskBg, riskColor, formatDate } from '../utils/common';
import StatusBadge from './StatusBadge';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

// ─── Analytics Mini Row ─────────────────────────────────────────────────────
function HRAnalytics({ customers }) {
    const total = customers.length;
    const pending = customers.filter(c => ["PENDING_REVIEW", "UNDER_REVIEW", "APPLIED", "DOCUMENTS_UPLOADED"].includes(c.status || c.application_stage)).length;
    const interview = customers.filter(c => c.application_stage === "INTERVIEW_SCHEDULED").length;
    const approved = customers.filter(c => c.status === "APPROVED").length;

    return (
        <div className="grid-4" style={{ marginBottom: 24 }}>
            {[
                { label: "Total", value: total, color: "#6366f1", bg: "#eef2ff", icon: "👥" },
                { label: "Needs Review", value: pending, color: "#f59e0b", bg: "#fffbeb", icon: "⏳" },
                { label: "Interview Sched.", value: interview, color: "#8b5cf6", bg: "#f5f3ff", icon: "📅" },
                { label: "Approved", value: approved, color: "#10b981", bg: "#f0fdf4", icon: "✅" },
            ].map(c => (
                <div key={c.label} className="metric-card" style={{ borderTop: `3px solid ${c.color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <div className="metric-val" style={{ color: c.color }}>{c.value}</div>
                            <div className="metric-label">{c.label}</div>
                        </div>
                        <div style={{ fontSize: 24, background: c.bg, width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>{c.icon}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── HR Detail Modal ─────────────────────────────────────────────────────────
function HRDetailModal({ customer, user, onClose, onSchedule }) {
    const [interviewDate, setInterviewDate] = useState(customer.interview_scheduled_at ? customer.interview_scheduled_at.slice(0, 16) : "");
    const [scheduling, setScheduling] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSchedule = async () => {
        if (!interviewDate) { alert("Please select an interview date/time."); return; }
        setScheduling(true);
        await onSchedule(customer.id, interviewDate);
        setSuccess(true);
        setScheduling(false);
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
            <div className="card" style={{ maxWidth: 640, width: "100%", maxHeight: "90vh", overflow: "auto", margin: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--navy)" }}>{customer.name}</div>
                        <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 3 }}>Applied: {formatDate(customer.created_at)}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <StatusBadge status={customer.application_stage} />
                        <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
                    </div>
                </div>

                {/* Images */}
                {(customer.document_url || customer.selfie_url) && (
                    <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                        {customer.document_url && (
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-500)", marginBottom: 6, textTransform: "uppercase" }}>📄 Document</div>
                                <img src={customer.document_url} alt="Document" style={{ width: "100%", maxHeight: 140, objectFit: "contain", borderRadius: 10, border: "1.5px solid var(--gray-200)", background: "var(--gray-50)" }} />
                            </div>
                        )}
                        {customer.selfie_url && (
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-500)", marginBottom: 6, textTransform: "uppercase" }}>🤳 Selfie</div>
                                <img src={customer.selfie_url} alt="Selfie" style={{ width: "100%", maxHeight: 140, objectFit: "contain", borderRadius: 10, border: "1.5px solid var(--teal)", background: "var(--gray-50)" }} />
                            </div>
                        )}
                    </div>
                )}

                <div style={{ background: "var(--gray-50)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                    {[["Name", customer.name], ["Email", customer.email], ["Phone", customer.phone], ["Doc Type", customer.doc_type], ["Doc Number", customer.doc_number], ["Risk Level", customer.risk_level]].map(([k, v]) => (
                        <div className="info-row" key={k}><span className="info-key">{k}</span><span style={{ fontWeight: 600, color: k === "Risk Level" ? riskColor(v) : undefined }}>{v || "—"}</span></div>
                    ))}
                </div>

                {/* Flags */}
                {(customer.flags || []).length > 0 && (
                    <div style={{ marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {customer.flags.map((f, i) => <span key={i} className="flag-tag">🚩 {f}</span>)}
                    </div>
                )}

                {/* Schedule Interview */}
                {success ? (
                    <div style={{ background: "#f0fdf4", border: "1px solid #a7f3d0", borderRadius: 10, padding: 14, textAlign: "center" }}>
                        <div style={{ color: "#10b981", fontWeight: 700 }}>✅ Interview scheduled for {new Date(interviewDate).toLocaleString()}</div>
                    </div>
                ) : customer.application_stage !== "APPROVED" && customer.application_stage !== "REJECTED" ? (
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-700)", marginBottom: 10 }}>📅 Schedule Interview</div>
                        <div className="input-group">
                            <input type="datetime-local" className="input-field" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} style={{ maxWidth: 280 }} />
                        </div>
                        <button className="btn btn-navy" disabled={scheduling || !interviewDate} onClick={handleSchedule}>
                            {scheduling ? "Scheduling..." : "Confirm Interview Date"}
                        </button>
                    </div>
                ) : (
                    <div style={{ background: statusBg(customer.status), border: `1px solid ${statusColor(customer.status)}33`, borderRadius: 10, padding: 14, textAlign: "center" }}>
                        <span style={{ fontWeight: 700, color: statusColor(customer.status) }}>
                            Application: <StatusBadge status={customer.status} />
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── HR Dashboard ─────────────────────────────────────────────────────────────
export default function HRDashboard({ onRefresh, user }) {
    const [customers, setCustomers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastLoaded, setLastLoaded] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const c = await DB.getCustomers();
            setCustomers(c || []);
            setLastLoaded(new Date());
        } catch (e) {
            setError(e.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleSchedule = async (customerId, interviewDate) => {
        await DB.updateCustomer(customerId, {
            application_stage: "INTERVIEW_SCHEDULED",
            interview_scheduled_at: new Date(interviewDate).toISOString(),
            interviewed_by: user.name,
        });
        await DB.addLog({ event: "INTERVIEW_SCHEDULED", user_id: customerId, actor: user.name, detail: `Interview scheduled at ${interviewDate}` });
        await loadData();
        onRefresh();
    };

    const FILTERS = ["ALL", "PENDING_REVIEW", "UNDER_REVIEW", "INTERVIEW_SCHEDULED"];
    const filtered = customers.filter(c => filter === "ALL" || c.status === filter || c.application_stage === filter);

    return (
        <div>
            <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
                <div>
                    <div className="section-title">HR Dashboard</div>
                    <div className="section-sub">Review applications and schedule interviews</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {lastLoaded && <span style={{ fontSize: 11, color: "var(--gray-400)" }}>Updated {lastLoaded.toLocaleTimeString()}</span>}
                    <button className="btn btn-secondary btn-sm" onClick={loadData} disabled={loading}>🔄 Refresh</button>
                </div>
            </div>

            <div style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 10, padding: "10px 16px", marginBottom: 20, fontSize: 13, color: "#7c3aed" }}>
                ℹ️ <strong>HR Role:</strong> You can schedule interviews and view applications. Approve/reject decisions are made by Admin.
            </div>

            {loading ? (
                <div style={{ padding: 48 }}><LoadingSpinner text="Loading applications..." /></div>
            ) : error ? (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: 20, color: "#ef4444", marginBottom: 20 }}>
                    ⚠️ {error} <button className="btn btn-sm btn-secondary" style={{ marginLeft: 12 }} onClick={loadData}>Retry</button>
                </div>
            ) : (
                <>
                    <HRAnalytics customers={customers} />

                    <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                        {FILTERS.map(f => (
                            <button key={f} className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-secondary"}`} onClick={() => setFilter(f)}>
                                {f.replace(/_/g, " ")}
                            </button>
                        ))}
                    </div>

                    <div className="card">
                        {filtered.length === 0 ? (
                            <EmptyState icon="📭" title="No applications" message="No applications match this filter." />
                        ) : (
                            <div style={{ overflowX: "auto" }}>
                                <table className="data-table">
                                    <thead>
                                        <tr><th>Name</th><th>Email</th><th>Doc Type</th><th>Risk</th><th>Stage</th><th>Interview At</th><th>Applied</th><th>Actions</th></tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(c => (
                                            <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => setSelected(c)}>
                                                <td style={{ fontWeight: 700, color: "var(--navy)" }}>{c.name}</td>
                                                <td style={{ fontSize: 12, color: "var(--gray-500)" }}>{c.email}</td>
                                                <td style={{ fontSize: 12 }}>{c.doc_type || "—"}</td>
                                                <td><span className="badge" style={{ background: riskBg(c.risk_level), color: riskColor(c.risk_level), fontSize: 10 }}>{c.risk_level || "N/A"}</span></td>
                                                <td><StatusBadge status={c.application_stage} size="sm" /></td>
                                                <td style={{ fontSize: 11, color: "var(--gray-500)" }}>{formatDate(c.interview_scheduled_at)}</td>
                                                <td style={{ fontSize: 11, color: "var(--gray-400)" }}>{formatDate(c.created_at)}</td>
                                                <td><button className="btn btn-sm btn-secondary" onClick={e => { e.stopPropagation(); setSelected(c); }}>View</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {selected && (
                <HRDetailModal
                    customer={selected}
                    user={user}
                    onClose={() => setSelected(null)}
                    onSchedule={handleSchedule}
                />
            )}
        </div>
    );
}
