import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Page from "@/app/page";
import { STORED_API_KEY_SENTINEL } from "@/lib/apiKeyShared";
import { HERO_THEMES } from "@/lib/heroThemes";

describe("main page flow", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.includes("/api/test-api-key")) {
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      if (url.includes("/api/analyze-question")) {
        return new Response(JSON.stringify({
          primaryType: "strategy_business",
          secondaryTypes: ["idea_generation", "critique_risk"],
          confidence: 0.86,
          surfaceQuestion: "사업성 질문",
          deeperIntent: "시장 가능성과 실패 가능성을 알고 싶어한다.",
          genericAnswerRisk: "일반적인 장단점으로 흐를 수 있다.",
          missingDimensions: ["고객", "경쟁자"],
          recommendedFollowupFocus: ["돈을 낼 고객", "지금 쓰는 방법", "첫 검증 방법"],
          recommendedTypeOptions: [
            { type: "strategy_business", reason: "사업 가능성을 먼저 봐야 해요." },
            { type: "critique_risk", reason: "실패할 수 있는 이유도 같이 봐야 해요." },
            { type: "idea_generation", reason: "더 나은 앱 방향을 찾을 수 있어요." }
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

  it("randomizes the first-screen Spline hero and applies its theme tokens", async () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.999);

    try {
      render(<Page />);

      const iframe = await screen.findByTitle("Animated paper boat hero animation");
      const paperBoatTheme = HERO_THEMES.find((theme) => theme.id === "paper-boat");
      const main = document.querySelector("main");

      if (!paperBoatTheme) throw new Error("paper boat theme missing");
      expect(iframe).toHaveAttribute("src", paperBoatTheme.splineUrl);
      expect(main).toHaveAttribute("data-hero-theme", "paper-boat");
      expect(main).toHaveStyle({ "--accent": "#ffdd9a" });
    } finally {
      randomSpy.mockRestore();
    }
  });

  it("lets a user enter a key, analyze a question, answer followups, and see results", async () => {
    const user = userEvent.setup();
    render(<Page />);

    expect(screen.getByTitle(/hero animation/)).toBeInTheDocument();
    expect(screen.queryByText("1. 질문 입력")).not.toBeInTheDocument();
    expect(screen.queryByText("Step 1")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "API등록" }));
    await user.type(screen.getByLabelText("OpenAI API 키"), "sk-test");
    await user.click(screen.getByRole("button", { name: "TEST" }));

    await user.type(screen.getByLabelText("AI에게 묻고 싶은 질문"), "AI 질문 생성 앱의 사업성이 있을지 알고 싶어.");
    await user.click(screen.getByRole("button", { name: "궁극의 질문으로 만들어" }));

    expect(await screen.findByText("방향")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "후속 질문 답하기" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("사업 가능성을 보고 싶어요 반영 정도")).toHaveValue("80");
    fireEvent.change(screen.getByLabelText("사업 가능성을 보고 싶어요 반영 정도"), { target: { value: "95" } });
    expect(screen.getByText("이 앱에 돈을 낼 사람은 누구라고 생각하나요?")).toBeInTheDocument();
    expect(screen.queryByText("이번 답으로 무엇을 정하고 싶나요?")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("AI에게 묻고 싶은 질문")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "작은 팀의 리더" }));
    await user.click(screen.getByRole("button", { name: "그냥 ChatGPT에 물어요" }));
    await user.click(screen.getByRole("button", { name: "궁극의 질문 생성" }));

    await waitFor(() => expect(screen.getByRole("dialog", { name: "AI에게 물어보는 궁극의 질문입니다." })).toBeInTheDocument());
    expect(screen.getByText("AI에게 물어보는 궁극의 질문입니다.")).toBeInTheDocument();
    expect(screen.getAllByText("깊은 분석 버전").length).toBeGreaterThan(0);
    expect(screen.queryByText("이 앱에 돈을 낼 사람은 누구라고 생각하나요?")).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "/api/synthesize-ultimate-prompt",
      expect.objectContaining({
        body: expect.stringContaining("\"weight\":95")
      })
    );
    expect(fetch).toHaveBeenCalledWith(
      "/api/synthesize-ultimate-prompt",
      expect.objectContaining({
        body: expect.stringContaining("\"purpose\":\"돈을 낼 고객\"")
      })
    );
  });

  it("clears the missing key error after the user applies an API key", async () => {
    const user = userEvent.setup();
    render(<Page />);

    await user.click(screen.getByRole("button", { name: "궁극의 질문으로 만들어" }));
    expect(screen.getAllByText("OpenAI API 키를 먼저 입력해주세요.").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "API등록" }));
    await user.type(screen.getByLabelText("OpenAI API 키"), "sk-test");
    await user.click(screen.getByRole("button", { name: "TEST" }));

    await waitFor(() => expect(screen.queryByText("OpenAI API 키를 먼저 입력해주세요.")).not.toBeInTheDocument());
  });

  it("shows an interactive loading layer while analyzing the first question", async () => {
    const user = userEvent.setup();
    let resolveAnalyze!: (response: Response) => void;

    vi.stubGlobal("fetch", vi.fn((url: string) => {
      if (url.includes("/api/test-api-key")) {
        return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
      }

      if (url.includes("/api/analyze-question")) {
        return new Promise<Response>((resolve) => {
          resolveAnalyze = resolve;
        });
      }

      return Promise.resolve(new Response(JSON.stringify({ error: "not found" }), { status: 404 }));
    }));

    render(<Page />);

    await user.click(screen.getByRole("button", { name: "API등록" }));
    await user.type(screen.getByLabelText("OpenAI API 키"), "sk-test");
    await user.click(screen.getByRole("button", { name: "TEST" }));
    await user.type(screen.getByLabelText("AI에게 묻고 싶은 질문"), "기다리는 동안 로딩이 보여야 해.");
    await user.click(screen.getByRole("button", { name: "궁극의 질문으로 만들어" }));

    expect(await screen.findByText("생각 중")).toBeInTheDocument();
    expect(screen.getByText("질문 속 숨은 목적을 찾고 있어요")).toBeInTheDocument();
    expect(screen.queryByLabelText("AI에게 묻고 싶은 질문")).not.toBeInTheDocument();

    resolveAnalyze(new Response(JSON.stringify({
      primaryType: "strategy_business",
      secondaryTypes: [],
      confidence: 0.86,
      surfaceQuestion: "대기 상태 질문",
      deeperIntent: "로딩 중 사용자가 기다리는 경험을 확인한다.",
      genericAnswerRisk: "일반적인 답으로 흐를 수 있다.",
      missingDimensions: [],
      recommendedFollowupFocus: [],
      recommendedTypeOptions: [
        { type: "strategy_business", reason: "사업 가능성을 먼저 봐야 해요." }
      ],
      followupQuestions: [
        { id: "a", purpose: "고객", intent: "고객을 알아야 해요.", question: "누가 쓸 것 같나요?", choices: ["직장인", "학생", "창업자", "모르겠어요"] },
        { id: "b", purpose: "문제", intent: "문제를 알아야 해요.", question: "무엇이 불편한가요?", choices: ["시간", "품질", "정리", "확신"] },
        { id: "c", purpose: "대안", intent: "대안을 알아야 해요.", question: "지금은 어떻게 하나요?", choices: ["검색", "질문", "템플릿", "안 해요"] },
        { id: "d", purpose: "이유", intent: "이유를 알아야 해요.", question: "왜 돈을 낼까요?", choices: ["빠름", "품질", "편함", "모름"] },
        { id: "e", purpose: "기준", intent: "기준을 알아야 해요.", question: "무엇이 중요한가요?", choices: ["돈", "속도", "차별점", "반응"] },
        { id: "f", purpose: "모양", intent: "모양을 알아야 해요.", question: "어떤 답이 좋나요?", choices: ["표", "목록", "계획", "결론"] }
      ]
    }), { status: 200 }));

    expect(await screen.findByText("방향")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("생각 중")).not.toBeInTheDocument());
  });

  it("saves the API key and restores it on the next visit", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Page />);

    await user.click(screen.getByRole("button", { name: "API등록" }));
    await user.type(screen.getByLabelText("OpenAI API 키"), "sk-persisted");
    await user.click(screen.getByRole("button", { name: "TEST" }));

    expect(localStorage.getItem("ultimate-question-builder:openai-api-key")).toBe("sk-persisted");
    expect(fetch).toHaveBeenCalledWith(
      "/api/test-api-key",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ provider: "openai", model: "gpt-5.5", apiKey: "sk-persisted" })
      })
    );
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        "/api/api-key?provider=openai",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ provider: "openai", apiKey: "sk-persisted" })
        })
      )
    );

    unmount();
    render(<Page />);

    await waitFor(() => expect(screen.getByRole("button", { name: "GPT-5.5 작동중" })).toBeInTheDocument());
    await user.type(screen.getByLabelText("AI에게 묻고 싶은 질문"), "저장된 API 키로 바로 분석되는지 확인하고 싶어.");
    await user.click(screen.getByRole("button", { name: "궁극의 질문으로 만들어" }));

    await screen.findByText("방향");
    expect(fetch).toHaveBeenCalledWith(
      "/api/analyze-question",
      expect.objectContaining({
        body: expect.stringContaining("sk-persisted")
      })
    );
  });

  it("restores a server-persisted API key when the browser address changes", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
      if (url.includes("/api/api-key")) {
        return new Response(JSON.stringify({ hasApiKey: true }), { status: 200 });
      }

      if (url.includes("/api/analyze-question")) {
        expect(init?.body).toContain(STORED_API_KEY_SENTINEL);
        return new Response(JSON.stringify({
          primaryType: "strategy_business",
          secondaryTypes: [],
          confidence: 0.86,
          surfaceQuestion: "사업성 질문",
          deeperIntent: "시장 가능성을 알고 싶어한다.",
          genericAnswerRisk: "일반적인 장단점으로 흐를 수 있다.",
          missingDimensions: [],
          recommendedFollowupFocus: [],
          recommendedTypeOptions: [
            { type: "strategy_business", reason: "사업 가능성을 먼저 봐야 해요." }
          ],
          followupQuestions: [
            { id: "a", purpose: "고객", intent: "고객을 알아야 해요.", question: "누가 쓸 것 같나요?", choices: ["직장인", "학생", "창업자", "모르겠어요"] },
            { id: "b", purpose: "문제", intent: "문제를 알아야 해요.", question: "무엇이 불편한가요?", choices: ["시간", "품질", "정리", "확신"] },
            { id: "c", purpose: "대안", intent: "대안을 알아야 해요.", question: "지금은 어떻게 하나요?", choices: ["검색", "질문", "템플릿", "안 해요"] },
            { id: "d", purpose: "이유", intent: "이유를 알아야 해요.", question: "왜 돈을 낼까요?", choices: ["빠름", "품질", "편함", "모름"] },
            { id: "e", purpose: "기준", intent: "기준을 알아야 해요.", question: "무엇이 중요한가요?", choices: ["돈", "속도", "차별점", "반응"] },
            { id: "f", purpose: "모양", intent: "모양을 알아야 해요.", question: "어떤 답이 좋나요?", choices: ["표", "목록", "계획", "결론"] }
          ]
        }), { status: 200 });
      }

      return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
    }));

    const user = userEvent.setup();
    render(<Page />);

    await waitFor(() => expect(screen.getByRole("button", { name: "GPT-5.5 작동중" })).toBeInTheDocument());
    await user.type(screen.getByLabelText("AI에게 묻고 싶은 질문"), "주소가 바뀌어도 저장된 키로 바로 분석되는지 확인하고 싶어.");
    await user.click(screen.getByRole("button", { name: "궁극의 질문으로 만들어" }));

    await screen.findByText("방향");
  });

  it("does not erase a saved API key when the menu is applied without a new key", async () => {
    const user = userEvent.setup();
    localStorage.setItem("ultimate-question-builder:openai-api-key", "sk-persisted");
    render(<Page />);

    await waitFor(() => expect(screen.getByRole("button", { name: "GPT-5.5 작동중" })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "GPT-5.5 작동중" }));
    await user.click(screen.getByRole("button", { name: "적용" }));

    expect(localStorage.getItem("ultimate-question-builder:openai-api-key")).toBe("sk-persisted");
    await user.type(screen.getByLabelText("AI에게 묻고 싶은 질문"), "저장된 키가 메뉴를 열어도 유지되는지 확인하고 싶어.");
    await user.click(screen.getByRole("button", { name: "궁극의 질문으로 만들어" }));

    await screen.findByText("방향");
    expect(fetch).toHaveBeenCalledWith(
      "/api/analyze-question",
      expect.objectContaining({
        body: expect.stringContaining("sk-persisted")
      })
    );
  });

  it("saves the selected GPT model and restores it on the next visit", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Page />);

    await user.click(screen.getByRole("button", { name: "API등록" }));
    await user.selectOptions(screen.getByLabelText("GPT 모델"), "gpt-5.5-pro");

    expect(localStorage.getItem("ultimate-question-builder:gpt-model")).toBe("gpt-5.5-pro");

    unmount();
    render(<Page />);

    await user.click(screen.getByRole("button", { name: "API등록" }));

    expect(screen.getByLabelText("GPT 모델")).toHaveValue("gpt-5.5-pro");
  });

  it("stores provider-specific API keys and model preferences", async () => {
    const user = userEvent.setup();
    render(<Page />);

    await user.click(screen.getByRole("button", { name: "API등록" }));
    await user.click(screen.getByRole("button", { name: "CLAUDE" }));
    await user.selectOptions(screen.getByLabelText("CLAUDE 모델"), "claude-opus-4-8");
    await user.type(screen.getByLabelText("Claude API 키"), "sk-ant-persisted");
    await user.click(screen.getByRole("button", { name: "TEST" }));

    expect(localStorage.getItem("ultimate-question-builder:model-provider")).toBe("anthropic");
    expect(localStorage.getItem("ultimate-question-builder:model:anthropic")).toBe("claude-opus-4-8");
    expect(localStorage.getItem("ultimate-question-builder:api-key:anthropic")).toBe("sk-ant-persisted");
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        "/api/api-key?provider=anthropic",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ provider: "anthropic", apiKey: "sk-ant-persisted" })
        })
      )
    );
  });
});
