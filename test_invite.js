require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const adminAuthClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await adminAuthClient.auth.admin.generateLink({
    type: "invite",
    email: "tijmen@dotbrand.nl",
  });
  console.log("Data keys:", Object.keys(data.properties));
  console.log("Action Link:", data.properties.action_link);
  console.log("Hashed Token:", data.properties.hashed_token);
  console.log("Email OTP:", data.properties.email_otp);
}
run();
