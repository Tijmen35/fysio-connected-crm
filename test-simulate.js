require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: existingTask } = await supabase
    .from("tasks")
    .select("*, pipeline:pipelines(name), patient:patients(full_name, phone)")
    .eq("id", "b0c503e2-42ad-4039-87d5-f1a49c0786f9")
    .single();

  const pipelineName = existingTask.pipeline?.name;
  console.log("pipelineName:", pipelineName);
}

run();
