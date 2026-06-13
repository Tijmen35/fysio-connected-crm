import 'dotenv/config';

async function run() {
  const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";
  const WA_BUSINESS_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "";
  console.log("Token length:", WA_TOKEN.length);
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${WA_BUSINESS_ID}/message_templates`, {
      headers: {
        Authorization: `Bearer ${WA_TOKEN}`
      }
    });
    const data = await res.json();
    console.log("Templates fetched:", data?.data?.length || 0);
    if (!data.data) {
      console.log("Error:", data);
    }
  } catch (e) {
    console.error("Fetch failed", e);
  }
}
run();
