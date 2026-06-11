require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) console.log("No profiles table", error.message);
  else console.log("Profiles table exists", data);
}
run();
