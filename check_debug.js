require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: tasks } = await supabase.from('tasks').select('id, pipeline_id, step_index, status');
  const { data: templates } = await supabase.from('templates').select('*');
  const { data: pipelines } = await supabase.from('pipelines').select('*');
  
  console.log("Tasks:", tasks);
  console.log("Pipelines:", pipelines);
  console.log("Templates (sample):", templates.slice(0, 3));
}
check();
