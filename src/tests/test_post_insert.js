import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env
process.loadEnvFile(join(__dirname, '../../.env'));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE env vars.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const safeISOString = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d.toISOString();
};

async function runTest() {
    console.log("Testing events insert...");
    
    // Mock the post data that AdminDashboard produces
    const postData = {
        title: { en: 'Test event', fr: 'Test', ar: 'Test' },
        date: new Date().toISOString().split('T')[0],
        end_date: undefined,
        image: '',
        description: { en: 'Desc', fr: 'Desc', ar: 'Desc' },
        name: '',
        role: { en: '', fr: '', ar: '' },
        content: { en: '', fr: '', ar: '' },
        rating: 5,
        website_url: '',
        image_url: '',
        location: undefined // Like if they didn't touch location input
    };
    
    const type = 'news';
    
    // mimic useData logic for news
    // Test updating an event
    const updateData = {
        title: postData.title,
        date: safeISOString(postData.date) || new Date().toISOString(),
        end_date: safeISOString(postData.end_date),
        image_url: postData.image,
        description: postData.description,
        location: postData.location || {},
    };

    console.log("Update Payload ->", JSON.stringify(updateData, null, 2));

    const { data: updatedData, error: updateError } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', 'some-id')
        .select()
        .single();

    if (error) {
        console.error("INSERT FAILED:");
        console.error(error);
    } else {
        console.log("INSERT SUCCEEDED:");
        console.log(data);
        
        // Clean up
        await supabase.from('events').delete().eq('id', data.id);
        console.log("Cleanup: deleted test record.");
    }
}

runTest();
