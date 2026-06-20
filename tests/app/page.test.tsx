import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Page from "@/app/page";

describe("main page flow", () => {
  beforeEach(() => {
    localStorage.clear();
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
          recommendedFollowupFocus: ["goal", "context"],
          recommendedTypeOptions: [
            { type: "strategy_business", reason: "사업 가능성을 먼저 봐야 해요." },
            { type: "critique_risk", reason: "실패할 수 있는 이유도 같이 봐야 해요." },
            { type: "idea_generation", reason: "더 나은 앱 방향을 찾을 수 있어요." }
          ],
          followupQuestions: [
            { id: "goal", purpose: "goal", question: "이번 답으로 무엇을 정하고 싶나요?", choices: ["사업을 계속할지 정하고 싶어요", "고객을 정하고 싶어요", "위험한 점을 알고 싶어요", "첫 실험을 정하고 싶어요"] },
            { id: "context", purpose: "context", question: "지금 아이디어는 어느 단계인가요?", choices: ["처음 떠올린 단계예요", "주변 반응을 들었어요", "간단히 만들어봤어요", "돈을 낸 사람이 있어요"] },
            { id: "known_or_excluded", purpose: "known_or_excluded", question: "이미 알고 있거나 빼고 싶은 답은 무엇인가요?", choices: ["뻔한 장단점은 빼주세요", "큰 회사 사례는 빼주세요", "기술 설명은 줄여주세요", "이미 경쟁자는 봤어요"] },
            { id: "tension_or_assumption", purpose: "tension_or_assumption", question: "가장 불안한 부분은 무엇인가요?", choices: ["고객이 돈을 낼지 모르겠어요", "경쟁 앱과 달라 보일지 걱정돼요", "혼자 만들 수 있을지 모르겠어요", "처음 고객을 찾기 어려워요"] },
            { id: "output_or_validation", purpose: "output_or_validation", question: "어떤 형태의 답이 필요하나요?", choices: ["바로 할 일 목록", "위험도 높은 순서", "검증 실험 3개", "짧은 결론 먼저"] }
          ]
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
    expect(screen.getAllByText("사업 가능성을 보고 싶어요").length).toBeGreaterThan(0);
    expect(screen.getByText("실패할 수 있는 이유도 같이 봐야 해요.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "후속 질문 답하기" }));

    expect(screen.getByText("이번 답으로 무엇을 정하고 싶나요?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "위험한 점을 알고 싶어요" }));
    await user.click(screen.getByRole("button", { name: "간단히 만들어봤어요" }));
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

  it("saves the API key and restores it on the next visit", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Page />);

    await user.click(screen.getByRole("button", { name: /API 키/ }));
    await user.type(screen.getByLabelText("OpenAI API 키"), "sk-persisted");
    await user.click(screen.getByRole("button", { name: "적용" }));

    expect(localStorage.getItem("ultimate-question-builder:openai-api-key")).toBe("sk-persisted");

    unmount();
    render(<Page />);

    await waitFor(() => expect(screen.getByRole("button", { name: /API 키 설정됨/ })).toBeInTheDocument());
    await user.type(screen.getByLabelText("AI에게 묻고 싶은 질문"), "저장된 API 키로 바로 분석되는지 확인하고 싶어.");
    await user.click(screen.getByRole("button", { name: "질문 분석하기" }));

    await screen.findByText("시장 가능성과 실패 가능성을 알고 싶어한다.");
    expect(fetch).toHaveBeenCalledWith(
      "/api/analyze-question",
      expect.objectContaining({
        body: expect.stringContaining("sk-persisted")
      })
    );
  });
});
