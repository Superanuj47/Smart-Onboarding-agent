
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://gjqtfgxhfhvacrabxdms.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqcXRmZ3hoZmh2YWNyYWJ4ZG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MTQ1MTAsImV4cCI6MjA4Njk5MDUxMH0.OvSnqNAKP9gG9TYBfQdL3H6LvfsmNl-Ydyo7H59zcec";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugLogin() {
    console.log("Debugging Login...");

    // 1. Check total users
    const { count, error: countError } = await supabase.from('users').select('*', { count: 'exact', head: true });
    if (countError) {
        console.error("Error checking count:", countError.message);
        console.error("Hint: Check if RLS is enabled on 'users' table. If so, you need a policy to allow SELECT.");
    } else {
        console.log(`Total users in table: ${count}`);
    }

    // 2. Try to fetch the specific admin user
    const email = "staff@bank.com";
    const { data, error } = await supabase.from("users").select("*").eq('email', email);

    if (error) {
        console.error("Error fetching user:", error);
    } else {
        if (data.length === 0) {
            console.log(`❌ User '${email}' NOT FOUND.`);
            console.log("Attempting to insert default admin user...");

            const { error: insertError } = await supabase.from("users").insert([
                { email: 'staff@bank.com', password: 'admin', role: 'staff', name: 'Bank Admin' }
            ]);

            if (insertError) {
                console.error("Failed to insert user:", insertError.message);
                if (insertError.code === "42501") {
                    console.error("RLS POLICY VIOLATION: You likely have RLS enabled but no policy allowing INSERT for anonymous users.");
                }
            } else {
                console.log("✅ Default admin user inserted successfully!");
            }

        } else {
            console.log("✅ User found:", data[0]);
        }
    }
}

debugLogin();
