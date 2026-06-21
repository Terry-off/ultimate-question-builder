import { NextResponse } from "next/server";
import { synthesizeUltimatePrompt } from "@/lib/server/synthesizeUltimatePrompt";
import { resolveStoredApiKey } from "@/lib/server/apiKeyStore";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await synthesizeUltimatePrompt(await resolveStoredApiKey(body));

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data);
}
