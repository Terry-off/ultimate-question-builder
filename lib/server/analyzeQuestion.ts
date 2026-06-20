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
  recommendedFollowupFocus: ["goal", "context", "known_or_excluded", "tension_or_assumption", "output_or_validation"],
  recommendedTypeOptions: [
    { type: "perspective_interpretation", reason: "질문을 여러 방향에서 다시 볼 수 있어요." },
    { type: "critique_risk", reason: "놓친 위험한 점을 먼저 확인할 수 있어요." },
    { type: "execution_roadmap", reason: "바로 할 일을 정리할 수 있어요." }
  ],
  followupQuestions: [
    {
      id: "goal",
      purpose: "goal",
      question: "이번 답으로 무엇을 정하고 싶나요?",
      choices: ["생각을 정리하고 싶어요", "다음 행동을 정하고 싶어요", "위험한 점을 알고 싶어요", "더 좋은 질문을 만들고 싶어요"]
    },
    {
      id: "context",
      purpose: "context",
      question: "지금 상황은 어디에 가깝나요?",
      choices: ["처음 떠올린 단계예요", "자료를 모으는 중이에요", "실행을 앞두고 있어요", "이미 해보고 있어요"]
    },
    {
      id: "known_or_excluded",
      purpose: "known_or_excluded",
      question: "빼고 싶은 답은 무엇인가요?",
      choices: ["뻔한 조언은 빼주세요", "너무 긴 설명은 싫어요", "어려운 말은 줄여주세요", "이미 아는 말은 빼주세요"]
    },
    {
      id: "tension_or_assumption",
      purpose: "tension_or_assumption",
      question: "가장 걸리는 부분은 무엇인가요?",
      choices: ["무엇이 맞는지 헷갈려요", "실패할까 걱정돼요", "사람들이 어떻게 볼지 걱정돼요", "어디서 시작할지 모르겠어요"]
    },
    {
      id: "output_or_validation",
      purpose: "output_or_validation",
      question: "어떤 답이 가장 쓰기 좋나요?",
      choices: ["짧은 결론 먼저", "할 일 목록으로", "표로 정리해서", "질문 형태로"]
    }
  ]
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
