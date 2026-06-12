import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `CREATE TABLE IF NOT EXISTS public.webhook_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      payload JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );`
  });
  console.log("Error creating table:", error);
}
run();
