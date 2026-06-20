import { FOLLOWUP_PURPOSES, type FollowupPurpose, type QuestionType } from "./questionTypes";

export type FollowupQuestion = {
  id: FollowupPurpose;
  purpose: FollowupPurpose;
  question: string;
  choices: string[];
};

type TypeCopy = {
  subject: string;
  goal: string[];
  context: string[];
  known: string[];
  tension: string[];
  output: string[];
};

const TYPE_COPY: Record<QuestionType, TypeCopy> = {
  research_fact: {
    subject: "확인할 정보",
    goal: ["정확한 사실을 알고 싶어요", "근거 있는 출처가 필요해요", "보고서에 넣고 싶어요", "틀린 정보를 걸러내고 싶어요"],
    context: ["최신 정보가 중요해요", "한국 기준이 필요해요", "해외 사례도 보고 싶어요", "숫자와 기준이 중요해요"],
    known: ["광고성 글은 빼주세요", "출처 없는 말은 빼주세요", "너무 오래된 정보는 빼주세요", "기본 설명은 알고 있어요"],
    tension: ["자료마다 말이 달라요", "믿을 만한 출처가 걱정돼요", "예외 조건이 있을 것 같아요", "숫자가 왜 다른지 궁금해요"],
    output: ["핵심만 요약해주세요", "출처 중심으로 정리해주세요", "표로 비교해주세요", "틀릴 수 있는 점도 말해주세요"]
  },
  concept_learning: {
    subject: "배울 내용",
    goal: ["처음부터 쉽게 알고 싶어요", "예시로 이해하고 싶어요", "시험처럼 확인하고 싶어요", "일에 써먹고 싶어요"],
    context: ["완전 처음이에요", "이름만 들어봤어요", "조금 배웠지만 헷갈려요", "실무 예시가 필요해요"],
    known: ["어려운 용어는 줄여주세요", "수식 설명은 줄여주세요", "긴 역사 설명은 빼주세요", "이미 기본 뜻은 알아요"],
    tension: ["비슷한 말과 헷갈려요", "왜 중요한지 모르겠어요", "어디에 쓰는지 궁금해요", "틀리기 쉬운 점이 걱정돼요"],
    output: ["중학생도 알게 설명해주세요", "비유로 풀어주세요", "예시 3개로 보여주세요", "마지막에 퀴즈를 주세요"]
  },
  perspective_interpretation: {
    subject: "살펴볼 주제",
    goal: ["다른 관점이 필요해요", "내 생각을 넓히고 싶어요", "반대 의견도 보고 싶어요", "글쓰기 재료가 필요해요"],
    context: ["내 생각이 아직 흐려요", "한쪽 의견만 봤어요", "사람마다 말이 달라요", "결론보다 관점이 중요해요"],
    known: ["뻔한 찬반은 빼주세요", "정답처럼 말하지 마세요", "너무 철학적이면 어려워요", "이미 흔한 해석은 알아요"],
    tension: ["좋은 점과 나쁜 점이 섞여요", "사람마다 기준이 달라요", "감정과 사실이 엉켜 있어요", "쉽게 결론 내리기 어려워요"],
    output: ["관점 3개로 나눠주세요", "찬반을 같이 보여주세요", "새 질문을 만들어주세요", "짧은 결론도 주세요"]
  },
  idea_generation: {
    subject: "아이디어",
    goal: ["새 아이디어가 필요해요", "더 좋은 방향을 찾고 싶어요", "차별점을 만들고 싶어요", "작게 실험해보고 싶어요"],
    context: ["아직 막 떠올린 단계예요", "비슷한 예시를 봤어요", "사용자를 정하는 중이에요", "실행 방법이 고민이에요"],
    known: ["너무 흔한 아이디어는 빼주세요", "돈 많이 드는 건 빼주세요", "혼자 못 하는 건 빼주세요", "이미 해본 건 제외해주세요"],
    tension: ["새롭지만 어려울까 걱정돼요", "쉬우면 너무 흔할 것 같아요", "사람들이 쓸지 모르겠어요", "작게 시작하고 싶어요"],
    output: ["아이디어 5개를 주세요", "가장 좋은 3개만 골라주세요", "실험 방법도 붙여주세요", "이름까지 제안해주세요"]
  },
  strategy_business: {
    subject: "제품이나 사업",
    goal: ["사업을 계속할지 정하고 싶어요", "고객을 정하고 싶어요", "위험한 점을 알고 싶어요", "첫 실험을 정하고 싶어요"],
    context: ["처음 떠올린 단계예요", "주변 반응을 들었어요", "간단히 만들어봤어요", "돈을 낸 사람이 있어요"],
    known: ["뻔한 장단점은 빼주세요", "큰 회사 사례는 빼주세요", "기술 설명은 줄여주세요", "이미 경쟁자는 봤어요"],
    tension: ["고객이 돈을 낼지 모르겠어요", "경쟁 앱과 다를지 걱정돼요", "혼자 만들 수 있을지 모르겠어요", "처음 고객을 찾기 어려워요"],
    output: ["바로 할 일 목록", "위험도 높은 순서", "검증 실험 3개", "짧은 결론 먼저"]
  },
  decision_comparison: {
    subject: "선택지",
    goal: ["하나를 고르고 싶어요", "장단점을 비교하고 싶어요", "조건별 추천이 필요해요", "후회할 점을 보고 싶어요"],
    context: ["선택지가 2개예요", "선택지가 여러 개예요", "시간이 별로 없어요", "돈이 중요한 선택이에요"],
    known: ["이미 마음이 기운 쪽이 있어요", "가격 비교는 했어요", "뻔한 장단점은 빼주세요", "광고 같은 말은 싫어요"],
    tension: ["안전한 선택이 끌려요", "성장 가능성도 보고 싶어요", "지금 이득과 나중 이득이 달라요", "감정과 계산이 충돌해요"],
    output: ["추천 하나를 말해주세요", "점수표로 비교해주세요", "조건별로 골라주세요", "최악의 경우도 말해주세요"]
  },
  problem_diagnosis: {
    subject: "문제",
    goal: ["원인을 찾고 싶어요", "먼저 고칠 것을 알고 싶어요", "해결 방법을 정하고 싶어요", "반복되는 이유를 알고 싶어요"],
    context: ["최근에 생긴 문제예요", "오래 반복된 문제예요", "숫자로 보이는 문제가 있어요", "사람 반응이 안 좋아요"],
    known: ["이미 시도한 방법이 있어요", "겉핥기 조언은 빼주세요", "책임 추궁은 원하지 않아요", "큰돈 드는 해결은 빼주세요"],
    tension: ["진짜 원인이 헷갈려요", "증상과 원인이 달라 보여요", "작은 문제가 커질까 걱정돼요", "해결해도 다시 생길까 걱정돼요"],
    output: ["원인 후보를 순서대로", "바로 할 실험 3개", "체크리스트로 주세요", "가장 먼저 할 일 하나"]
  },
  critique_risk: {
    subject: "검토할 생각",
    goal: ["위험한 점을 찾고 싶어요", "반대 의견을 보고 싶어요", "계획을 더 튼튼하게 하고 싶어요", "실패 이유를 미리 보고 싶어요"],
    context: ["아직 아이디어 단계예요", "곧 실행하려고 해요", "다른 사람을 설득해야 해요", "큰 결정을 앞두고 있어요"],
    known: ["칭찬만 하는 답은 싫어요", "너무 공격적인 말은 싫어요", "이미 장점은 알고 있어요", "현실적인 지적이 필요해요"],
    tension: ["내가 놓친 게 있을까 걱정돼요", "가정이 틀릴 수 있어요", "사람들이 반대할 수 있어요", "실행 중에 막힐 수 있어요"],
    output: ["가장 큰 위험 5개", "반대 질문 목록", "보완 방법까지", "실패 시나리오로"]
  },
  execution_roadmap: {
    subject: "실행할 일",
    goal: ["무엇부터 할지 알고 싶어요", "일정을 짜고 싶어요", "역할을 나누고 싶어요", "막히는 지점을 줄이고 싶어요"],
    context: ["혼자 할 일이에요", "팀과 같이 해요", "일주일 안에 해야 해요", "몇 달짜리 일이에요"],
    known: ["큰 그림은 정했어요", "세부 순서가 필요해요", "너무 복잡한 계획은 싫어요", "이미 일정이 일부 있어요"],
    tension: ["시간이 부족해요", "우선순위가 헷갈려요", "중간에 바뀔 수 있어요", "품질과 속도가 충돌해요"],
    output: ["오늘 할 일부터", "7일 계획으로", "30일 계획으로", "체크리스트로"]
  },
  artifact_creation: {
    subject: "만들 결과물",
    goal: ["문서를 만들고 싶어요", "기획안을 만들고 싶어요", "코드 설계를 받고 싶어요", "바로 복사해 쓰고 싶어요"],
    context: ["초안이 없어요", "메모만 있어요", "기존 초안을 고치고 싶어요", "다른 사람에게 보여줄 거예요"],
    known: ["너무 긴 글은 싫어요", "형식은 깔끔해야 해요", "전문 용어는 줄여주세요", "이미 넣을 내용이 있어요"],
    tension: ["읽는 사람이 빨리 이해해야 해요", "빠짐없이 담아야 해요", "짧지만 설득력 있어야 해요", "실행하기 쉽게 써야 해요"],
    output: ["완성본으로 주세요", "목차 먼저 주세요", "템플릿으로 주세요", "수정 포인트도 주세요"]
  }
};

