import { describe, expect, it } from "vitest";
import {
  PROMPT_HISTORY_STORAGE_KEY,
  createPromptHistoryEntry,
  readPromptHistory,
  removePromptHistoryEntry,
  upsertPromptHistory,
  writePromptHistory
} from "@/lib/promptHistory";
import type { DirectionSetting, FollowupAnswer, QuestionAnalysis, UltimatePromptResult } from "@/lib/types";

const analysis: QuestionAnalysis = {
  primaryType: "strategy_business",
  secondaryTypes: ["idea_generation"],
  confidence: 0.8,
  surfaceQuestion: "카페 콘셉트 질문",
  deeperIntent: "작은 카페의 방향을 선명하게 만들고 싶다.",
  genericAnswerRisk: "뻔한 콘셉트 추천으로 흐를 수 있다.",
  missingDimensions: ["손님", "운영 방식"],
  recommendedFollowupFocus: ["주요 손님"],
  recommendedTypeOptions: [{ type: "strategy_business", reason: "사업 방향을 먼저 봐야 해요." }],
  followupQuestions: Array.from({ length: 6 }, (_, index) => ({
    id: `question_${index + 1}`,
    purpose: `목적 ${index + 1}`,
    intent: "맥락을 더 알기 위해 묻는 질문입니다.",
    question: `질문 ${index + 1}`,
    choices: ["A", "B", "C", "D"]
  }))
};

const directionSettings: DirectionSetting[] = [
  { type: "strategy_business", reason: "사업 방향을 먼저 봐야 해요.", weight: 80 }
];

const followupAnswers: FollowupAnswer[] = analysis.followupQuestions.map((question) => ({
  id: question.id,
  purpose: question.purpose,
  question: question.question,
  answer: "선택한 답"
}));

const result: UltimatePromptResult = {
  shortVersion: "짧은 질문",
  deepVersion: "깊은 질문",
  expertVersion: "전문가 질문",
  whyThisPromptIsStrong: ["맥락이 선명합니다."],
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
  improvementSuggestions: []
};

describe("prompt history storage", () => {
  it("writes and reads local prompt history", () => {
    const entry = createPromptHistoryEntry({
      rawQuestion: "작은 카페를 어떤 콘셉트로 만들지 궁금해요.",
      analysis,
      directionSettings,
      followupAnswers,
      provider: "google",
      model: "gemini-3.5-flash",
      result
    });

    writePromptHistory(localStorage, [entry]);

    expect(JSON.parse(localStorage.getItem(PROMPT_HISTORY_STORAGE_KEY) ?? "[]")).toHaveLength(1);
    expect(readPromptHistory(localStorage)[0]?.title).toContain("작은 카페");
    expect(readPromptHistory(localStorage)[0]?.provider).toBe("google");
    expect(readPromptHistory(localStorage)[0]?.model).toBe("gemini-3.5-flash");
  });

  it("updates existing entries and removes deleted entries", () => {
    const first = createPromptHistoryEntry({
      rawQuestion: "첫 질문",
      analysis,
      directionSettings,
      followupAnswers,
      result
    });
    const updated = createPromptHistoryEntry({
      existingId: first.id,
      previousEntry: first,
      rawQuestion: "수정된 첫 질문",
      analysis,
      directionSettings,
      followupAnswers,
      result
    });

    const upserted = upsertPromptHistory([first], updated);
    expect(upserted).toHaveLength(1);
    expect(upserted[0]?.rawQuestion).toBe("수정된 첫 질문");
    expect(removePromptHistoryEntry(upserted, first.id)).toEqual([]);
  });

  it("ignores malformed saved history", () => {
    localStorage.setItem(PROMPT_HISTORY_STORAGE_KEY, "{not-json");

    expect(readPromptHistory(localStorage)).toEqual([]);
  });
});
