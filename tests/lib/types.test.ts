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
      recommendedFollowupFocus: ["goal", "context", "known_or_excluded", "tension_or_assumption", "output_or_validation"],
      recommendedTypeOptions: [
        { type: "strategy_business", reason: "사업이 될지 먼저 보고 싶어해요." },
        { type: "critique_risk", reason: "실패할 수 있는 이유도 같이 봐야 해요." },
        { type: "idea_generation", reason: "더 나은 앱 방향을 찾을 수 있어요." }
      ],
      followupQuestions: [
        { id: "goal", purpose: "goal", question: "이번 답으로 무엇을 정하고 싶나요?", choices: ["사업을 계속할지 정하고 싶어요", "고객을 정하고 싶어요", "위험한 점을 알고 싶어요", "첫 실험을 정하고 싶어요"] },
        { id: "context", purpose: "context", question: "지금 아이디어는 어느 단계인가요?", choices: ["처음 떠올린 단계예요", "주변 반응을 들었어요", "간단히 만들어봤어요", "돈을 낸 사람이 있어요"] },
        { id: "known_or_excluded", purpose: "known_or_excluded", question: "이미 알고 있거나 빼고 싶은 답은 무엇인가요?", choices: ["뻔한 장단점은 빼주세요", "큰 회사 사례는 빼주세요", "기술 설명은 줄여주세요", "이미 경쟁자는 봤어요"] },
        { id: "tension_or_assumption", purpose: "tension_or_assumption", question: "가장 불안한 부분은 무엇인가요?", choices: ["고객이 돈을 낼지 모르겠어요", "경쟁 앱과 달라 보일지 걱정돼요", "혼자 만들 수 있을지 모르겠어요", "처음 고객을 찾기 어려워요"] },
        { id: "output_or_validation", purpose: "output_or_validation", question: "어떤 형태의 답이 필요하나요?", choices: ["바로 할 일 목록", "위험도 높은 순서", "검증 실험 3개", "짧은 결론 먼저"] }
      ]
    });

    expect(analysis.primaryType).toBe("strategy_business");
    expect(analysis.recommendedTypeOptions).toHaveLength(3);
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
        recommendedFollowupFocus: [],
        recommendedTypeOptions: [{ type: "strategy_business", reason: "사업 가능성을 먼저 봅니다." }],
        followupQuestions: [
          { id: "goal", purpose: "goal", question: "무엇을 정하고 싶나요?", choices: ["계속할지 정하기", "고객 정하기", "위험 보기", "첫 실험 정하기"] },
          { id: "context", purpose: "context", question: "지금 단계는 어디인가요?", choices: ["아이디어만 있어요", "조사 중이에요", "만들고 있어요", "테스트 중이에요"] },
          { id: "known_or_excluded", purpose: "known_or_excluded", question: "빼고 싶은 답은 무엇인가요?", choices: ["뻔한 말", "너무 긴 설명", "기술 이야기", "해외 사례"] },
          { id: "tension_or_assumption", purpose: "tension_or_assumption", question: "가장 걱정되는 점은 무엇인가요?", choices: ["고객", "돈", "시간", "경쟁"] },
          { id: "output_or_validation", purpose: "output_or_validation", question: "답변 형태는 무엇이 좋나요?", choices: ["목록", "표", "순서", "결론"] }
        ]
      },
      followupAnswers: [
        { purpose: "goal", question: "목표는?", answer: "" },
        { purpose: "context", question: "맥락은?", answer: "" },
        { purpose: "known_or_excluded", question: "제외할 것은?", answer: "" },
        { purpose: "tension_or_assumption", question: "긴장은?", answer: "" },
        { purpose: "output_or_validation", question: "출력은?", answer: "" }
      ]
    });

    expect(request.followupAnswers[0].answer).toBe("");
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
