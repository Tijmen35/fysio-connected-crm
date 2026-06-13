import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";
  const WA_BUSINESS_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "";
  
  let result = null;
  let errorMsg = null;
  
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${WA_BUSINESS_ID}/message_templates`, {
      headers: {
        Authorization: `Bearer ${WA_TOKEN}`
      },
      cache: "no-store"
    });
    
    if (!res.ok) {
      errorMsg = await res.text();
    } else {
      result = await res.json();
    }
  } catch (e: any) {
    errorMsg = e.message;
  }
  
  return NextResponse.json({
    hasToken: !!WA_TOKEN,
    tokenLength: WA_TOKEN.length,
    hasBusinessId: !!WA_BUSINESS_ID,
    businessId: WA_BUSINESS_ID,
    error: errorMsg,
    templatesCount: result?.data?.length || 0,
    result
  });
}
