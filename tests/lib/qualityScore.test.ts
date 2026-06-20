import { describe, expect, it } from "vitest";
import { calculateQualityScore, getQualityMessage } from "@/lib/qualityScore";
import type { FollowupAnswer } from "@/lib/types";

const answers = (overrides: Partial<Record<FollowupAnswer["purpose"], string>>): FollowupAnswer[] => [
  { purpose: "goal", question: "목표", answer: overrides.goal ?? "" },
  { purpose: "context", question: "맥락", answer: overrides.context ?? "" },
  { purpose: "known_or_excluded", question: "제외", answer: overrides.known_or_excluded ?? "" },
  { purpose: "tension_or_assumption", question: "긴장", answer: overrides.tension_or_assumption ?? "" },
  { purpose: "output_or_validation", question: "출력", answer: overrides.output_or_validation ?? "" }
];

describe("quality score", () => {
  it("rewards complete answers and required prompt devices", () => {
    const score = calculateQualityScore({
      promptText: "숨은 가정과 긴장/충돌을 찾고, 관점 충돌을 보여주고, 네 결론을 반박한 뒤, 추상화와 구체적 실행/검증 방법을 제시해줘.",
      followupAnswers: answers({
        goal: "시장 검증에 쓰고 싶다.",
        context: "초기 MVP를 만들고 있다.",
        known_or_excluded: "일반적인 장단점은 제외한다.",
        tension_or_assumption: "고객이 돈을 낼 것이라는 가정이 불안하다.",
        output_or_validation: "30일 검증 실험으로 받고 싶다."
      })
    });

    expect(score.total).toBeGreaterThanOrEqual(90);
    expect(score.tension).toBe(20);
    expect(score.selfRefutation).toBe(10);
  });

  it("penalizes missing goal and context", () => {
    const score = calculateQualityScore({
      promptText: "관점에서 분석해줘.",
      followupAnswers: answers({})
    });

    expect(score.total).toBeLessThan(60);
    expect(score.goal).toBe(0);
    expect(score.context).toBe(0);
  });

  it("returns Korean score messages", () => {
    expect(getQualityMessage(92)).toContain("매우 강한 질문");
    expect(getQualityMessage(80)).toContain("좋은 질문");
    expect(getQualityMessage(65)).toContain("긴장");
    expect(getQualityMessage(40)).toContain("일반론");
  });
});
