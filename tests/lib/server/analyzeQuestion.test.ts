import { describe, expect, it, vi } from "vitest";
import { analyzeQuestion } from "@/lib/server/analyzeQuestion";

describe("analyzeQuestion service", () => {
  it("rejects too-short raw questions", async () => {
    const result = await analyzeQuestion({
      rawQuestion: "사업",
      apiKey: "sk-test",
      model: "gpt-5.5"
    });

    if (result.ok) throw new Error("Expected validation failure");
    expect(result.error).toContain("질문이 너무 짧습니다");
  });

  it("returns structured analysis from the requester", async () => {
    const requestStructuredOutput = vi.fn().mockResolvedValue({
      primaryType: "strategy_business",
      secondaryTypes: ["idea_generation"],
      confidence: 0.9,
      surfaceQuestion: "사업성 질문",
      deeperIntent: "시장 가능성 판단",
      genericAnswerRisk: "일반론 위험",
      missingDimensions: ["고객", "경쟁자"],
      recommendedFollowupFocus: ["돈을 낼 고객", "대신 쓰는 방법", "첫 검증 방법"],
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
          id: "answer_shape",
          purpose: "받고 싶은 답",
          intent: "답변 형태가 정해져야 최종 질문을 바로 쓸 수 있어요.",
          question: "최종 답변은 어떤 모양이면 가장 쓸모 있나요?",
          choices: ["사업 판단표", "첫 실험 계획", "고객 인터뷰 질문", "위험한 점 먼저"]
        }
      ]
    });

    const result = await analyzeQuestion(
      {
        rawQuestion: "이 앱 아이디어가 사업성이 있을지 알고 싶어.",
        apiKey: "sk-test",
        model: "gpt-5.5"
      },
      requestStructuredOutput
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.primaryType).toBe("strategy_business");
      expect(result.data.followupQuestions[0].purpose).toBe("돈을 낼 고객");
      expect(result.data.followupQuestions[0].intent).toContain("사업성");
      expect(result.data.followupQuestions[0].choices).toHaveLength(4);
    }
    expect(requestStructuredOutput.mock.calls[0]?.[0].prompt).not.toContain("purpose는 goal, context");
    expect(requestStructuredOutput.mock.calls[0]?.[0].prompt).toContain("사용자의 질문마다");
  });

  it("falls back after requester failure", async () => {
    const requestStructuredOutput = vi.fn().mockRejectedValue(new Error("bad output"));

    const result = await analyzeQuestion(
      {
        rawQuestion: "이 앱 아이디어가 사업성이 있을지 알고 싶어.",
        apiKey: "sk-test",
        model: "gpt-5.5"
      },
      requestStructuredOutput
    );

    expect(requestStructuredOutput).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.primaryType).toBe("perspective_interpretation");
  });
});
