// ─────────────────────────────────────────────────────────────────────────────
// SUPABASE + LOCAL FALLBACK DB
// ─────────────────────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const isSupabaseConfigured = () =>
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes("YOUR_PROJECT_ID");

const supabase = isSupabaseConfigured()
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

const genId = (prefix) => prefix + Date.now() + Math.floor(Math.random() * 1000);

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL FALLBACK DATA
// ─────────────────────────────────────────────────────────────────────────────
const LOCAL_DB = {
    users: [
        { id: "u001", email: "admin@bank.com", password: "admin", role: "admin", name: "Bank Admin" },
        { id: "u002", email: "hr@bank.com", password: "hr123", role: "hr", name: "HR Manager" },
        { id: "u003", email: "candidate@example.com", password: "pass123", role: "candidate", name: "Demo Candidate" },
    ],
    customers: [
        {
            id: "c001", user_id: "u003",
            name: "Priya Sharma", email: "priya@example.com", phone: "+91-9876543210",
            dob: "12/05/1990", address: "Mumbai, MH",
            doc_type: "Aadhaar", doc_number: "1234 5678 9012",
            doc_extracted_name: "Priya K Sharma", doc_extracted_dob: "12/05/1990",
            document_url: null, selfie_url: null, ocr_raw_text: null,
            risk_score: 72, risk_level: "HIGH",
            status: "PENDING_REVIEW", application_stage: "UNDER_REVIEW",
            flags: ["Name mismatch"],
            risk_breakdown: { name_mismatch: 20, dob_mismatch: 0, duplicate_id: 15, face_match: 12, location_anomaly: 0 },
            interview_scheduled_at: null, interviewed_by: null,
            created_at: "2025-02-16T10:23:00Z", updated_at: "2025-02-16T10:23:00Z"
        },
        {
            id: "c002", user_id: "u003",
            name: "Rahul Mehta", email: "rahul@example.com", phone: "+91-9123456789",
            dob: "30/11/1985", address: "Delhi, DL",
            doc_type: "Passport", doc_number: "P1234567",
            doc_extracted_name: "Rahul Mehta", doc_extracted_dob: "30/11/1985",
            document_url: null, selfie_url: null, ocr_raw_text: null,
            risk_score: 12, risk_level: "LOW",
            status: "APPROVED", application_stage: "APPROVED",
            flags: [],
            risk_breakdown: { name_mismatch: 0, dob_mismatch: 0, duplicate_id: 5, face_match: 7, location_anomaly: 0 },
            interview_scheduled_at: null, interviewed_by: null,
            created_at: "2025-02-16T09:10:00Z", updated_at: "2025-02-16T09:10:00Z"
        },
        {
            id: "c003", user_id: "u003",
            name: "Ananya Patel", email: "ananya@example.com", phone: "+91-9234567890",
            dob: "08/03/1995", address: "Bengaluru, KA",
            doc_type: "DL", doc_number: "KA0120190001234",
            doc_extracted_name: "Ananya Patel", doc_extracted_dob: "08/03/1995",
            document_url: null, selfie_url: null, ocr_raw_text: null,
            risk_score: 38, risk_level: "MEDIUM",
            status: "PENDING_REVIEW", application_stage: "INTERVIEW_SCHEDULED",
            flags: ["Suspicious ID pattern"],
            risk_breakdown: { name_mismatch: 0, dob_mismatch: 0, duplicate_id: 20, face_match: 18, location_anomaly: 0 },
            interview_scheduled_at: "2025-02-20T10:00:00Z", interviewed_by: "HR Manager",
            created_at: "2025-02-17T08:45:00Z", updated_at: "2025-02-17T08:45:00Z"
        },
    ],
    cases: [
        { id: "case001", customer_id: "c001", customer_name: "Priya Sharma", reason: "High risk + name mismatch", evidence: ["Name mismatch"], status: "OPEN", priority: "HIGH", assignee: "Bank Admin", notes: [], created_at: "2025-02-16T10:25:00Z" },
    ],
    audit_logs: [
        { id: "a001", event: "APPLICATION_SUBMITTED", user_id: "c002", actor: "CANDIDATE", detail: "Application form submitted", created_at: "2025-02-16T09:10:00Z" },
        { id: "a002", event: "DOCUMENT_UPLOADED", user_id: "c002", actor: "CANDIDATE", detail: "Passport document uploaded", created_at: "2025-02-16T09:12:00Z" },
        { id: "a003", event: "RISK_CALCULATED", user_id: "c002", actor: "RISK_ENGINE", detail: "Risk score: 12 (LOW)", created_at: "2025-02-16T09:13:00Z" },
        { id: "a004", event: "AUTO_APPROVED", user_id: "c002", actor: "SYSTEM", detail: "Auto-approved due to low risk", created_at: "2025-02-16T09:13:30Z" },
    ]
};

