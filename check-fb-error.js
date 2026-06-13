import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase.from('patients').select('full_name, source, created_at').in('full_name', ['FB GRAPH API ERROR', 'FB WEBHOOK RAW LOG']).order('created_at', { ascending: false }).limit(5);
  console.log("Recent webhook errors/logs:", data);
}
run();
