
import React, { useState, useEffect, useCallback } from 'react';
import DB from '../services/db';
import { riskBg, riskColor, statusBg, statusColor, formatDate } from '../utils/common';
import StatusBadge from './StatusBadge';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import RiskGauge from './RiskGauge';

// ─── Analytics Cards ─────────────────────────────────────────────────────────
function AnalyticsRow({ customers }) {
    const total = customers.length;
    const pending = customers.filter(c => ["PENDING_REVIEW", "UNDER_REVIEW", "APPLIED", "DOCUMENTS_UPLOADED"].includes(c.status || c.application_stage)).length;
    const approved = customers.filter(c => c.status === "APPROVED").length;
    const rejected = customers.filter(c => c.status === "REJECTED").length;
    const interview = customers.filter(c => c.application_stage === "INTERVIEW_SCHEDULED").length;

    const cards = [
        { label: "Total Candidates", value: total, color: "#6366f1", bg: "#eef2ff", icon: "👥" },
        { label: "Pending Review", value: pending, color: "#f59e0b", bg: "#fffbeb", icon: "⏳" },
        { label: "Approved", value: approved, color: "#10b981", bg: "#f0fdf4", icon: "✅" },
        { label: "Rejected", value: rejected, color: "#ef4444", bg: "#fef2f2", icon: "❌" },
        { label: "Interview Sched.", value: interview, color: "#8b5cf6", bg: "#f5f3ff", icon: "📅" },
    ];

    return (
        <div className="grid-5" style={{ marginBottom: 24 }}>
            {cards.map(c => (
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

// ─── Stage Distribution Bar Chart ────────────────────────────────────────────
function StageChart({ customers }) {
    const stages = ["APPLIED", "DOCUMENTS_UPLOADED", "UNDER_REVIEW", "INTERVIEW_SCHEDULED", "APPROVED", "REJECTED"];
    const stageCounts = stages.map(s => ({
        stage: s,
        count: customers.filter(c => c.application_stage === s || c.status === s).length,
        color: statusColor(s),
    }));
    const max = Math.max(...stageCounts.map(s => s.count), 1);

    return (
        <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-title"><span>📊</span> Stage Distribution</div>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 100 }}>
                {stageCounts.map(s => (
                    <div key={s.stage} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.count}</div>
                        <div style={{
                            width: "100%", background: s.color, opacity: 0.85, borderRadius: "4px 4px 0 0",
                            height: `${(s.count / max) * 68 + 4}px`, minHeight: 4, transition: "height 0.4s ease"
                        }} />
                        <div style={{ fontSize: 9, color: "var(--gray-400)", textAlign: "center", lineHeight: 1.2, textTransform: "uppercase" }}>
                            {s.stage.replace(/_/g, "\n")}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Detail Modal ────────────────────────────────────────────────────────────
function DetailModal({ customer, user, onClose, onDecision }) {
    const [rejectionReason, setRejectionReason] = useState("");
    const [interviewDate, setInterviewDate] = useState("");
    const [deciding, setDeciding] = useState(false);

    const handleDecision = async (decision) => {
        if (decision === "REJECT" && !rejectionReason.trim()) {
            alert("Please provide a rejection reason."); return;
        }
        setDeciding(true);
        await onDecision(customer.id, decision, rejectionReason, interviewDate);
        setDeciding(false);
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
            <div className="card" style={{ maxWidth: 860, width: "100%", maxHeight: "90vh", overflow: "auto", margin: 0 }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--navy)" }}>{customer.name}</div>
                        <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 3 }}>
                            ID: {customer.id} • Applied: {formatDate(customer.created_at)}
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <StatusBadge status={customer.application_stage} />
                        <button className="btn btn-secondary btn-sm" onClick={onClose}>✕ Close</button>
                    </div>
                </div>

                {/* Document + Selfie Images */}
                {(customer.document_url || customer.selfie_url) && (
                    <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                        {customer.document_url && (
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-500)", marginBottom: 6, textTransform: "uppercase" }}>📄 Uploaded Document</div>
                                <img src={customer.document_url} alt="Document" style={{ width: "100%", maxHeight: 180, objectFit: "contain", borderRadius: 10, border: "1.5px solid var(--gray-200)", background: "var(--gray-50)" }} />
                            </div>
                        )}
                        {customer.selfie_url && (
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-500)", marginBottom: 6, textTransform: "uppercase" }}>🤳 Uploaded Selfie</div>
                                <img src={customer.selfie_url} alt="Selfie" style={{ width: "100%", maxHeight: 180, objectFit: "contain", borderRadius: 10, border: "1.5px solid var(--teal)", background: "var(--gray-50)" }} />
                            </div>
                        )}
                    </div>
                )}

                <div className="grid-2" style={{ marginBottom: 20 }}>
                    {/* Personal Info */}
                    <div style={{ background: "var(--gray-50)", borderRadius: 12, padding: 16 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-600)", marginBottom: 10, textTransform: "uppercase" }}>Personal Details</div>
                        {[["Name", customer.name], ["Email", customer.email], ["Phone", customer.phone], ["DOB", customer.dob], ["Address", customer.address]].map(([k, v]) => (
                            <div className="info-row" key={k}><span className="info-key">{k}</span><span style={{ fontWeight: 600 }}>{v || "—"}</span></div>
                        ))}
                    </div>

                    {/* Document Info */}
                    <div style={{ background: "var(--gray-50)", borderRadius: 12, padding: 16 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-600)", marginBottom: 10, textTransform: "uppercase" }}>Document Verification</div>
                        {[
                            ["Doc Type", customer.doc_type],
                            ["Doc Number", customer.doc_number],
                            ["Extracted Name", customer.doc_extracted_name],
                            ["Extracted DOB", customer.doc_extracted_dob],
                            ["Name Match", customer.name === customer.doc_extracted_name ? "✓ YES" : "✗ MISMATCH"],
                            ["DOB Match", customer.dob === customer.doc_extracted_dob ? "✓ YES" : "✗ MISMATCH"],
                        ].map(([k, v]) => (
                            <div className="info-row" key={k}>
                                <span className="info-key">{k}</span>
                                <span style={{ fontWeight: 600, color: k.includes("Match") && (v || "").includes("✗") ? "#ef4444" : k.includes("Match") && (v || "").includes("✓") ? "#10b981" : undefined }}>{v || "—"}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* OCR Raw Text */}
                {customer.ocr_raw_text && (
                    <details style={{ marginBottom: 16 }}>
                        <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--gray-600)", padding: "8px 0" }}>📝 Raw OCR Text (click to expand)</summary>
                        <pre style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)", borderRadius: 8, padding: 12, fontSize: 11, color: "var(--gray-600)", overflow: "auto", maxHeight: 120, marginTop: 8, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                            {customer.ocr_raw_text}
                        </pre>
                    </details>
                )}

                {/* Risk Assessment */}
                <div style={{ background: riskBg(customer.risk_level), border: `2px solid ${riskColor(customer.risk_level)}`, borderRadius: 12, padding: 18, marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                        <RiskGauge score={customer.risk_score || 0} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: riskColor(customer.risk_level), marginBottom: 4 }}>
                                {customer.risk_level} RISK — Score: {customer.risk_score}/100
                            </div>
                            {customer.risk_breakdown && (
                                <div style={{ fontSize: 12, color: "var(--gray-600)" }}>
                                    Name (+{customer.risk_breakdown.name_mismatch}) • DOB (+{customer.risk_breakdown.dob_mismatch}) •
                                    Duplicate (+{customer.risk_breakdown.duplicate_id}) • Face (+{customer.risk_breakdown.face_match})
                                </div>
                            )}
                        </div>
                    </div>
                    {(customer.flags || []).length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {customer.flags.map((f, i) => <span key={i} className="flag-tag">🚩 {f}</span>)}
                        </div>
                    )}
                </div>

                {/* Admin Actions */}
                {(customer.status === "PENDING_REVIEW" || customer.application_stage === "UNDER_REVIEW") && user.role === "admin" ? (
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gray-700)", marginBottom: 12 }}>Admin Decision</div>

                        {/* Interview scheduling */}
                        <div className="input-group">
                            <label className="input-label">Schedule Interview (optional)</label>
                            <input type="datetime-local" className="input-field" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} style={{ maxWidth: 280 }} />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Rejection Reason (required if rejecting)</label>
                            <textarea className="input-field" rows={3} value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="Provide detailed reason for rejection..." />
                        </div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button className="btn btn-success" style={{ flex: 1, minWidth: 140 }} disabled={deciding} onClick={() => handleDecision("APPROVE")}>
                                {deciding ? "..." : "✅ Approve"}
                            </button>
                            {interviewDate && (
                                <button className="btn btn-navy" style={{ flex: 1, minWidth: 140 }} disabled={deciding} onClick={() => handleDecision("SCHEDULE_INTERVIEW")}>
                                    {deciding ? "..." : "📅 Schedule Interview"}
                                </button>
                            )}
                            <button className="btn btn-danger" style={{ flex: 1, minWidth: 140 }} disabled={deciding} onClick={() => handleDecision("REJECT")}>
                                {deciding ? "..." : "❌ Reject"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ background: statusBg(customer.status), border: `1px solid ${statusColor(customer.status)}33`, borderRadius: 12, padding: 14, textAlign: "center" }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: statusColor(customer.status) }}>
                            Application is <StatusBadge status={customer.status} />
                            {customer.interview_scheduled_at && ` • Interview: ${formatDate(customer.interview_scheduled_at)}`}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main AdminDashboard ──────────────────────────────────────────────────────
export default function AdminDashboard({ onRefresh, user }) {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [filter, setFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastLoaded, setLastLoaded] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
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

    const handleDecision = async (customerId, decision, rejectionReason, interviewDate) => {
        const statusMap = { APPROVE: "APPROVED", REJECT: "REJECTED", SCHEDULE_INTERVIEW: "PENDING_REVIEW" };
        const stageMap = { APPROVE: "APPROVED", REJECT: "REJECTED", SCHEDULE_INTERVIEW: "INTERVIEW_SCHEDULED" };

        const patch = {
            status: statusMap[decision],
            application_stage: stageMap[decision],
        };
        if (decision === "SCHEDULE_INTERVIEW" && interviewDate) {
            patch.interview_scheduled_at = new Date(interviewDate).toISOString();
            patch.interviewed_by = user.name;
        }

        await DB.updateCustomer(customerId, patch);
        await DB.addLog({
            event: `ADMIN_${decision}`,
            user_id: customerId,
            actor: user.name,
            detail: decision === "APPROVE"
                ? `Approved by ${user.name}`
                : decision === "REJECT"
                    ? `Rejected by ${user.name}: ${rejectionReason}`
                    : `Interview scheduled by ${user.name}`,
        });

        const cases = await DB.getCases();
        const open = cases.find(c => c.customer_id === customerId && c.status === "OPEN");
        if (open) await DB.updateCase(open.id, { status: "CLOSED" });

        setSelectedCustomer(null);
        await loadData();
        onRefresh();
    };

    const FILTERS = ["ALL", "PENDING_REVIEW", "UNDER_REVIEW", "INTERVIEW_SCHEDULED", "APPROVED", "REJECTED"];

    const filtered = customers.filter(c => {
        const matchFilter = filter === "ALL" || c.status === filter || c.application_stage === filter;
        const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    return (
        <div>
            <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
                <div>
                    <div className="section-title">Admin Dashboard</div>
                    <div className="section-sub">Full KYC review and decision control</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {lastLoaded && <span style={{ fontSize: 11, color: "var(--gray-400)" }}>Updated {lastLoaded.toLocaleTimeString()}</span>}
                    <button className="btn btn-secondary btn-sm" onClick={loadData} disabled={loading}>🔄 Refresh</button>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: 48 }}><LoadingSpinner text="Loading applications..." /></div>
            ) : error ? (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: 20, color: "#ef4444", marginBottom: 20 }}>
                    ⚠️ {error} <button className="btn btn-sm btn-secondary" style={{ marginLeft: 12 }} onClick={loadData}>Retry</button>
                </div>
            ) : (
                <>
                    <AnalyticsRow customers={customers} />
                    <StageChart customers={customers} />

                    {/* Filters + Search */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                        {FILTERS.map(f => (
                            <button key={f} className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-secondary"}`} onClick={() => setFilter(f)}>
                                {f.replace(/_/g, " ")}
                            </button>
                        ))}
                        <input
                            className="input-field"
                            style={{ marginLeft: "auto", maxWidth: 200, padding: "6px 12px" }}
                            placeholder="Search name or email..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Table */}
                    <div className="card">
                        {filtered.length === 0 ? (
                            <EmptyState icon="📭" title="No applications" message="No candidates match the current filter." />
                        ) : (
                            <div style={{ overflowX: "auto" }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th><th>Email</th><th>Doc Type</th><th>Risk</th><th>Score</th><th>Flags</th><th>Stage</th><th>Applied</th><th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(c => (
                                            <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => setSelectedCustomer(c)}>
                                                <td style={{ fontWeight: 700, color: "var(--navy)" }}>{c.name}</td>
                                                <td style={{ fontSize: 12, color: "var(--gray-500)" }}>{c.email}</td>
                                                <td style={{ fontSize: 12 }}>{c.doc_type || "—"}</td>
                                                <td>
                                                    <span className="badge" style={{ background: riskBg(c.risk_level), color: riskColor(c.risk_level), fontSize: 10 }}>{c.risk_level || "N/A"}</span>
                                                </td>
                                                <td style={{ fontWeight: 800, color: riskColor(c.risk_level) }}>{c.risk_score ?? "—"}</td>
                                                <td>
                                                    {(c.flags || []).length > 0
                                                        ? <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 600 }}>⚠️ {c.flags.length}</span>
                                                        : <span style={{ fontSize: 11, color: "#10b981" }}>✓ Clean</span>}
                                                </td>
                                                <td><StatusBadge status={c.application_stage} size="sm" /></td>
                                                <td style={{ fontSize: 11, color: "var(--gray-400)" }}>{formatDate(c.created_at)}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-secondary" onClick={e => { e.stopPropagation(); setSelectedCustomer(c); }}>View</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {selectedCustomer && (
                <DetailModal
                    customer={selectedCustomer}
                    user={user}
                    onClose={() => setSelectedCustomer(null)}
                    onDecision={handleDecision}
                />
            )}
        </div>
    );
}
