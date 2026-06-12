import { NextResponse } from "next/server";
import { sendWhatsAppTemplate } from "@/lib/whatsapp";

export async function GET(request: Request) {
  try {
    const res = await sendWhatsAppTemplate("+31 623671176", "dag_1__na_ochtendblok", { full_name: "Tijmen Lourens", location: "Fysio Barendrecht" }, { locatie: "location", voornaam: "first_name" });
    return NextResponse.json({ result: res });
  } catch (error) {
    return NextResponse.json({ error: String(error) });
  }
}
