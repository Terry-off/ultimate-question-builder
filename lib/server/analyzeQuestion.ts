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
  missingDimensions: ["답을 어디에 쓸지", "현재 상황", "이미 아는 내용", "가장 헷갈리는 지점", "원하는 답변 모양"],
  recommendedFollowupFocus: ["답을 쓸 곳", "현재 상황", "이미 아는 내용", "가장 헷갈리는 점", "받고 싶은 답"],
  recommendedTypeOptions: [
    { type: "perspective_interpretation", reason: "질문을 여러 방향에서 다시 볼 수 있어요." },
    { type: "critique_risk", reason: "놓친 위험한 점을 먼저 확인할 수 있어요." },
    { type: "execution_roadmap", reason: "바로 할 일을 정리할 수 있어요." }
  ],
  followupQuestions: [
    {
      id: "use_case",
      purpose: "답을 쓸 곳",
      intent: "답변을 어디에 쓸지 알아야 질문이 한 방향으로 모입니다.",
      question: "이 답을 어디에 가장 먼저 쓰고 싶나요?",
      choices: ["생각을 정리하고 싶어요", "다음 행동을 정하고 싶어요", "위험한 점을 알고 싶어요", "더 좋은 질문을 만들고 싶어요"]
    },
    {
      id: "current_situation",
      purpose: "현재 상황",
      intent: "현재 위치를 알아야 너무 쉬운 답이나 너무 먼 답을 피할 수 있어요.",
      question: "지금 상황은 어디에 가깝나요?",
      choices: ["처음 떠올린 단계예요", "자료를 모으는 중이에요", "실행을 앞두고 있어요", "이미 해보고 있어요"]
    },
    {
      id: "avoid_answer",
      purpose: "피하고 싶은 답",
      intent: "원하지 않는 답을 알아야 AI가 뻔한 말로 도망가지 않습니다.",
      question: "이번 답에서 피하고 싶은 말은 무엇인가요?",
      choices: ["뻔한 조언은 빼주세요", "너무 긴 설명은 싫어요", "어려운 말은 줄여주세요", "이미 아는 말은 빼주세요"]
    },
    {
      id: "stuck_point",
      purpose: "가장 걸리는 점",
      intent: "가장 불편한 지점을 알아야 답변이 깊어집니다.",
      question: "가장 걸리는 부분은 무엇인가요?",
      choices: ["무엇이 맞는지 헷갈려요", "실패할까 걱정돼요", "사람들이 어떻게 볼지 걱정돼요", "어디서 시작할지 모르겠어요"]
    },
    {
      id: "answer_shape",
      purpose: "받고 싶은 답",
      intent: "답변 모양이 정해져야 바로 복사해 쓸 수 있는 질문이 됩니다.",
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
