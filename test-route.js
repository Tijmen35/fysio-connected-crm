import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  let existingQuery = supabaseAdmin.from("patients").select("id");
  let email = "test@example.com";
  let phone = "0612345678";
  existingQuery = existingQuery.or(`email.eq."${email}",phone.eq."${phone}"`);
  
  const { data, error } = await existingQuery;
  console.log("Data:", data, "Error:", error);
}
run();
