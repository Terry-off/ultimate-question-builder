import type { FollowupPurpose, QuestionType } from "./questionTypes";

export type FollowupQuestion = {
  id: FollowupPurpose;
  purpose: FollowupPurpose;
  question: string;
};

type TemplateItem = Omit<FollowupQuestion, "id">;

const withIds = (items: TemplateItem[]): FollowupQuestion[] =>
  items.map((item) => ({ id: item.purpose, ...item }));

export const FOLLOWUP_TEMPLATES: Record<QuestionType, FollowupQuestion[]> = {
  research_fact: withIds([
    { purpose: "goal", question: "이 정보를 어떤 목적으로 확인하려고 하나요? 예: 의사결정, 보고서, 콘텐츠, 투자 판단, 단순 이해." },
    { purpose: "context", question: "정확히 어떤 범위의 정보를 알고 싶나요? 예: 국가, 산업, 기업, 기간, 특정 사건." },
    { purpose: "known_or_excluded", question: "이미 알고 있는 내용이나 제외하고 싶은 일반론은 무엇인가요?" },
    { purpose: "tension_or_assumption", question: "이 주제에서 비교하고 싶은 입장, 논쟁 지점, 혹은 의심되는 통념이 있나요?" },
    { purpose: "output_or_validation", question: "최종 답변은 어떤 형식이면 좋나요? 예: 요약, 표, 타임라인, 출처 중심 분석, 브리핑." }
  ]),
  concept_learning: withIds([
    { purpose: "goal", question: "이 개념을 왜 이해하려고 하나요? 예: 공부, 업무 적용, 사업 기획, 의사결정, 발표 준비." },
    { purpose: "context", question: "현재 이 주제에 대해 어느 정도 알고 있나요? 초보, 중급, 실무 경험 있음 중 어디에 가까운가요?" },
    { purpose: "known_or_excluded", question: "이미 알고 있는 설명이나 반복해서 듣고 싶지 않은 일반론은 무엇인가요?" },
    { purpose: "tension_or_assumption", question: "특히 헷갈리는 부분, 오해하고 있을까 걱정되는 부분, 서로 충돌하는 개념은 무엇인가요?" },
    { purpose: "output_or_validation", question: "답변 후 어떤 결과물이 있으면 좋나요? 예: 쉬운 비유, 구조도, 체크리스트, 학습 로드맵, 퀴즈." }
  ]),
  perspective_interpretation: withIds([
    { purpose: "goal", question: "이 주제를 어떤 용도로 깊게 이해하고 싶나요? 예: 글쓰기, 토론, 전략 판단, 자기 사고 확장." },
    { purpose: "context", question: "이 주제에 대해 지금 당신이 가진 생각이나 가설은 무엇인가요?" },
    { purpose: "known_or_excluded", question: "흔한 답변 중에서 듣고 싶지 않은 일반론은 무엇인가요?" },
    { purpose: "tension_or_assumption", question: "이 주제에서 가장 불편하거나 논쟁적인 지점은 무엇이라고 생각하나요?" },
    { purpose: "output_or_validation", question: "어떤 관점들을 충돌시켜보고 싶나요? 예: 경제학자, 예술가, 철학자, 창업자, 노동자, 미래학자." }
  ]),
  idea_generation: withIds([
    { purpose: "goal", question: "아이디어를 통해 최종적으로 얻고 싶은 것은 무엇인가요? 예: 사업, 콘텐츠, 앱, 프로젝트, 수익화, 실험." },
    { purpose: "context", question: "어떤 분야, 문제 영역, 사용자군에서 아이디어를 찾고 싶나요?" },
    { purpose: "known_or_excluded", question: "이미 떠올린 아이디어나 제외하고 싶은 뻔한 아이디어는 무엇인가요?" },
    { purpose: "tension_or_assumption", question: "원하는 새로움의 정도는 어느 쪽인가요? 현실적인 아이디어, 독특한 아이디어, 매우 실험적인 아이디어 중 골라주세요." },
    { purpose: "output_or_validation", question: "좋은 아이디어를 판단하는 기준은 무엇인가요? 예: 수익성, 실행 가능성, 차별성, 빠른 검증, 장기 확장성." }
  ]),
  strategy_business: withIds([
    { purpose: "goal", question: "이 분석을 통해 얻고 싶은 최종 결과는 무엇인가요? 예: 포지셔닝, 시장 검증, 차별화, 수익 모델, 투자 판단." },
    { purpose: "context", question: "현재 다루는 제품, 서비스, 사업 아이디어를 한 문장으로 설명해주세요." },
    { purpose: "known_or_excluded", question: "이미 알고 있거나 제외하고 싶은 일반적인 사업 조언은 무엇인가요?" },
    { purpose: "tension_or_assumption", question: "당신이 현재 믿고 있는 핵심 가정은 무엇인가요? 예: 고객은 이 문제에 돈을 낼 것이다, 경쟁자는 쉽게 따라오지 못할 것이다." },
    { purpose: "output_or_validation", question: "최종 답변에서 원하는 것은 무엇인가요? 예: 전략 옵션, 리스크 분석, 검증 실험, 포지셔닝 문장, 실행 로드맵." }
  ]),
  decision_comparison: withIds([
    { purpose: "goal", question: "이 결정을 통해 얻고 싶은 가장 중요한 결과는 무엇인가요?" },
    { purpose: "context", question: "비교하려는 선택지들을 구체적으로 적어주세요." },
    { purpose: "known_or_excluded", question: "이미 알고 있는 장단점이나 제외하고 싶은 뻔한 비교 기준은 무엇인가요?" },
    { purpose: "tension_or_assumption", question: "이 선택에서 가장 갈등되는 기준은 무엇인가요? 예: 돈 vs 자유, 안정성 vs 성장, 단기 이익 vs 장기 가능성." },
    { purpose: "output_or_validation", question: "최종 답변은 어떤 방식이면 좋나요? 예: 추천 결론, 조건부 판단, 점수표, 리스크 분석, 30일 실험." }
  ]),
  problem_diagnosis: withIds([
    { purpose: "goal", question: "이 문제가 해결되었다고 판단할 기준은 무엇인가요?" },
    { purpose: "context", question: "현재 문제가 어떤 현상으로 나타나고 있나요? 숫자, 사례, 반복 패턴이 있다면 적어주세요." },
    { purpose: "known_or_excluded", question: "지금까지 시도한 해결책과 그 결과는 무엇인가요?" },
    { purpose: "tension_or_assumption", question: "당신이 의심하는 원인은 무엇이고, 반대로 아닐 수도 있는 가능성은 무엇인가요?" },
    { purpose: "output_or_validation", question: "최종 답변은 어떤 형태이면 좋나요? 예: 원인 분석, 해결 실험, 우선순위, 체크리스트, 실행 계획." }
  ]),
  critique_risk: withIds([
    { purpose: "goal", question: "비판을 통해 최종적으로 얻고 싶은 것은 무엇인가요? 예: 폐기 여부, 개선안, 리스크 파악, 반론에 강한 버전." },
    { purpose: "context", question: "검토받고 싶은 주장, 아이디어, 계획을 구체적으로 적어주세요." },
    { purpose: "known_or_excluded", question: "이미 알고 있는 약점이나 듣고 싶지 않은 뻔한 비판은 무엇인가요?" },
    { purpose: "tension_or_assumption", question: "가장 두렵지만 확인해야 하는 실패 가능성이나 숨은 가정은 무엇인가요?" },
    { purpose: "output_or_validation", question: "최종 답변은 어떤 형식이면 좋나요? 예: 치명도 순위, 반론 목록, 보완 전략, 검증 실험." }
  ]),
  execution_roadmap: withIds([
    { purpose: "goal", question: "이 계획을 통해 최종적으로 달성하려는 결과는 무엇인가요?" },
    { purpose: "context", question: "현재 상태, 사용 가능한 자원, 기간, 함께 일하는 사람을 적어주세요." },
    { purpose: "known_or_excluded", question: "이미 정한 일, 시도한 일, 제외하고 싶은 실행 방식은 무엇인가요?" },
    { purpose: "tension_or_assumption", question: "가장 큰 병목, 실패 위험, 단기 실행과 장기 방향이 충돌하는 지점은 무엇인가요?" },
    { purpose: "output_or_validation", question: "로드맵은 어떤 단위로 보고 싶나요? 예: 7일, 30일, 90일, 체크리스트, 역할별 실행표." }
  ]),
  artifact_creation: withIds([
    { purpose: "goal", question: "만들고 싶은 산출물의 목적은 무엇인가요? 예: PRD, 코드 설계, 발표 자료, 문서, 화면 흐름." },
    { purpose: "context", question: "이 산출물을 볼 대상, 사용 상황, 톤, 제약 조건을 적어주세요." },
    { purpose: "known_or_excluded", question: "반드시 포함하거나 제외하고 싶은 내용, 이미 정한 구조는 무엇인가요?" },
    { purpose: "tension_or_assumption", question: "이 산출물이 평범해지거나 실패할 수 있는 가장 큰 위험은 무엇인가요?" },
    { purpose: "output_or_validation", question: "최종 산출물은 어떤 형식과 수준이면 좋나요? 예: 목차, 상세 PRD, 구현 순서, 코드 스캐폴드, 평가 기준." }
  ])
};

export function getFollowupQuestions(type: QuestionType): FollowupQuestion[] {
  return FOLLOWUP_TEMPLATES[type].map((item) => ({ ...item }));
}
