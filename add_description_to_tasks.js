const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://bebwztkmsrxrelvunqle.supabase.co",
  "sb_publishable_vtD3GJL29ovuy6UB3qR6Ew_nBt95Bwp"
);

async function run() {
  const { error } = await supabase.rpc('execute_sql', {
    sql: "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT;"
  });
  console.log("RPC Error (if any):", error);
}
run();
