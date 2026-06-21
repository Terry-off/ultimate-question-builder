import { NextResponse } from "next/server";
import { clearPersistedApiKey, readPersistedApiKey, writePersistedApiKey } from "@/lib/server/apiKeyStore";

export async function GET() {
  const apiKey = await readPersistedApiKey();
  return NextResponse.json({ hasApiKey: Boolean(apiKey) });
}

export async function POST(request: Request) {
  const body = await request.json();
  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";

  if (!apiKey) {
    await clearPersistedApiKey();
    return NextResponse.json({ hasApiKey: false });
  }

  await writePersistedApiKey(apiKey);
  return NextResponse.json({ hasApiKey: true });
}

export async function DELETE() {
  await clearPersistedApiKey();
  return NextResponse.json({ hasApiKey: false });
}
