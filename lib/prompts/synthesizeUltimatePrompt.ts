import type { FollowupAnswer, QuestionAnalysis } from "../types";

export function buildSynthesizeUltimatePrompt(input: {
  rawQuestion: string;
  analysis: QuestionAnalysis;
  followupAnswers: FollowupAnswer[];
}) {
  const answers = input.followupAnswers
    .map((item) => `- ${item.purpose}: ${item.answer.trim() || "정보 없음"}`)
    .join("\n");

  return `너는 사용자의 평범한 질문을 AI가 깊게 사고할 수밖에 없는 궁극 질문 프롬프트로 재설계한다.

원래 질문:
${input.rawQuestion}

질문 분석:
- primaryType: ${input.analysis.primaryType}
- secondaryTypes: ${input.analysis.secondaryTypes.join(", ") || "없음"}
- deeperIntent: ${input.analysis.deeperIntent}
- genericAnswerRisk: ${input.analysis.genericAnswerRisk}

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

한국어로 작성하고, 뻔한 일반론과 블로그식 조언을 피하라.`;
}
