import { advanceWorkflow } from "@/app/actions/task";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const taskId = url.searchParams.get("taskId") || "b0c503e2-42ad-4039-87d5-f1a49c0786f9";
  
  try {
    const res = await advanceWorkflow(taskId, "niet_opgenomen");
    return NextResponse.json({ result: res });
  } catch (error) {
    return NextResponse.json({ error: String(error) });
  }
}
