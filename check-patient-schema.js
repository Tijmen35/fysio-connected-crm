import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { error } = await supabase.from('patients').insert({ full_name: 'Test No Fields', source: 'Webflow Test' });
  console.log("Insert error:", error);
}
run();
