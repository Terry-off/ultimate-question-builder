import { describe, expect, it, vi } from "vitest";
import { analyzeQuestion } from "@/lib/server/analyzeQuestion";

describe("analyzeQuestion service", () => {
  it("rejects too-short raw questions", async () => {
    const result = await analyzeQuestion({
      rawQuestion: "사업",
      apiKey: "sk-test",
      model: "gpt-5.5"
    });

    if (result.ok) throw new Error("Expected validation failure");
    expect(result.error).toContain("질문이 너무 짧습니다");
  });

  it("returns structured analysis from the requester", async () => {
    const requestStructuredOutput = vi.fn().mockResolvedValue({
      primaryType: "strategy_business",
      secondaryTypes: ["idea_generation"],
      confidence: 0.9,
      surfaceQuestion: "사업성 질문",
      deeperIntent: "시장 가능성 판단",
      genericAnswerRisk: "일반론 위험",
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
    });

    const result = await analyzeQuestion(
      {
        rawQuestion: "이 앱 아이디어가 사업성이 있을지 알고 싶어.",
        apiKey: "sk-test",
        model: "gpt-5.5"
      },
      requestStructuredOutput
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.primaryType).toBe("strategy_business");
      expect(result.data.followupQuestions[0].choices).toHaveLength(4);
    }
  });

  it("falls back after requester failure", async () => {
    const requestStructuredOutput = vi.fn().mockRejectedValue(new Error("bad output"));

    const result = await analyzeQuestion(
      {
        rawQuestion: "이 앱 아이디어가 사업성이 있을지 알고 싶어.",
        apiKey: "sk-test",
        model: "gpt-5.5"
      },
      requestStructuredOutput
    );

    expect(requestStructuredOutput).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.primaryType).toBe("perspective_interpretation");
  });
});
