require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: templates } = await supabase.from('templates').select('*').eq('pipeline_name', 'Leadopvolging').eq('step_index', 1);
  console.log("Template for Leadopvolging step 1:", templates);
}
check();
