require('dotenv').config({ path: '.env.local' });

const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
const WA_BUSINESS_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "";

async function getWhatsAppTemplates() {
  const res = await fetch(`https://graph.facebook.com/v19.0/${WA_BUSINESS_ID}/message_templates`, {
    headers: { Authorization: `Bearer ${WA_TOKEN}` }
  });
  const data = await res.json();
  return data.data || [];
}

async function sendWhatsAppTemplate(to, templateName, patient, mapping = {}) {
  const parameters = [];

  if (Object.keys(mapping).length === 0) {
    parameters.push({
      type: "text",
      text: (patient.full_name || "Patiënt").split(" ")[0]
    });
  } else {
    const waTemplates = await getWhatsAppTemplates();
    const t = waTemplates.find(w => w.name === templateName);
    
    let foundVars = [];
    if (t) {
      for (const comp of t.components || []) {
        if ((comp.type === "BODY" || comp.type === "body") && comp.text) {
          const matches = Array.from(comp.text.matchAll(/\{\{([^}]+)\}\}/g));
          for (const match of matches) foundVars.push(match[1]);
        }
      }
    } else {
      foundVars = Object.keys(mapping);
    }

    for (const key of foundVars) {
      const field = mapping[key];
      let val = "";
      if (field === "first_name") val = (patient.full_name || "Patiënt").split(" ")[0];
      else if (field === "full_name") val = patient.full_name || "Patiënt";
      else if (field === "phone") val = patient.phone || "";
      else if (field === "email") val = patient.email || "";
      else if (field === "location") val = patient.location || "";
      
      const paramObj = { type: "text", text: val || " " };
      if (t?.parameter_format === "NAMED") {
        paramObj.parameter_name = key;
      }
      parameters.push(paramObj);
    }
  }

  const formattedPhone = to.replace(/[\+\s\-]/g, "");

  const payload = {
    messaging_product: "whatsapp",
    to: formattedPhone,
    type: "template",
    template: {
      name: templateName,
      language: { code: "nl" },
      components: parameters.length > 0 ? [
        {
          type: "body",
          parameters: parameters
        }
      ] : []
    }
  };

  console.log("SENDING PAYLOAD:", JSON.stringify(payload, null, 2));

  const res = await fetch(`https://graph.facebook.com/v19.0/${WA_PHONE_ID}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WA_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log("RESPONSE:", JSON.stringify(data, null, 2));
}

sendWhatsAppTemplate("+31 623671176", "dag_1__na_ochtendblok", { full_name: "Tijmen Lourens", location: "Fysio Rhoon" }, { locatie: "location", voornaam: "first_name" });
