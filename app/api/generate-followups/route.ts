import { NextResponse } from "next/server";
import { generateFollowups } from "@/lib/server/generateFollowups";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await generateFollowups(body);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data);
}
