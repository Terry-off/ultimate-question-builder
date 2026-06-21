import { describe, expect, it } from "vitest";
import { calculateQualityScore, getQualityMessage } from "@/lib/qualityScore";
import type { FollowupAnswer } from "@/lib/types";

const answers = (overrides: Partial<Record<"goal" | "context" | "known" | "tension" | "output", string>>): FollowupAnswer[] => [
  { id: "use_case", purpose: "답을 쓸 곳", question: "이 답을 어디에 쓰고 싶나요?", answer: overrides.goal ?? "" },
  { id: "customer", purpose: "고객과 현재 상황", question: "누가 지금 어떤 상황에 있나요?", answer: overrides.context ?? "" },
  { id: "avoid", purpose: "피하고 싶은 답", question: "어떤 답은 빼고 싶나요?", answer: overrides.known ?? "" },
  { id: "concern", purpose: "가장 걱정되는 점", question: "가장 불안한 점은 무엇인가요?", answer: overrides.tension ?? "" },
  { id: "answer_shape", purpose: "답변 모양", question: "어떤 답변 형태가 필요하나요?", answer: overrides.output ?? "" }
];

describe("quality score", () => {
  it("rewards complete answers and required prompt devices", () => {
    const score = calculateQualityScore({
        promptText: "숨은 가정과 긴장/충돌을 찾고, 관점 충돌을 보여주고, 네 결론을 반박한 뒤, 추상화와 구체적 실행/검증 방법을 제시해줘.",
        followupAnswers: answers({
          goal: "시장 검증에 쓰고 싶다.",
          context: "초기 MVP를 만들고 있다.",
          known: "일반적인 장단점은 제외한다.",
          tension: "고객이 돈을 낼 것이라는 가정이 불안하다.",
          output: "30일 검증 실험으로 받고 싶다."
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
