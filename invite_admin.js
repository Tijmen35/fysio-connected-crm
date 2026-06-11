require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const adminAuthClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log("Generating invite link...");
  const { data, error } = await adminAuthClient.auth.admin.generateLink({
    type: "invite",
    email: "tijmen@dotbrand.nl",
    options: {
      data: {
        role: "admin",
        full_name: "Tijmen Lourens"
      }
    }
  });

  if (error) {
    console.error("Invite error:", error);
    return;
  }

  console.log("Invite link generated successfully!");
  
  // Construct the PKCE compatible link using the /auth/confirm route!
  const hashedToken = data.properties.hashed_token;
  const siteUrl = "http://localhost:3000";
  const inviteLink = `${siteUrl}/auth/confirm?token_hash=${hashedToken}&type=invite&next=/update-password`;

  console.log("Sending email via Resend with correct link:", inviteLink);
  try {
    const res = await resend.emails.send({
      from: "Fysio Connected <onboarding@resend.dev>",
      to: "tijmen@dotbrand.nl",
      subject: "CORRECTIE 2: Je bent beheerder gemaakt van Fysio Connected CRM",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0f172a;">Welkom als Beheerder!</h2>
          <p>Beste Tijmen Lourens,</p>
          <p>Mijn excuses voor het ongemak! De verificatieserver had een striktere 'PKCE' authenticatie flow nodig, waardoor de link als verlopen werd gemarkeerd. Bij deze de correcte beveiligde link.</p>
          <p>Klik op de onderstaande knop om je wachtwoord en je Tweestapsverificatie (MFA) in te stellen.</p>
          <a href="${inviteLink}" style="display: inline-block; background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">Wachtwoord & 2FA Instellen</a>
          <p style="margin-top: 30px; font-size: 12px; color: #64748b;">Deze link is 24 uur geldig.</p>
        </div>
      `
    });
    console.log("Email sent successfully!", res);
  } catch (e) {
    console.error("Resend error:", e);
  }
}
run();
