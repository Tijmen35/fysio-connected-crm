import 'dotenv/config';

async function run() {
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${process.env.META_WABA_ID}/message_templates?access_token=${process.env.META_ACCESS_TOKEN}`);
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
