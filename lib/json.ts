export function parseJsonObject(text: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(text);

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Expected a JSON object");
  }

  return parsed as Record<string, unknown>;
}

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));

export function extractOutputText(response: unknown): string {
  if (isRecord(response) && typeof response.output_text === "string") {
    return response.output_text;
  }

  if (isRecord(response) && Array.isArray(response.output)) {
    for (const item of response.output) {
      if (!isRecord(item) || !Array.isArray(item.content)) continue;
      for (const content of item.content) {
        if (isRecord(content) && typeof content.text === "string") {
          return content.text;
        }
      }
    }
  }

  throw new Error("OpenAI response did not include output text");
}
