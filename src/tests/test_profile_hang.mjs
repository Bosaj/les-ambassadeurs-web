import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || 'https://mimfwguttesvrmejlibq.supabase.co';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbWZ3Z3V0dGVzdnJtZWpsaWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3OTMyODgsImV4cCI6MjA4NTM2OTI4OH0.NEY7qHJ7S-FoEkx6meDx798_yTYrlgAQhQGfx-A7byo';

const supabase = createClient(url, anonKey);

async function testFetch() {
    console.log("Starting fetch for UID: 204b695b-dc68-4f8b-9488-9d31d7516946...");
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', '204b695b-dc68-4f8b-9488-9d31d7516946')
            .single();
            
        console.log("Fetch completed!");
        console.log("Data:", data);
        if (error) console.log("Error:", error);
    } catch (e) {
        console.log("Exception:", e);
    }
}

testFetch();
