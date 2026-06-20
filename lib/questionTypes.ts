export const QUESTION_TYPES = [
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
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  research_fact: "사실을 확인하고 싶어요",
  concept_learning: "쉽게 이해하고 싶어요",
  perspective_interpretation: "다른 관점으로 보고 싶어요",
  idea_generation: "아이디어를 더 얻고 싶어요",
  strategy_business: "사업 가능성을 보고 싶어요",
  decision_comparison: "무엇을 고를지 정하고 싶어요",
  problem_diagnosis: "문제 원인을 찾고 싶어요",
  critique_risk: "위험한 점을 미리 보고 싶어요",
  execution_roadmap: "실행 순서를 짜고 싶어요",
  artifact_creation: "바로 쓸 결과물을 만들고 싶어요"
};

export const QUESTION_TYPE_HELP_TEXT: Record<QuestionType, string> = {
  research_fact: "정확한 정보와 근거가 필요할 때",
  concept_learning: "어려운 내용을 쉬운 말로 알고 싶을 때",
  perspective_interpretation: "한 가지 답보다 여러 시선이 필요할 때",
  idea_generation: "새로운 선택지나 방향을 넓히고 싶을 때",
  strategy_business: "고객, 시장, 돈이 될 가능성을 보고 싶을 때",
  decision_comparison: "여러 선택지 중 무엇이 나은지 보고 싶을 때",
  problem_diagnosis: "왜 안 되는지 원인을 찾고 싶을 때",
  critique_risk: "놓친 위험과 반대 의견을 보고 싶을 때",
  execution_roadmap: "무엇부터 할지 순서를 정하고 싶을 때",
  artifact_creation: "문서, 기획안, 코드처럼 결과물이 필요할 때"
};

export const FOLLOWUP_PURPOSES = [
  "goal",
  "context",
  "known_or_excluded",
  "tension_or_assumption",
  "output_or_validation"
] as const;

export type FollowupPurpose = (typeof FOLLOWUP_PURPOSES)[number];

export const FOLLOWUP_PURPOSE_LABELS: Record<FollowupPurpose, string> = {
  goal: "정하고 싶은 것",
  context: "지금 상황",
  known_or_excluded: "빼고 싶은 답",
  tension_or_assumption: "가장 걱정되는 점",
  output_or_validation: "받고 싶은 답"
};
