import type { FollowupAnswer, QualityScore } from "./types";

type ScoreInput = {
  promptText: string;
  followupAnswers: FollowupAnswer[];
};

const hasText = (value: string | undefined) => Boolean(value && value.trim().length >= 8);

const includesAny = (text: string, needles: string[]) => needles.some((needle) => text.includes(needle));

const answerText = (answers: FollowupAnswer[]) =>
  answers.map((answer) => `${answer.purpose} ${answer.question} ${answer.answer}`).join(" ");

const hasAnswerFor = (answers: FollowupAnswer[], keywords: string[]) =>
  answers.some((answer) => {
    const searchable = `${answer.purpose} ${answer.question}`;
    return hasText(answer.answer) && includesAny(searchable, keywords);
  });

export function calculateQualityScore({ promptText, followupAnswers }: ScoreInput): QualityScore {
  const normalized = promptText.replace(/\s+/g, " ");
  const followupText = answerText(followupAnswers);

  const context = hasAnswerFor(followupAnswers, ["상황", "현재", "단계", "대상", "고객", "사용자", "누구", "배경", "쓰는 방법", "대안"]) ? 15 : 0;
  const goal = hasAnswerFor(followupAnswers, ["목표", "정하", "원하", "쓸 곳", "이유", "성공", "결정", "필요", "돈을 낼 이유"]) ? 15 : 0;
  const knownExclusions = hasAnswerFor(followupAnswers, ["피하", "빼", "제외", "이미", "싫", "원하지", "아는"]) ? 10 : 0;
  const tension =
    (includesAny(followupText, ["걱정", "불안", "걸리는", "위험", "실패", "반대", "충돌", "돈을 낼지"]) || includesAny(normalized, ["긴장", "충돌", "숨은 가정", "반대 가능성", "리스크"])) &&
    includesAny(normalized, ["긴장", "충돌", "숨은 가정", "반대 가능성", "리스크"])
      ? 20
      : includesAny(normalized, ["긴장", "충돌", "숨은 가정", "반대 가능성", "리스크"])
        ? 12
        : 0;
  const perspectiveCollision = includesAny(normalized, ["관점 충돌", "서로 충돌", "충돌하는 지점"]) ? 15 : 0;
  const selfRefutation = includesAny(normalized, ["반박", "자기반박", "강한 반론"]) ? 10 : 0;
  const outputClarity =
    hasAnswerFor(followupAnswers, ["답", "모양", "형태", "출력", "결과", "표", "목록", "계획", "실험", "검증"]) &&
    includesAny(normalized, ["출력 형식", "실행", "검증", "실험", "체크리스트", "로드맵"])
      ? 15
      : hasAnswerFor(followupAnswers, ["답", "모양", "형태", "출력", "결과", "표", "목록", "계획", "실험", "검증"])
        ? 8
        : 0;

  const total = context + goal + knownExclusions + tension + perspectiveCollision + selfRefutation + outputClarity;

  return {
    total,
    context,
    goal,
    knownExclusions,
    tension,
    perspectiveCollision,
    selfRefutation,
    outputClarity
  };
}

export function getQualityMessage(score: number) {
  if (score >= 90) return "매우 강한 질문입니다. AI가 일반론으로 도망가기 어렵습니다.";
  if (score >= 75) return "좋은 질문입니다. 깊이 있는 답변을 끌어낼 가능성이 높습니다.";
  if (score >= 60) return "기본 질문보다 낫지만, 긴장이나 검증 방식이 더 필요합니다.";
  return "아직 일반론으로 흐를 가능성이 큽니다. 목표, 맥락, 충돌 지점을 더 구체화하세요.";
}

export function buildImprovementSuggestions(score: QualityScore): string[] {
  const suggestions: string[] = [];

  if (score.goal < 15) suggestions.push("최종 답변을 어디에 쓸지 목표를 더 구체화하세요.");
  if (score.context < 15) suggestions.push("상황, 대상, 제약 조건 같은 맥락을 더 보강하세요.");
  if (score.knownExclusions < 10) suggestions.push("이미 알고 있는 일반론과 제외할 답변을 명시하세요.");
  if (score.tension < 20) suggestions.push("통념과 반대 가능성, 단기와 장기, 욕망과 현실의 충돌을 더 분명히 적으세요.");
  if (score.perspectiveCollision < 15) suggestions.push("여러 관점을 나열하지 말고 서로 충돌시키도록 요구하세요.");
  if (score.selfRefutation < 10) suggestions.push("AI가 자기 결론을 가장 강하게 반박한 뒤 다시 종합하도록 요구하세요.");
  if (score.outputClarity < 15) suggestions.push("원하는 출력 형식과 실제 검증 방법을 더 명확히 적으세요.");

  return suggestions;
}
