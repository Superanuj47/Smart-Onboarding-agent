
// ─────────────────────────────────────────────────────────────────────────────
// COMMON UTILS
// ─────────────────────────────────────────────────────────────────────────────

export const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export const riskColor = l => ({ HIGH: "#ef4444", MEDIUM: "#f59e0b", LOW: "#10b981" }[l] || "#6b7280");
export const riskBg = l => ({ HIGH: "#fef2f2", MEDIUM: "#fffbeb", LOW: "#f0fdf4" }[l] || "#f9fafb");

export const statusColor = s => ({
    APPLIED: "#6366f1",
    DOCUMENTS_UPLOADED: "#3b82f6",
    UNDER_REVIEW: "#f59e0b",
    INTERVIEW_SCHEDULED: "#8b5cf6",
    APPROVED: "#10b981",
    REJECTED: "#ef4444",
    COMPLETED: "#0EA5A0",
    PENDING_REVIEW: "#f59e0b",
    IN_PROGRESS: "#3b82f6",
    OPEN: "#f59e0b",
    CLOSED: "#6b7280",
    INFO_REQUESTED: "#f59e0b",
}[s] || "#6b7280");

export const statusBg = s => ({
    APPLIED: "#eef2ff",
    DOCUMENTS_UPLOADED: "#eff6ff",
    UNDER_REVIEW: "#fffbeb",
    INTERVIEW_SCHEDULED: "#f5f3ff",
    APPROVED: "#f0fdf4",
    REJECTED: "#fef2f2",
    COMPLETED: "#f0fdfc",
    PENDING_REVIEW: "#fffbeb",
    IN_PROGRESS: "#eff6ff",
    OPEN: "#fffbeb",
    CLOSED: "#f9fafb",
    INFO_REQUESTED: "#fffbeb",
}[s] || "#f9fafb");

// Onboarding stages in order
export const ONBOARDING_STAGES = [
    "APPLIED",
    "DOCUMENTS_UPLOADED",
    "UNDER_REVIEW",
    "INTERVIEW_SCHEDULED",
    "APPROVED",
    "REJECTED",
    "COMPLETED",
];

export const parseDateSafe = (d) => {
    if (!d) return null;
    if (d.includes("/")) {
        const [day, month, year] = d.split("/");
        return new Date(`${year}-${month}-${day}`);
    }
    return new Date(d);
};

export const toDDMMYYYY = (isoDate) => {
    if (!isoDate) return "";
    if (isoDate.includes("/")) return isoDate;
    const [y, m, d] = isoDate.split("-");
    return `${d}/${m}/${y}`;
};

export const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
