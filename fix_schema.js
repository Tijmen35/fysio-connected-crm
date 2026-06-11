require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function fix() {
  // Try to insert a dummy variable mapping to check if column exists
  const { error } = await supabase.from('templates').update({ variable_mapping: {} }).neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) {
    console.log("Column might be missing. Error:", error.message);
  } else {
    console.log("Column exists.");
  }
}
fix();
