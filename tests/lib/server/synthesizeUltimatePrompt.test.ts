import { describe, expect, it, vi } from "vitest";
import { synthesizeUltimatePrompt } from "@/lib/server/synthesizeUltimatePrompt";

const validInput = {
  rawQuestion: "AI로 질문을 더 잘 만들게 도와주는 앱을 만들고 싶어.",
  apiKey: "sk-test",
  model: "gpt-5.5",
  analysis: {
    primaryType: "strategy_business",
    secondaryTypes: ["idea_generation"],
    confidence: 0.9,
    surfaceQuestion: "사업성 질문",
    deeperIntent: "시장 가능성과 실패 가능성을 알고 싶어한다.",
    genericAnswerRisk: "일반적인 장단점으로 흐를 수 있다.",
    missingDimensions: ["고객", "경쟁자"],
    recommendedFollowupFocus: ["goal", "context"],
    recommendedTypeOptions: [
      { type: "strategy_business", reason: "사업 가능성을 먼저 봐야 해요." },
      { type: "critique_risk", reason: "실패할 수 있는 이유도 같이 봐야 해요." }
    ],
    followupQuestions: [
      { id: "goal", purpose: "goal", question: "무엇을 정하고 싶나요?", choices: ["사업을 계속할지 정하기", "고객 정하기", "위험 보기", "첫 실험 정하기"] },
      { id: "context", purpose: "context", question: "지금 단계는 어디인가요?", choices: ["아이디어만 있어요", "조사 중이에요", "만들고 있어요", "테스트 중이에요"] },
      { id: "known_or_excluded", purpose: "known_or_excluded", question: "빼고 싶은 답은 무엇인가요?", choices: ["뻔한 말", "너무 긴 설명", "기술 이야기", "해외 사례"] },
      { id: "tension_or_assumption", purpose: "tension_or_assumption", question: "가장 걱정되는 점은 무엇인가요?", choices: ["고객", "돈", "시간", "경쟁"] },
      { id: "output_or_validation", purpose: "output_or_validation", question: "답변 형태는 무엇이 좋나요?", choices: ["목록", "표", "순서", "결론"] }
    ]
  },
  followupAnswers: [
    { purpose: "goal", question: "목표", answer: "시장 검증에 쓰고 싶다." },
    { purpose: "context", question: "맥락", answer: "초기 MVP를 만들고 있다." },
    { purpose: "known_or_excluded", question: "제외", answer: "일반적인 조언은 제외한다." },
    { purpose: "tension_or_assumption", question: "긴장", answer: "사용자가 돈을 낼지 모르겠다." },
    { purpose: "output_or_validation", question: "출력", answer: "30일 검증 실험으로 받고 싶다." }
  ]
} as const;

describe("synthesizeUltimatePrompt service", () => {
  it("adds rule-based score to structured model output", async () => {
    const requestStructuredOutput = vi.fn().mockResolvedValue({
      shortVersion: "숨은 가정과 관점 충돌, 반박, 실행/검증 방법을 중심으로 분석해줘.",
      deepVersion: "긴장/충돌과 관점 충돌을 분석하고 네 결론을 반박한 뒤 추상화와 구체적 실행을 연결해줘.",
      expertVersion: "숨은 가정, 통념 반박, 자기반박, 추상/구체 왕복, 실행/검증 실험을 포함해줘.",
      whyThisPromptIsStrong: ["일반론을 제외하고 사고 장치를 강제한다."],
      improvementSuggestions: []
    });

    const result = await synthesizeUltimatePrompt(validInput, requestStructuredOutput);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.deepVersion).toContain("관점 충돌");
      expect(result.data.qualityScore.total).toBeGreaterThan(70);
    }
  });

  it("returns an error after two synthesis failures", async () => {
    const requestStructuredOutput = vi.fn().mockRejectedValue(new Error("bad output"));
    const result = await synthesizeUltimatePrompt(validInput, requestStructuredOutput);

    expect(requestStructuredOutput).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("궁극 질문 생성에 실패했습니다");
  });
});
