require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  // Try an update to see if description exists
  const { error } = await supabase.from('tasks').update({ description: '' }).neq('id', '0');
  if (error) {
    console.log("Error:", error.message);
  } else {
    console.log("Column exists.");
  }
}
run();