const purposeQuestion = (purpose: FollowupPurpose, subject: string) => {
  const questions: Record<FollowupPurpose, string> = {
    goal: `이 ${subject}로 무엇을 정하고 싶나요?`,
    context: `지금 ${subject}는 어느 단계인가요?`,
    known_or_excluded: "이미 알고 있거나 빼고 싶은 답은 무엇인가요?",
    tension_or_assumption: "가장 불안하거나 걸리는 부분은 무엇인가요?",
    output_or_validation: "어떤 형태의 답을 받으면 바로 쓰기 좋나요?"
  };

  return questions[purpose];
};

const purposeChoices = (copy: TypeCopy, purpose: FollowupPurpose) => {
  const choices: Record<FollowupPurpose, string[]> = {
    goal: copy.goal,
    context: copy.context,
    known_or_excluded: copy.known,
    tension_or_assumption: copy.tension,
    output_or_validation: copy.output
  };

  return choices[purpose];
};

export const FOLLOWUP_TEMPLATES: Record<QuestionType, FollowupQuestion[]> = Object.fromEntries(
  Object.entries(TYPE_COPY).map(([type, copy]) => [
    type,
    FOLLOWUP_PURPOSES.map((purpose) => ({
      id: purpose,
      purpose,
      question: purposeQuestion(purpose, copy.subject),
      choices: purposeChoices(copy, purpose)
    }))
  ])
) as Record<QuestionType, FollowupQuestion[]>;

export function getFollowupQuestions(type: QuestionType): FollowupQuestion[] {
  return FOLLOWUP_TEMPLATES[type].map((item) => ({
    ...item,
    choices: [...item.choices]
  }));
}
