import { z } from "zod";
import { requestStructuredOutput, type RequestStructuredOutputInput } from "../llm";
import { DEFAULT_MODEL, modelProviderSchema } from "../types";
import { isKnownProviderModel } from "../modelProviders";
import { getModelRequestError } from "./openaiError";

const apiKeyTestRequestSchema = z.object({
  apiKey: z.string().trim().min(1, "API 키를 입력해주세요."),
  provider: modelProviderSchema,
  model: z.string().trim().min(1).default(DEFAULT_MODEL)
}).refine((request) => isKnownProviderModel(request.provider, request.model), {
  path: ["model"],
  message: "선택한 모델을 확인해주세요."
});

const apiKeyTestResponseSchema = z.object({
  ok: z.literal(true)
});

const apiKeyTestJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    ok: { type: "boolean" }
  },
  required: ["ok"]
} as const;

type ApiKeyTestResponse = z.infer<typeof apiKeyTestResponseSchema>;
type ServiceResult<T> = { ok: true; data: T } | { ok: false; error: string; status: number };
type StructuredRequester = (input: RequestStructuredOutputInput<ApiKeyTestResponse>) => Promise<ApiKeyTestResponse>;

export async function testApiKey(
  input: unknown,
  structuredRequester: StructuredRequester = requestStructuredOutput
): Promise<ServiceResult<ApiKeyTestResponse>> {
  const parsed = apiKeyTestRequestSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "API 키와 모델을 확인해주세요.", status: 400 };
  }

  const request = parsed.data;

  try {
    const data = await structuredRequester({
      apiKey: request.apiKey,
      provider: request.provider,
      model: request.model,
      prompt: "API 연결 테스트입니다. 아래 JSON만 그대로 응답하세요.\n{\"ok\":true}",
      schemaName: "api_key_test",
      jsonSchema: apiKeyTestJsonSchema,
      schema: apiKeyTestResponseSchema
    });
    return { ok: true, data };
  } catch (caught) {
    const modelError = getModelRequestError(caught, request.provider);
    if (modelError) return { ok: false, ...modelError };
    if (!(caught instanceof Error)) throw caught;
    return { ok: false, error: "API 연결을 확인하지 못했어요. 키와 모델을 다시 확인해주세요.", status: 502 };
  }
}