// ─────────────────────────────────────────────────────────────────────────────
// DB METHODS
// ─────────────────────────────────────────────────────────────────────────────
const DB = {
    isSupabase: isSupabaseConfigured,

    // ── Customers ──────────────────────────────────────────────────────────────
    async getCustomers() {
        if (isSupabaseConfigured()) {
            const { data, error } = await supabase.from("customers").select("*").order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        }
        return [...LOCAL_DB.customers];
    },

    async addCustomer(d) {
        if (isSupabaseConfigured()) {
            const { data, error } = await supabase.from("customers").insert(d).select().single();
            if (error) throw error;
            return data;
        }
        const c = { ...d, id: genId("c"), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        LOCAL_DB.customers.push(c);
        return c;
    },

    async updateCustomer(id, patch) {
        if (isSupabaseConfigured()) {
            const { data, error } = await supabase.from("customers")
                .update({ ...patch, updated_at: new Date().toISOString() })
                .eq('id', id).select().single();
            if (error) throw error;
            return data;
        }
        const i = LOCAL_DB.customers.findIndex(x => x.id === id);
        if (i >= 0) Object.assign(LOCAL_DB.customers[i], patch, { updated_at: new Date().toISOString() });
        return LOCAL_DB.customers[i];
    },

    // ── Cases ──────────────────────────────────────────────────────────────────
    async getCases() {
        if (isSupabaseConfigured()) {
            const { data, error } = await supabase.from("cases").select("*").order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        }
        return [...LOCAL_DB.cases].reverse();
    },

    async addCase(d) {
        if (isSupabaseConfigured()) {
            const { data, error } = await supabase.from("cases").insert(d).select().single();
            if (error) throw error;
            return data;
        }
        const c = { ...d, id: genId("case"), created_at: new Date().toISOString() };
        LOCAL_DB.cases.unshift(c);
        return c;
    },

    async updateCase(id, patch) {
        if (isSupabaseConfigured()) {
            const { data, error } = await supabase.from("cases").update(patch).eq('id', id).select().single();
            if (error) throw error;
            return data;
        }
        const i = LOCAL_DB.cases.findIndex(x => x.id === id);
        if (i >= 0) Object.assign(LOCAL_DB.cases[i], patch);
        return LOCAL_DB.cases[i];
    },

    // ── Audit Logs ─────────────────────────────────────────────────────────────
    async getLogs() {
        if (isSupabaseConfigured()) {
            const { data, error } = await supabase.from("audit_logs").select("*").order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        }
        return [...LOCAL_DB.audit_logs].reverse();
    },

    async addLog(d) {
        if (isSupabaseConfigured()) {
            const { data, error } = await supabase.from("audit_logs").insert(d).select().single();
            if (error) console.error("Log error", error);
            return data;
        }
        const l = { ...d, id: genId("a"), created_at: new Date().toISOString() };
        LOCAL_DB.audit_logs.unshift(l);
        return l;
    },

    // ── Auth ───────────────────────────────────────────────────────────────────
    async login(email, password, role) {
        if (isSupabaseConfigured()) {
            const { data, error } = await supabase.from("users")
                .select("*")
                .eq('email', email)
                .eq('password', password)
                .eq('role', role);
            if (error) throw error;
            return data.length > 0 ? data[0] : null;
        }
        return LOCAL_DB.users.find(u =>
            u.email === email && u.password === password && u.role === role
        ) || null;
    },

    async signup(email, password, name, role = "candidate") {
        const newUser = { email, password, name, role };
        if (isSupabaseConfigured()) {
            const { data, error } = await supabase.from("users").insert(newUser).select().single();
            if (error) throw error;
            return data;
        }
        const exists = LOCAL_DB.users.find(u => u.email === email);
        if (exists) throw new Error("User already exists");
        const u = { ...newUser, id: genId("u"), created_at: new Date().toISOString() };
        LOCAL_DB.users.push(u);
        return u;
    },

    // ── File Storage ───────────────────────────────────────────────────────────
    async uploadFile(bucket, path, file) {
        if (!isSupabaseConfigured() || !supabase) {
            // Return a fake local URL when no Supabase
            return { url: URL.createObjectURL(file), path };
        }
        const { error } = await supabase.storage.from(bucket).upload(path, file, {
            cacheControl: '3600',
            upsert: true
        });
        if (error) throw error;
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
        return { url: urlData.publicUrl, path };
    },
};

export default DB;
export { supabase };
