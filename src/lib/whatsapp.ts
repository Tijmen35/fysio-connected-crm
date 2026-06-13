export interface WhatsAppTemplate {
  name: string;
  language: string;
  status: string;
  parameter_format?: string;
  components: any[];
}

// We read from process.env inside the functions to ensure they pick up values loaded at runtime.

export async function getWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
  const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";
  const WA_BUSINESS_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "";

  if (!WA_TOKEN || !WA_BUSINESS_ID) {
    // Return mock templates if no keys are provided
    return [
      { name: "lead_opvolging_stap_1", language: "nl", status: "APPROVED", components: [] },
      { name: "lead_opvolging_stap_2", language: "nl", status: "APPROVED", components: [] },
      { name: "no_show_herinnering", language: "nl", status: "APPROVED", components: [] },
      { name: "fysiofit_intake_uitnodiging", language: "nl", status: "APPROVED", components: [] }
    ];
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${WA_BUSINESS_ID}/message_templates`, {
      headers: {
        Authorization: `Bearer ${WA_TOKEN}`
      },
      cache: "no-store"
    });
    
    if (!res.ok) throw new Error("Failed to fetch templates");
    const data = await res.json(); require("fs").appendFileSync("whatsapp_log.txt", "\n[whatsapp.ts] Response: " + JSON.stringify(data) + "\n");
    return data.data || [];
  } catch (error) {
    console.error("WhatsApp API Error:", error);
    return [];
  }
}

export function countTemplateVariables(template: WhatsAppTemplate | undefined): number {
  if (!template || !template.components) return 0;
  let count = 0;
  for (const comp of template.components) {
    if ((comp.type === "BODY" || comp.type === "body") && comp.text) {
      const matches = Array.from(comp.text.matchAll(/\{\{([^}]+)\}\}/g)) as RegExpMatchArray[];
      count += matches.length;
    }
  }
  return count;
}

export async function sendWhatsAppTemplate(to: string, templateName: string, patient: any, mapping: Record<string, string> = {}) {
  const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";
  const WA_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";

  // Fallback if no mapping is provided but variables are expected: we'll just try to send first_name
  const numVars = Math.max(Object.keys(mapping).length, 1);
  const parameters = [];

  if (Object.keys(mapping).length === 0) {
    // Legacy support: if no mapping is saved, assume the first variable is first name
    parameters.push({
      type: "text",
      text: (patient.full_name || "Patiënt").split(" ")[0]
    });
  } else {
    // To ensure exact order, we fetch the template definition and extract the variables in sequence
    const waTemplates = await getWhatsAppTemplates();
    const t = waTemplates.find(w => w.name === templateName);
    
    let foundVars: string[] = [];
    if (t) {
      for (const comp of t.components || []) {
        if ((comp.type === "BODY" || comp.type === "body") && comp.text) {
          const matches = Array.from(comp.text.matchAll(/\{\{([^}]+)\}\}/g)) as RegExpMatchArray[];
          for (const match of matches) foundVars.push(match[1]);
        }
      }
    } else {
      // Fallback if template not found: rely on Object.keys
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
      
      const paramObj: any = { type: "text", text: val || " " };
      if (t?.parameter_format === "NAMED") {
        paramObj.parameter_name = key;
      }
      
      parameters.push(paramObj); // Meta errors on empty strings
    }
  }

  if (!WA_TOKEN || !WA_PHONE_ID) {
    console.log(`[MOCK WHATSAPP] Sending template '${templateName}' to ${to}`);
    console.log(`[MOCK WHATSAPP] Parameters:`, parameters);
    return { success: true };
  }

  // Ensure number is correctly formatted for WhatsApp (strip + and spaces)
  const formattedPhone = to.replace(/[\+\s\-]/g, "");

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${WA_PHONE_ID}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WA_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: "nl" // Assuming dutch templates
          },
          components: parameters.length > 0 ? [
            {
              type: "body",
              parameters: parameters
            }
          ] : []
        }
      })
    });

    if (!res.ok) {
      const errorData = await res.json();
      require("fs").appendFileSync("whatsapp_error.txt", "\n[whatsapp.ts] Send Error: " + JSON.stringify(errorData) + "\n"); console.error("WhatsApp API Send Error:", errorData);
      return { success: false, error: JSON.stringify(errorData) };
    }

    return { success: true };
  } catch (error) {
    require("fs").appendFileSync("whatsapp_error.txt", "\n[whatsapp.ts] Network Error: " + String(error) + "\n"); console.error("WhatsApp API Network Error:", error);
    return { success: false, error: String(error) };
  }
}
