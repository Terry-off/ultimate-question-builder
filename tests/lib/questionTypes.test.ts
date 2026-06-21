import { describe, expect, it } from "vitest";
import { FOLLOWUP_PURPOSES, QUESTION_TYPE_LABELS, QUESTION_TYPES } from "@/lib/questionTypes";

describe("question types", () => {
  it("defines exactly ten supported question types", () => {
    expect(QUESTION_TYPES).toEqual([
      "research_fact",
      "concept_learning",
      "perspective_interpretation",
      "idea_generation",
      "strategy_business",
      "decision_comparison",
      "problem_diagnosis",
      "critique_risk",
      "execution_roadmap",
      "artifact_creation"
    ]);
  });

  it("has a Korean label for every question type", () => {
    for (const type of QUESTION_TYPES) {
      expect(QUESTION_TYPE_LABELS[type]).toMatch(/[가-힣]/);
      expect(QUESTION_TYPE_LABELS[type]).not.toContain("/");
      expect(QUESTION_TYPE_LABELS[type]).not.toContain("형");
    }
    expect(QUESTION_TYPE_LABELS.strategy_business).toBe("사업 가능성을 보고 싶어요");
    expect(QUESTION_TYPE_LABELS.decision_comparison).toBe("무엇을 고를지 정하고 싶어요");
  });

  it("defines the six follow-up purposes in product order", () => {
    expect(FOLLOWUP_PURPOSES).toEqual([
      "goal",
      "context",
      "known_or_excluded",
      "tension_or_assumption",
      "priority_or_focus",
      "output_or_validation"
    ]);
  });
});
