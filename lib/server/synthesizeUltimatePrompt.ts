import { requestStructuredOutput, type RequestStructuredOutputInput } from "../llm";
import { ultimatePromptResultJsonSchema } from "../openaiSchemas";
import { buildSynthesizeUltimatePrompt } from "../prompts/synthesizeUltimatePrompt";
import { buildImprovementSuggestions, calculateQualityScore } from "../qualityScore";
import { synthesizePromptRequestSchema, ultimatePromptResultSchema, type PromptRevision, type UltimatePromptResult } from "../types";
import { getOpenAIRequestError } from "./openaiError";

type ServiceResult<T> = { ok: true; data: T } | { ok: false; error: string; status: number };
type StructuredRequester = (input: RequestStructuredOutputInput<any>) => Promise<any>;
type ModelPromptResult = Omit<UltimatePromptResult, "qualityScore">;
type RetryReason = "invalid_output" | "unchanged_revision";

const modelOutputSchema = ultimatePromptResultSchema.omit({ qualityScore: true });
const retryInstructions: Record<RetryReason, string> = {
  invalid_output: "이전 응답은 유효한 JSON이 아니었다. 스키마에 맞는 JSON만 출력하라.",
  unchanged_revision: "이전 응답은 수정 요청을 반영하지 않고 기존 본문을 그대로 반복했다. 기존 본문을 그대로 반복하지 말고, 사용자의 추가 의견이 세 가지 버전 모두에서 눈에 보이게 드러나도록 새로 작성하라."
};

const normalizePromptText = (value: string) => value.trim().replace(/\s+/g, " ");

const repeatsSelectedRevision = (revision: PromptRevision | undefined, result: ModelPromptResult) => {
  if (!revision) return false;

  return normalizePromptText(result[revision.selectedVersion]) === normalizePromptText(revision.editedPrompt);
};

export async function synthesizeUltimatePrompt(
  input: unknown,
  structuredRequester: StructuredRequester = requestStructuredOutput
): Promise<ServiceResult<UltimatePromptResult>> {
  const parsed = synthesizePromptRequestSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요.", status: 400 };
  }

  const request = parsed.data;
  const prompt = buildSynthesizeUltimatePrompt(request);
  let retryReason: RetryReason = "invalid_output";

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const modelResult = await structuredRequester({
        apiKey: request.apiKey,
        model: request.model,
        prompt: attempt === 0 ? prompt : `${prompt}\n\n${retryInstructions[retryReason]}`,
        schemaName: "ultimate_prompt_result",
        jsonSchema: ultimatePromptResultJsonSchema,
        schema: modelOutputSchema
      });

      if (repeatsSelectedRevision(request.revision, modelResult)) {
        retryReason = "unchanged_revision";
        continue;
      }

      const qualityScore = calculateQualityScore({
        promptText: `${modelResult.shortVersion}\n${modelResult.deepVersion}\n${modelResult.expertVersion}`,
        followupAnswers: request.followupAnswers
      });
      return {
        ok: true,
        data: {
          ...modelResult,
          qualityScore,
          improvementSuggestions: [
            ...modelResult.improvementSuggestions,
            ...buildImprovementSuggestions(qualityScore)
          ]
        }
      };
    } catch (caught) {
      const openAIError = getOpenAIRequestError(caught);
      if (openAIError) return { ok: false, ...openAIError };
      if (!(caught instanceof Error)) throw caught;
      retryReason = "invalid_output";
      continue;
    }
  }

  return { ok: false, error: "궁극 질문 생성에 실패했습니다. 잠시 후 다시 시도해주세요.", status: 502 };
}
