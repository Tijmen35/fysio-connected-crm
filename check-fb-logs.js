import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase.from('patients').select('full_name, source, created_at').in('full_name', ['FB WEBHOOK RAW LOG', 'FB GRAPH API ERROR']).order('created_at', { ascending: false }).limit(5);
  console.log("Found webhook logs:", data);
}
run();
