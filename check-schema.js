import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase.from("tasks").insert({
      patient_id: "aa9e8186-0df4-4710-892b-c90410278b0c",
      pipeline_id: "5cff17ad-e974-4082-a0a6-eca3b238fd42",
      title: "Terugbellen",
      description: `Bellen om 12:00`,
      status: "later",
      scheduled_for: new Date().toISOString(),
      step_index: null
    }).select();
  console.log("Insert result:", data);
  if (error) console.error("Insert error:", error);
}
run();
