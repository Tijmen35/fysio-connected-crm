require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function check() {
  const { data: tasks, error } = await supabase.from('tasks').select('id, title, status, step_index, outcome_note');
  if (error) console.log(error);
  else console.log(tasks);
}
check();
