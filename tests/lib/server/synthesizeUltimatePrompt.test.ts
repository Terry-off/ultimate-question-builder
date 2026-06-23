import { describe, expect, it, vi } from "vitest";
import { synthesizeUltimatePrompt } from "@/lib/server/synthesizeUltimatePrompt";

const validInput = {
  rawQuestion: "AI로 질문을 더 잘 만들게 도와주는 앱을 만들고 싶어.",
  apiKey: "sk-test",
  model: "gpt-5.5",
  analysis: {
    primaryType: "strategy_business",
    secondaryTypes: ["idea_generation"],
    confidence: 0.9,
    surfaceQuestion: "사업성 질문",
    deeperIntent: "시장 가능성과 실패 가능성을 알고 싶어한다.",
    genericAnswerRisk: "일반적인 장단점으로 흐를 수 있다.",
    missingDimensions: ["고객", "경쟁자"],
    recommendedFollowupFocus: ["돈을 낼 고객", "지금 쓰는 방법", "첫 검증 방법"],
    recommendedTypeOptions: [
      { type: "strategy_business", reason: "사업 가능성을 먼저 봐야 해요." },
      { type: "critique_risk", reason: "실패할 수 있는 이유도 같이 봐야 해요." }
    ],
    followupQuestions: [
      {
        id: "paying_customer",
        purpose: "돈을 낼 고객",
        intent: "누가 왜 돈을 낼지 알아야 사업성 답변이 뻔해지지 않아요.",
        question: "이 앱에 돈을 낼 사람은 누구라고 생각하나요?",
        choices: ["혼자 일하는 사람", "작은 팀의 리더", "학생이나 취준생", "아직 잘 모르겠어요"]
      },
      {
        id: "current_alternative",
        purpose: "지금 쓰는 방법",
        intent: "기존 방법을 알아야 새 앱이 이길 지점을 찾을 수 있어요.",
        question: "지금 사람들은 이 문제를 어떻게 해결하고 있나요?",
        choices: ["그냥 ChatGPT에 물어요", "템플릿을 찾아 써요", "동료에게 물어봐요", "아예 해결하지 못해요"]
      },
      {
        id: "willingness_to_pay",
        purpose: "돈을 낼 이유",
        intent: "무료 도구와 비교해 돈을 낼 만큼 강한 이유를 확인해야 해요.",
        question: "사용자가 돈을 낼 만큼 좋아질 부분은 무엇인가요?",
        choices: ["시간을 크게 줄여줘요", "결과 품질이 달라져요", "업무에 바로 써요", "아직 확실하지 않아요"]
      },
      {
        id: "first_test",
        purpose: "첫 검증 방법",
        intent: "실제로 확인할 방법이 있어야 결론이 쓸모 있어져요.",
        question: "가장 먼저 해볼 수 있는 확인 방법은 무엇인가요?",
        choices: ["인터뷰 5명", "랜딩페이지", "유료 사전예약", "작은 MVP"]
      },
      {
        id: "priority",
        purpose: "가장 중요한 기준",
        intent: "무엇을 가장 중요하게 볼지 알아야 결론의 우선순위가 선명해져요.",
        question: "이번 판단에서 가장 중요하게 봐야 할 것은 무엇인가요?",
        choices: ["돈이 될 가능성", "혼자 만들 수 있음", "고객이 자주 씀", "차별점이 분명함"]
      },
      {
        id: "answer_shape",
        purpose: "받고 싶은 답",
        intent: "답변 형태가 정해져야 최종 질문을 바로 쓸 수 있어요.",
        question: "최종 답변은 어떤 모양이면 가장 쓸모 있나요?",
        choices: ["사업 판단표", "첫 실험 계획", "고객 인터뷰 질문", "위험한 점 먼저"]
      }
    ]
  },
  directionSettings: [
    { type: "strategy_business", reason: "사업 가능성을 먼저 봐야 해요.", weight: 95 },
    { type: "critique_risk", reason: "실패할 수 있는 이유도 같이 봐야 해요.", weight: 40 }
  ],
  followupAnswers: [
    { id: "paying_customer", purpose: "돈을 낼 고객", question: "이 앱에 돈을 낼 사람은 누구라고 생각하나요?", answer: "작은 팀의 리더가 돈을 낼 가능성이 있다." },
    { id: "current_alternative", purpose: "지금 쓰는 방법", question: "지금 사람들은 이 문제를 어떻게 해결하고 있나요?", answer: "그냥 ChatGPT에 대충 물어본다." },
    { id: "willingness_to_pay", purpose: "돈을 낼 이유", question: "사용자가 돈을 낼 만큼 좋아질 부분은 무엇인가요?", answer: "결과 품질이 달라지고 업무에 바로 쓸 수 있다." },
    { id: "first_test", purpose: "첫 검증 방법", question: "가장 먼저 해볼 수 있는 확인 방법은 무엇인가요?", answer: "30일 검증 실험으로 받고 싶다." },
    { id: "priority", purpose: "가장 중요한 기준", question: "이번 판단에서 가장 중요하게 봐야 할 것은 무엇인가요?", answer: "돈이 될 가능성과 차별점이 가장 중요하다." },
    { id: "answer_shape", purpose: "받고 싶은 답", question: "최종 답변은 어떤 모양이면 가장 쓸모 있나요?", answer: "사업 판단표와 첫 실험 계획이 필요하다." }
  ]
} as const;

