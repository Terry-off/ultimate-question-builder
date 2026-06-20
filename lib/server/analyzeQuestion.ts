import { requestStructuredOutput, type RequestStructuredOutputInput } from "../llm";
import { questionAnalysisJsonSchema } from "../openaiSchemas";
import { buildAnalyzeQuestionPrompt } from "../prompts/analyzeQuestion";
import { analyzeQuestionRequestSchema, questionAnalysisSchema, type AnalyzeQuestionRequest, type QuestionAnalysis } from "../types";

type ServiceResult<T> = { ok: true; data: T } | { ok: false; error: string; status: number };
type StructuredRequester = (input: RequestStructuredOutputInput<any>) => Promise<any>;

const fallbackAnalysis: QuestionAnalysis = {
  primaryType: "perspective_interpretation",
  secondaryTypes: [],
  confidence: 0.5,
  surfaceQuestion: "사용자의 질문을 더 깊게 해석해야 합니다.",
  deeperIntent: "사용자는 표면적인 답변보다 맥락과 관점이 포함된 답변을 얻고 싶어합니다.",
  genericAnswerRisk: "맥락, 목표, 긴장 지점이 없으면 일반적인 답변으로 흐를 수 있습니다.",
  missingDimensions: ["목표", "맥락", "이미 알고 있는 일반론", "숨은 가정", "검증 방식"],
  recommendedFollowupFocus: ["goal", "context", "known_or_excluded", "tension_or_assumption", "output_or_validation"]
};

export async function analyzeQuestion(
  input: unknown,
  structuredRequester: StructuredRequester = requestStructuredOutput
): Promise<ServiceResult<QuestionAnalysis>> {
  const parsed = analyzeQuestionRequestSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요.", status: 400 };
  }

  const request: AnalyzeQuestionRequest = parsed.data;
  const prompt = buildAnalyzeQuestionPrompt(request.rawQuestion);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const data = await structuredRequester({
        apiKey: request.apiKey,
        model: request.model,
        prompt: attempt === 0 ? prompt : `${prompt}\n\n이전 응답은 유효한 JSON이 아니었다. 스키마에 맞는 JSON만 출력하라.`,
        schemaName: "question_analysis",
        jsonSchema: questionAnalysisJsonSchema,
        schema: questionAnalysisSchema
      });
      return { ok: true, data };
    } catch {
      continue;
    }
  }

  return { ok: true, data: fallbackAnalysis };
}
