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
      recommendedFollowupFocus: ["goal", "context", "known_or_excluded", "tension_or_assumption", "output_or_validation"]
    });

    expect(analysis.primaryType).toBe("strategy_business");
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
        recommendedFollowupFocus: []
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
