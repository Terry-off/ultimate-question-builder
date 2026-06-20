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
  research_fact: "리서치/사실 확인형",
  concept_learning: "개념 이해/학습형",
  perspective_interpretation: "관점 확장/해석형",
  idea_generation: "아이디어 발상형",
  strategy_business: "전략/사업/시장 분석형",
  decision_comparison: "의사결정/비교형",
  problem_diagnosis: "문제 진단/해결형",
  critique_risk: "비판/반론/리스크 검토형",
  execution_roadmap: "실행 계획/로드맵형",
  artifact_creation: "산출물 제작/구현형"
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
  goal: "목표",
  context: "맥락",
  known_or_excluded: "이미 아는 것/제외할 답변",
  tension_or_assumption: "긴장/숨은 가정",
  output_or_validation: "출력/검증 방식"
};
