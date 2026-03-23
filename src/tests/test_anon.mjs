import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, anonKey);

async function testAnonAccess() {
    console.log("Testing anon access...");
    
    // Test 1: News
    const { data: news, error: newsErr } = await supabase.from('news').select('*').limit(2);
    console.log('News:', newsErr ? 'Auth Error: ' + newsErr.message : `Found ${news.length} rows`);
    
    // Test 2: Events
    const { data: events, error: evErr } = await supabase.from('events').select('*').limit(2);
    console.log('Events:', evErr ? 'Auth Error: ' + evErr.message : `Found ${events.length} rows`);

    // Test 3: Testimonials
    const { data: testm, error: mErr } = await supabase.from('testimonials').select('*').limit(2);
    console.log('Testimonials:', mErr ? 'Auth Error: ' + mErr.message : `Found ${testm.length} rows`);
}

testAnonAccess();
