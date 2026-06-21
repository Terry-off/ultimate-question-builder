import { describe, expect, it } from "vitest";
import { buildAnalyzeQuestionPrompt } from "@/lib/prompts/analyzeQuestion";

describe("buildAnalyzeQuestionPrompt", () => {
  it("asks the model to create custom follow-up questions instead of fixed categories", () => {
    const prompt = buildAnalyzeQuestionPrompt("AI 질문 생성 앱의 사업성을 알고 싶어.");

    expect(prompt).toContain("사용자의 질문마다");
    expect(prompt).toContain("스스로 판단");
    expect(prompt).toContain("맞춤형 후속 질문");
    expect(prompt).not.toContain("purpose는 goal, context");
    expect(prompt).not.toContain("goal, context, known_or_excluded");
  });
});
