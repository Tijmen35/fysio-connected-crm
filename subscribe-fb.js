import 'dotenv/config';

async function run() {
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  if (!token) {
    console.error("Geen META_PAGE_ACCESS_TOKEN gevonden in .env.local");
    return;
  }

  console.log("Stap 1: Pagina's ophalen...");
  const meRes = await fetch('https://graph.facebook.com/v19.0/me/accounts?access_token=' + token);
  const meData = await meRes.json();
  
  if (meData.error) {
    console.error("Fout bij ophalen pagina's:", meData.error.message);
    return;
  }

  const pages = meData.data || [];
  console.log(`✓ ${pages.length} pagina's gevonden.`);

  console.log("\nStap 2: Pagina's koppelen aan jouw Meta App (voor leadgen)...");
  
  for (const page of pages) {
    if (!page.name.toLowerCase().includes("fysio")) continue; 
    
    console.log(`\nKoppelen: ${page.name} (${page.id})`);
    
    const subRes = await fetch(`https://graph.facebook.com/v19.0/${page.id}/subscribed_apps?subscribed_fields=leadgen`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${page.access_token}`
      }
    });

    const subData = await subRes.json();
    
    if (subData.success) {
      console.log(`✅ SUCCES! ${page.name} is nu officieel gekoppeld aan je app.`);
    } else {
      console.log(`❌ Mislukt voor ${page.name}:`, subData.error ? subData.error.message : subData);
    }
  }
  
  console.log("\nKlaar! Je app zal nu in de dropdown van de Lead Ads Testing Tool verschijnen voor deze pagina's.");
}

run();
