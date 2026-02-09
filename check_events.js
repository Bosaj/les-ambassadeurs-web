
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mimfwguttesvrmejlibq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbWZ3Z3V0dGVzdnJtZWpsaWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3OTMyODgsImV4cCI6MjA4NTM2OTI4OH0.NEY7qHJ7S-FoEkx6meDx798_yTYrlgAQhQGfx-A7byo';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEvents() {
    console.log('Checking events with JOIN query...');
    const { data, error } = await supabase
        .from('events')
        .select('*, attendees:event_attendees(id, name, email, status, user_id)')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching events:', error);
        return;
    }

    console.log(`Found ${data.length} events.`);

    const now = new Date();
    console.log('Current Time:', now.toISOString());

    const futureEvents = data.filter(e => new Date(e.date) > now);
    console.log(`Future Events Count: ${futureEvents.length}`);

    if (futureEvents.length === 0) {
        console.log('No future events found with JOIN query.');
    } else {
        console.log('Future events found:', futureEvents);
    }
}

checkEvents();
