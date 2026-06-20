import { describe, expect, it } from "vitest";
import { FOLLOWUP_PURPOSES, QUESTION_TYPES } from "@/lib/questionTypes";
import { FOLLOWUP_TEMPLATES, getFollowupQuestions } from "@/lib/followupTemplates";

describe("follow-up templates", () => {
  it("has exactly five follow-up questions for every type", () => {
    for (const type of QUESTION_TYPES) {
      expect(FOLLOWUP_TEMPLATES[type]).toHaveLength(5);
    }
  });

  it("covers every purpose in the expected order", () => {
    for (const type of QUESTION_TYPES) {
      expect(FOLLOWUP_TEMPLATES[type].map((item) => item.purpose)).toEqual(FOLLOWUP_PURPOSES);
    }
  });

  it("returns purpose ids that match their purpose", () => {
    const questions = getFollowupQuestions("strategy_business");

    expect(questions).toHaveLength(5);
    expect(questions[0]).toMatchObject({
      id: "goal",
      purpose: "goal"
    });
    expect(questions[1].question).toContain("제품");
  });

  it("gives four easy answer choices for every follow-up question", () => {
    for (const type of QUESTION_TYPES) {
      for (const question of getFollowupQuestions(type)) {
        expect(question.choices).toHaveLength(4);
        for (const choice of question.choices) {
          expect(choice).toMatch(/[가-힣]/);
          expect(choice.length).toBeLessThanOrEqual(40);
        }
      }
    }
  });
});
