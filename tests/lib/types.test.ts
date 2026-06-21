import { describe, expect, it } from "vitest";
import {
  analyzeQuestionRequestSchema,
  questionAnalysisSchema,
  synthesizePromptRequestSchema,
  ultimatePromptResultSchema
} from "@/lib/types";

describe("shared schemas", () => {
  it("accepts a valid analyze request", () => {
    expect(
      analyzeQuestionRequestSchema.parse({
        rawQuestion: "이 사업 아이디어가 시장에서 통할지 알고 싶어.",
        apiKey: "sk-test",
        model: "gpt-5.5"
      })
    ).toMatchObject({ model: "gpt-5.5" });
  });

  it("rejects too-short raw questions", () => {
    expect(() =>
      analyzeQuestionRequestSchema.parse({
        rawQuestion: "사업",
        apiKey: "sk-test",
        model: "gpt-5.5"
      })
    ).toThrow("질문이 너무 짧습니다");
  });

  it("accepts valid analysis output", () => {
    const analysis = questionAnalysisSchema.parse({
      primaryType: "strategy_business",
      secondaryTypes: ["idea_generation", "critique_risk"],
      confidence: 0.86,
      surfaceQuestion: "사용자는 사업 아이디어 가능성을 묻고 있다.",
      deeperIntent: "시장 가능성과 실패 가능성을 알고 싶어한다.",
      genericAnswerRisk: "고객과 검증 방식이 빠지면 일반론으로 흐른다.",
      missingDimensions: ["타깃 고객", "경쟁자", "수익 모델", "검증 방식", "성공 기준"],
      recommendedFollowupFocus: ["고객", "돈을 낼 이유", "경쟁 앱과 다른 점", "첫 검증 방법", "원하는 답변 형태"],
      recommendedTypeOptions: [
        { type: "strategy_business", reason: "사업이 될지 먼저 보고 싶어해요." },
        { type: "critique_risk", reason: "실패할 수 있는 이유도 같이 봐야 해요." },
        { type: "idea_generation", reason: "더 나은 앱 방향을 찾을 수 있어요." }
      ],
      followupQuestions: [
        {
          id: "paying_customer",
          purpose: "돈을 낼 고객",
          intent: "누가 왜 돈을 낼지 알아야 사업성 답변이 뻔해지지 않아요.",
          question: "이 앱에 돈을 낼 사람은 누구라고 생각하나요?",
          choices: ["혼자 일하는 사람", "작은 팀의 리더", "학생이나 취준생", "아직 잘 모르겠어요"]
        },
        {
          id: "job_to_solve",
          purpose: "풀고 싶은 문제",
          intent: "사용자가 실제로 아파하는 문제를 알아야 질문이 날카로워져요.",
          question: "그 사람이 지금 가장 답답해하는 일은 무엇인가요?",
          choices: ["질문을 잘 못 만들어요", "답변이 너무 뻔해요", "생각 정리가 어려워요", "바로 쓸 결과가 필요해요"]
        },
        {
          id: "willingness_to_pay",
          purpose: "돈을 낼 이유",
          intent: "무료 도구와 비교해 돈을 낼 만큼 강한 이유를 확인해야 해요.",
          question: "사용자가 돈을 낼 만큼 좋아질 부분은 무엇인가요?",
          choices: ["시간을 크게 줄여줘요", "결과 품질이 달라져요", "업무에 바로 써요", "아직 확실하지 않아요"]
        },
        {
          id: "current_alternative",
          purpose: "지금 쓰는 방법",
          intent: "기존 방법을 알아야 새 앱이 이길 지점을 찾을 수 있어요.",
          question: "지금 사람들은 이 문제를 어떻게 해결하고 있나요?",
          choices: ["그냥 ChatGPT에 물어요", "템플릿을 찾아 써요", "동료에게 물어봐요", "아예 해결하지 못해요"]
        },
        {
          id: "answer_shape",
          purpose: "받고 싶은 답",
          intent: "답변 형태가 정해져야 최종 질문을 바로 쓸 수 있어요.",
          question: "최종 답변은 어떤 모양이면 가장 쓸모 있나요?",
          choices: ["사업 판단표", "첫 실험 계획", "고객 인터뷰 질문", "위험한 점 먼저"]
        }
      ]
    });

    expect(analysis.primaryType).toBe("strategy_business");
    expect(analysis.recommendedTypeOptions).toHaveLength(3);
    expect(analysis.followupQuestions[0].purpose).toBe("돈을 낼 고객");
    expect(analysis.followupQuestions[0].intent).toContain("사업성");
    expect(analysis.followupQuestions[0].choices).toHaveLength(4);
  });

  it("accepts a synthesis request with empty follow-up answers", () => {
    const request = synthesizePromptRequestSchema.parse({
      rawQuestion: "내 앱 아이디어가 괜찮은지 알고 싶어.",
      apiKey: "sk-test",
      model: "gpt-5.5",
      analysis: {
        primaryType: "strategy_business",
        secondaryTypes: [],
        confidence: 0.5,
        surfaceQuestion: "앱 아이디어 평가",
        deeperIntent: "실제 가능성 판단",
        genericAnswerRisk: "일반적인 장단점으로 흐름",
        missingDimensions: [],
        recommendedFollowupFocus: ["고객", "검증"],
        recommendedTypeOptions: [{ type: "strategy_business", reason: "사업 가능성을 먼저 봅니다." }],
        followupQuestions: [
          { id: "customer", purpose: "고객", intent: "누구의 문제인지 알아야 해요.", question: "누가 가장 먼저 쓸 것 같나요?", choices: ["직장인", "창업자", "학생", "잘 모르겠어요"] },
          { id: "pain", purpose: "불편한 점", intent: "강한 문제인지 알아야 해요.", question: "그 사람이 무엇 때문에 답답해하나요?", choices: ["시간 부족", "품질 불만", "정리 어려움", "확신 부족"] },
          { id: "alternative", purpose: "대신 쓰는 것", intent: "비교 대상을 알아야 해요.", question: "지금은 무엇으로 해결하나요?", choices: ["ChatGPT", "검색", "사람에게 질문", "안 해요"] },
          { id: "risk", purpose: "가장 걱정되는 점", intent: "약한 고리를 알아야 해요.", question: "가장 불안한 점은 무엇인가요?", choices: ["돈을 안 냄", "차별점 부족", "개발 어려움", "홍보 어려움"] },
          { id: "output", purpose: "답변 모양", intent: "바로 쓸 수 있게 해야 해요.", question: "어떤 답이 필요하나요?", choices: ["판단표", "실험 계획", "질문 목록", "짧은 결론"] }
        ]
      },
      directionSettings: [
        { type: "strategy_business", reason: "사업 가능성을 먼저 봐야 해요.", weight: 95 },
        { type: "critique_risk", reason: "실패할 수 있는 이유도 같이 봐야 해요.", weight: 40 }
      ],
      followupAnswers: [
        { id: "customer", purpose: "고객", question: "누가 가장 먼저 쓸 것 같나요?", answer: "" },
        { id: "pain", purpose: "불편한 점", question: "그 사람이 무엇 때문에 답답해하나요?", answer: "" },
        { id: "alternative", purpose: "대신 쓰는 것", question: "지금은 무엇으로 해결하나요?", answer: "" },
        { id: "risk", purpose: "가장 걱정되는 점", question: "가장 불안한 점은 무엇인가요?", answer: "" },
        { id: "output", purpose: "답변 모양", question: "어떤 답이 필요하나요?", answer: "" }
      ]
    });

    expect(request.followupAnswers[0].answer).toBe("");
    expect(request.directionSettings[0].weight).toBe(95);
  });

  it("accepts a valid ultimate prompt result", () => {
    const result = ultimatePromptResultSchema.parse({
      shortVersion: "짧은 프롬프트",
      deepVersion: "깊은 프롬프트",
      expertVersion: "전문가 프롬프트",
      whyThisPromptIsStrong: ["숨은 가정을 요구한다."],
      qualityScore: {
        total: 90,
        context: 15,
        goal: 15,
        knownExclusions: 10,
        tension: 20,
        perspectiveCollision: 15,
        selfRefutation: 10,
        outputClarity: 5
      },
      improvementSuggestions: ["검증 기준을 더 구체화하세요."]
    });

    expect(result.qualityScore.total).toBe(90);
  });
});
