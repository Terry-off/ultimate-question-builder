import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Page from "@/app/page";

describe("main page flow", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.includes("/api/analyze-question")) {
        return new Response(JSON.stringify({
          primaryType: "strategy_business",
          secondaryTypes: ["idea_generation", "critique_risk"],
          confidence: 0.86,
          surfaceQuestion: "사업성 질문",
          deeperIntent: "시장 가능성과 실패 가능성을 알고 싶어한다.",
          genericAnswerRisk: "일반적인 장단점으로 흐를 수 있다.",
          missingDimensions: ["고객", "경쟁자"],
          recommendedFollowupFocus: ["goal", "context"]
        }), { status: 200 });
      }

      if (url.includes("/api/synthesize-ultimate-prompt")) {
        return new Response(JSON.stringify({
          shortVersion: "짧은 버전",
          deepVersion: "깊은 분석 버전",
          expertVersion: "전문가 버전",
          whyThisPromptIsStrong: ["숨은 가정을 요구한다."],
          qualityScore: {
            total: 90,
            context: 15,
            goal: 15,
            knownExclusions: 10,
            tension: 20,
            perspectiveCollision: 15,
            selfRefutation: 10,
            outputClarity: 5
          },
          improvementSuggestions: ["검증 방식을 더 구체화하세요."]
        }), { status: 200 });
      }

      return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
    }));
  });

  it("lets a user enter a key, analyze a question, answer followups, and see results", async () => {
    const user = userEvent.setup();
    render(<Page />);

    await user.click(screen.getByRole("button", { name: /API 키/ }));
    await user.type(screen.getByLabelText("OpenAI API 키"), "sk-test");
    await user.click(screen.getByRole("button", { name: "적용" }));

    await user.type(screen.getByLabelText("AI에게 묻고 싶은 질문"), "AI 질문 생성 앱의 사업성이 있을지 알고 싶어.");
    await user.click(screen.getByRole("button", { name: "질문 분석하기" }));

    expect(await screen.findByText("시장 가능성과 실패 가능성을 알고 싶어한다.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "후속 질문 답하기" }));

    await user.type(screen.getByLabelText("목표"), "시장 검증");
    await user.type(screen.getByLabelText("맥락"), "MVP 단계");
    await user.click(screen.getByRole("button", { name: "궁극 질문 만들기" }));

    await waitFor(() => expect(screen.getByText("질문 품질 점수")).toBeInTheDocument());
    expect(screen.getAllByText("깊은 분석 버전").length).toBeGreaterThan(0);
  });

  it("clears the missing key error after the user applies an API key", async () => {
    const user = userEvent.setup();
    render(<Page />);

    await user.click(screen.getByRole("button", { name: "질문 분석하기" }));
    expect(screen.getAllByText("OpenAI API 키를 먼저 입력해주세요.").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /API 키/ }));
    await user.type(screen.getByLabelText("OpenAI API 키"), "sk-test");
    await user.click(screen.getByRole("button", { name: "적용" }));

    await waitFor(() => expect(screen.queryByText("OpenAI API 키를 먼저 입력해주세요.")).not.toBeInTheDocument());
  });
});
