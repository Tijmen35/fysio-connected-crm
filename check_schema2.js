require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function check() {
  const { data } = await supabase.from('tasks').select('*').limit(1);
  console.log("Task keys:", Object.keys(data[0] || {}));
  
  const { data: p } = await supabase.from('patients').select('*').limit(1);
  console.log("Patient keys:", Object.keys(p[0] || {}));
}
check();
