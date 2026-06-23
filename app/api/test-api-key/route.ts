import { NextResponse } from "next/server";
import { testApiKey } from "@/lib/server/testApiKey";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await testApiKey(body);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data);
}
