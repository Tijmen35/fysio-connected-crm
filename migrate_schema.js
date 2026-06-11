require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); // We actually need the service role key to bypass RLS for schema changes... wait, we can't alter schema via client API!
console.log("We can't alter schema via JS client directly, we must use REST or just let the user do it if we don't have direct DB connection.");
