import OpenAI from "openai";
import type { z } from "zod";
import { extractOutputText, parseJsonObject } from "./json";

type ResponsesClient = {
  responses: {
    create: (request: unknown) => Promise<unknown>;
  };
};

export type RequestStructuredOutputInput<T> = {
  apiKey: string;
  model: string;
  prompt: string;
  schemaName: string;
  jsonSchema: Record<string, unknown>;
  schema: z.ZodType<T>;
  clientFactory?: (apiKey: string) => ResponsesClient;
};

const createOpenAIClient = (apiKey: string): ResponsesClient => new OpenAI({ apiKey }) as unknown as ResponsesClient;

export async function requestStructuredOutput<T>({
  apiKey,
  model,
  prompt,
  schemaName,
  jsonSchema,
  schema,
  clientFactory = createOpenAIClient
}: RequestStructuredOutputInput<T>): Promise<T> {
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
