import { NextResponse } from "next/server";
import { DEFAULT_PROVIDER, isModelProviderId } from "@/lib/modelProviders";
import { clearPersistedApiKey, readPersistedApiKey, writePersistedApiKey } from "@/lib/server/apiKeyStore";

const readProvider = (value: unknown) => {
  const provider = typeof value === "string" ? value.trim() : "";
  return isModelProviderId(provider) ? provider : DEFAULT_PROVIDER;
};

const readProviderFromRequest = (request: Request) =>
  readProvider(new URL(request.url).searchParams.get("provider"));

export async function GET(request: Request) {
  const apiKey = await readPersistedApiKey(readProviderFromRequest(request));
  return NextResponse.json({ hasApiKey: Boolean(apiKey) });
}

export async function POST(request: Request) {
  const body = await request.json();
  const provider = readProvider(body.provider);
  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";

  if (!apiKey) {
    await clearPersistedApiKey(provider);
    return NextResponse.json({ hasApiKey: false });
  }

  await writePersistedApiKey(apiKey, provider);
  return NextResponse.json({ hasApiKey: true });
}

export async function DELETE(request: Request) {
  await clearPersistedApiKey(readProviderFromRequest(request));
  return NextResponse.json({ hasApiKey: false });
}
