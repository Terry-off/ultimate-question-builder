import { NextResponse } from "next/server";
import { analyzeQuestion } from "@/lib/server/analyzeQuestion";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await analyzeQuestion(body);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data);
}
