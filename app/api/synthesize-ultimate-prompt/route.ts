import { NextResponse } from "next/server";
import { synthesizeUltimatePrompt } from "@/lib/server/synthesizeUltimatePrompt";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await synthesizeUltimatePrompt(body);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data);
}
