
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://gjqtfgxhfhvacrabxdms.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqcXRmZ3hoZmh2YWNyYWJ4ZG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MTQ1MTAsImV4cCI6MjA4Njk5MDUxMH0.OvSnqNAKP9gG9TYBfQdL3H6LvfsmNl-Ydyo7H59zcec";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const MOCK_CUSTOMERS = [
    {
        name: "Priya Sharma",
        email: "priya@example.com",
        phone: "+91-9876543210",
        dob: "1990-05-12",
        address: "Mumbai, MH",
        doc_type: "Aadhaar",
        doc_extracted_name: "Priya K Sharma",
        doc_extracted_dob: "12/05/1990",
        risk_score: 72,
        risk_level: "HIGH",
        status: "PENDING_REVIEW",
        application_stage: "UNDER_REVIEW",
        flags: ["Name mismatch", "DOB mismatch"],
        risk_breakdown: { name_mismatch: 20, dob_mismatch: 25, duplicate_check: 15, face_match: 12 },
        created_at: "2025-02-16T10:23:00Z"
    },
    {
        name: "Rahul Mehta",
        email: "rahul@example.com",
        phone: "+91-9123456789",
        dob: "1985-11-30",
        address: "Delhi, DL",
        doc_type: "Passport",
        doc_extracted_name: "Rahul Mehta",
        doc_extracted_dob: "30/11/1985",
        risk_score: 12,
        risk_level: "LOW",
        status: "APPROVED",
        application_stage: "APPROVED",
        flags: [],
        risk_breakdown: { name_mismatch: 0, dob_mismatch: 0, duplicate_check: 5, face_match: 7 },
        created_at: "2025-02-16T09:10:00Z"
    },
    {
        name: "Ananya Patel",
        email: "ananya@example.com",
        phone: "+91-9234567890",
        dob: "1995-03-08",
        address: "Bengaluru, KA",
        doc_type: "DL",
        doc_extracted_name: "Ananya Patel",
        doc_extracted_dob: "08/03/1995",
        risk_score: 38,
        risk_level: "MEDIUM",
        status: "PENDING_REVIEW",
        application_stage: "UNDER_REVIEW",
        flags: ["Suspicious ID pattern"],
        risk_breakdown: { name_mismatch: 0, dob_mismatch: 0, duplicate_check: 20, face_match: 18 },
        created_at: "2025-02-17T08:45:00Z"
    }
];

async function seedData() {
    console.log("Seeding data...");

    for (const cust of MOCK_CUSTOMERS) {
        // 1. Insert Customer (Using insert since no unique constraint on email yet)
        const { data: customer, error: custError } = await supabase
            .from('customers')
            .insert(cust)
            .select()
            .single();

        if (custError) {
            console.error("Error inserting customer:", cust.name, custError.message);
            continue;
        }

        console.log("Inserted Customer:", customer.name);

        // 2. Insert Case if needed
        if (customer.risk_level !== "LOW") {
            const caseData = {
                customer_id: customer.id,
                customer_name: customer.name,
                reason: `${customer.risk_level} risk score detected`,
                evidence: customer.flags,
                status: "OPEN",
                priority: customer.risk_level,
                assignee: "Unassigned",
                created_at: customer.created_at
            };

            const { error: caseError } = await supabase.from('cases').insert(caseData);
            if (caseError) console.error("Error inserting case:", caseError.message);
            else console.log("  -> Case created for", customer.name);
        }
    }
    console.log("Seeding complete!");
}

seedData();
