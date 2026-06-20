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
      recommendedFollowupFocus: ["goal", "context"]
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
    if (result.ok) expect(result.data.primaryType).toBe("strategy_business");
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