describe("synthesizeUltimatePrompt service", () => {
  it("adds rule-based score to structured model output", async () => {
    const requestStructuredOutput = vi.fn().mockResolvedValue({
      shortVersion: "숨은 가정과 관점 충돌, 반박, 실행/검증 방법을 중심으로 분석해줘.",
      deepVersion: "긴장/충돌과 관점 충돌을 분석하고 네 결론을 반박한 뒤 추상화와 구체적 실행을 연결해줘.",
      expertVersion: "숨은 가정, 통념 반박, 자기반박, 추상/구체 왕복, 실행/검증 실험을 포함해줘.",
      whyThisPromptIsStrong: ["일반론을 제외하고 사고 장치를 강제한다."],
      improvementSuggestions: []
    });

    const result = await synthesizeUltimatePrompt(validInput, requestStructuredOutput);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.deepVersion).toContain("관점 충돌");
      expect(result.data.qualityScore.total).toBeGreaterThan(70);
    }
    expect(requestStructuredOutput.mock.calls[0]?.[0].prompt).toContain("사업 가능성을 보고 싶어요: 95/100");
    expect(requestStructuredOutput.mock.calls[0]?.[0].prompt).toContain("위험한 점을 미리 보고 싶어요: 40/100");
    expect(requestStructuredOutput.mock.calls[0]?.[0].prompt).toContain("돈을 낼 고객");
    expect(requestStructuredOutput.mock.calls[0]?.[0].prompt).toContain("이 앱에 돈을 낼 사람은 누구라고 생각하나요?");
    expect(requestStructuredOutput.mock.calls[0]?.[0].prompt).toContain("작은 팀의 리더");
  });

  it("returns an error after two synthesis failures", async () => {
    const requestStructuredOutput = vi.fn().mockRejectedValue(new Error("bad output"));
    const result = await synthesizeUltimatePrompt(validInput, requestStructuredOutput);

    expect(requestStructuredOutput).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("궁극 질문 생성에 실패했습니다");
  });

  it("includes the user's edited prompt and feedback when refining a result", async () => {
    const requestStructuredOutput = vi.fn().mockResolvedValue({
      shortVersion: "수정된 짧은 버전",
      deepVersion: "수정된 깊은 버전",
      expertVersion: "수정된 전문가 버전",
      whyThisPromptIsStrong: ["사용자 피드백을 반영한다."],
      improvementSuggestions: []
    });

    await synthesizeUltimatePrompt({
      ...validInput,
      revision: {
        selectedVersion: "deepVersion",
        editedPrompt: "사용자가 직접 고친 깊은 질문",
        feedback: "결과를 더 전문가답고 실행 순서가 보이게 바꿔줘."
      }
    }, requestStructuredOutput);

    const prompt = requestStructuredOutput.mock.calls[0]?.[0].prompt;
    expect(prompt).toContain("사용자가 결과를 보고 추가로 남긴 의견");
    expect(prompt).toContain("사용자가 직접 고친 깊은 질문");
    expect(prompt).toContain("결과를 더 전문가답고 실행 순서가 보이게 바꿔줘.");
  });
});
