import { QUESTION_TYPE_LABELS } from "../questionTypes";
import type { DirectionSetting, FollowupAnswer, QuestionAnalysis } from "../types";

export function buildSynthesizeUltimatePrompt(input: {
  rawQuestion: string;
  analysis: QuestionAnalysis;
  directionSettings: DirectionSetting[];
  followupAnswers: FollowupAnswer[];
}) {
  const questionById = new Map(input.analysis.followupQuestions.map((question) => [question.id, question]));
  const answers = input.followupAnswers
    .map((item) => {
      const sourceQuestion = questionById.get(item.id);
      const intent = sourceQuestion?.intent ? `\n  왜 물었나: ${sourceQuestion.intent}` : "";
      return `- ${item.purpose}\n  질문: ${item.question}${intent}\n  답변: ${item.answer.trim() || "정보 없음"}`;
    })
    .join("\n");
  const directionSettings = input.directionSettings
    .map((item) => `- ${QUESTION_TYPE_LABELS[item.type]}: ${item.weight}/100 (${item.reason})`)
    .join("\n");

  return `너는 사용자의 평범한 질문을 AI가 깊게 사고할 수밖에 없는 궁극 질문 프롬프트로 재설계한다.

원래 질문:
${input.rawQuestion}

질문 분석:
- primaryType: ${input.analysis.primaryType}
- secondaryTypes: ${input.analysis.secondaryTypes.join(", ") || "없음"}
- deeperIntent: ${input.analysis.deeperIntent}
- genericAnswerRisk: ${input.analysis.genericAnswerRisk}

사용자가 조절한 질문 방향:
${directionSettings}

사용자의 후속 답변:
${answers}

반드시 세 가지 버전을 생성하라.
1. shortVersion: 빠르게 복사해서 쓸 수 있는 버전
2. deepVersion: 깊은 사고를 요구하는 기본 추천 버전
3. expertVersion: 가장 강력한 사고 유도용 버전

세 버전에는 반드시 다음 사고 장치를 포함하라.
- 숨은 가정
- 긴장/충돌
- 관점 충돌
- 통념 반박
- 자기반박
- 추상/구체 왕복
- 실행/검증 방법

사용자가 조절한 질문 방향의 점수가 높을수록 최종 프롬프트에 더 강하게 반영하라. 30 이하인 방향은 약하게 참고하고, 70 이상인 방향은 핵심 요구로 다뤄라.
한국어로 작성하고, 뻔한 일반론과 블로그식 조언을 피하라.`;
}
