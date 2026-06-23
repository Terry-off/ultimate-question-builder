import OpenAI from "openai";
import type { z } from "zod";
import { extractOutputText, parseJsonObject } from "./json";
import { DEFAULT_PROVIDER, type ModelProviderId } from "./modelProviders";

type ResponsesClient = {
  responses: {
    create: (request: unknown) => Promise<unknown>;
  };
};

export type RequestStructuredOutputInput<T> = {
  apiKey: string;
  provider?: ModelProviderId;
  model: string;
  prompt: string;
  schemaName: string;
  jsonSchema: Record<string, unknown>;
  schema: z.ZodType<T>;
  clientFactory?: (apiKey: string) => ResponsesClient;
  fetcher?: typeof fetch;
};

const createOpenAIClient = (apiKey: string): ResponsesClient => new OpenAI({ apiKey }) as unknown as ResponsesClient;

const createHttpError = (status: number, message: string) => Object.assign(new Error(message), { status });

const ensureOk = async (response: Response, provider: ModelProviderId) => {
  if (response.ok) return;

  let detail = `${provider} request failed`;
  try {
    detail = await response.text();
  } catch {
  }
  throw createHttpError(response.status, detail);
};

const extractClaudeText = (response: unknown) => {
  const record = response && typeof response === "object" && !Array.isArray(response)
    ? response as Record<string, unknown>
    : {};
  const content = Array.isArray(record.content) ? record.content : [];

  for (const item of content) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const part = item as Record<string, unknown>;
    if (typeof part.text === "string") return part.text;
  }

  throw new Error("Claude response did not include output text");
};

const extractGeminiText = (response: unknown) => {
  const record = response && typeof response === "object" && !Array.isArray(response)
    ? response as Record<string, unknown>
    : {};
  const candidates = Array.isArray(record.candidates) ? record.candidates : [];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) continue;
    const content = (candidate as Record<string, unknown>).content;
    if (!content || typeof content !== "object" || Array.isArray(content)) continue;
    const candidateParts = (content as Record<string, unknown>).parts;
    const parts = Array.isArray(candidateParts) ? candidateParts : [];

    for (const part of parts) {
      if (!part || typeof part !== "object" || Array.isArray(part)) continue;
      const text = (part as Record<string, unknown>).text;
      if (typeof text === "string") return text;
    }
  }

  throw new Error("Gemini response did not include output text");
};

export async function requestStructuredOutput<T>({
  apiKey,
  provider = DEFAULT_PROVIDER,
  model,
  prompt,
  schemaName,
  jsonSchema,
  schema,
  clientFactory = createOpenAIClient,
  fetcher = fetch
}: RequestStructuredOutputInput<T>): Promise<T> {
  if (provider === "anthropic") {
    const response = await fetcher("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": apiKey
      },
      body: JSON.stringify({
        model,
        max_tokens: 8192,
        messages: [{ role: "user", content: prompt }],
        output_config: {
          format: {
            type: "json_schema",
            name: schemaName,
            schema: jsonSchema
          }
        }
      })
    });
    await ensureOk(response, provider);
    return schema.parse(parseJsonObject(extractClaudeText(await response.json())));
  }

  if (provider === "google") {
    const response = await fetcher(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: jsonSchema
        }
      })
    });
    await ensureOk(response, provider);
    return schema.parse(parseJsonObject(extractGeminiText(await response.json())));
  }

  const client = clientFactory(apiKey);
  const response = await client.responses.create({
    model,
    input: prompt,
    reasoning: { effort: "medium" },
    text: {
      format: {
        type: "json_schema",
        name: schemaName,
        strict: true,
        schema: jsonSchema
      }
    }
  });
  const parsed = parseJsonObject(extractOutputText(response));
  return schema.parse(parsed);
}
