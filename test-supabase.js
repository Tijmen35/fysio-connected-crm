const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://bebwztkmsrxrelvunqle.supabase.co",
  "sb_publishable_vtD3GJL29ovuy6UB3qR6Ew_nBt95Bwp"
);

async function test() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*, patient:patients(full_name, phone, email, location), pipeline:pipelines(name)");
  console.log("Task keys:", Object.keys(data[0] || {}));
  console.log("Task patient_id:", data[0]?.patient_id);
}

test();
