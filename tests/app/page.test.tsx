import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  it("lets a user enter a key, analyze a question, answer followups, and see results", async () => {
    const user = userEvent.setup();
    render(<Page />);

    expect(screen.getByTitle("NEXBOT robot animation")).toBeInTheDocument();
    expect(screen.queryByText("1. 질문 입력")).not.toBeInTheDocument();
    expect(screen.queryByText("Step 1")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /API 키/ }));
    await user.type(screen.getByLabelText("OpenAI API 키"), "sk-test");
    await user.click(screen.getByRole("button", { name: "적용" }));

    await user.type(screen.getByLabelText("AI에게 묻고 싶은 질문"), "AI 질문 생성 앱의 사업성이 있을지 알고 싶어.");
    await user.click(screen.getByRole("button", { name: "시작" }));

    expect(await screen.findByText("방향")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "후속 질문 답하기" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("사업 가능성을 보고 싶어요 반영 정도")).toHaveValue("80");
    fireEvent.change(screen.getByLabelText("사업 가능성을 보고 싶어요 반영 정도"), { target: { value: "95" } });
    expect(screen.getByText("이 앱에 돈을 낼 사람은 누구라고 생각하나요?")).toBeInTheDocument();
    expect(screen.queryByText("이번 답으로 무엇을 정하고 싶나요?")).not.toBeInTheDocument();
    expect(screen.getByLabelText("AI에게 묻고 싶은 질문")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "작은 팀의 리더" }));
    await user.click(screen.getByRole("button", { name: "그냥 ChatGPT에 물어요" }));
    await user.click(screen.getByRole("button", { name: "완성" }));

    await waitFor(() => expect(screen.getByRole("dialog", { name: "최종 질문" })).toBeInTheDocument());
    expect(screen.getByText("최종 질문")).toBeInTheDocument();
    expect(screen.getAllByText("깊은 분석 버전").length).toBeGreaterThan(0);
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

    await user.click(screen.getByRole("button", { name: "시작" }));
    expect(screen.getAllByText("OpenAI API 키를 먼저 입력해주세요.").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /API 키/ }));
    await user.type(screen.getByLabelText("OpenAI API 키"), "sk-test");
    await user.click(screen.getByRole("button", { name: "적용" }));

    await waitFor(() => expect(screen.queryByText("OpenAI API 키를 먼저 입력해주세요.")).not.toBeInTheDocument());
  });

  it("shows an interactive loading layer while analyzing the first question", async () => {
    const user = userEvent.setup();
    let resolveAnalyze!: (response: Response) => void;

    vi.stubGlobal("fetch", vi.fn((url: string) => {
      if (url.includes("/api/analyze-question")) {
        return new Promise<Response>((resolve) => {
          resolveAnalyze = resolve;
        });
      }

      return Promise.resolve(new Response(JSON.stringify({ error: "not found" }), { status: 404 }));
    }));

    render(<Page />);

    await user.click(screen.getByRole("button", { name: /API 키/ }));
    await user.type(screen.getByLabelText("OpenAI API 키"), "sk-test");
    await user.click(screen.getByRole("button", { name: "적용" }));
    await user.type(screen.getByLabelText("AI에게 묻고 싶은 질문"), "기다리는 동안 로딩이 보여야 해.");
    await user.click(screen.getByRole("button", { name: "시작" }));

    expect(await screen.findByText("생각 중")).toBeInTheDocument();

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
      followupQuestions: []
    }), { status: 200 }));

    expect(await screen.findByText("방향")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("생각 중")).not.toBeInTheDocument());
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
    await user.click(screen.getByRole("button", { name: "시작" }));

    await screen.findByText("방향");
    expect(fetch).toHaveBeenCalledWith(
      "/api/analyze-question",
      expect.objectContaining({
        body: expect.stringContaining("sk-persisted")
      })
    );
  });

  it("does not erase a saved API key when the menu is applied without a new key", async () => {
    const user = userEvent.setup();
    localStorage.setItem("ultimate-question-builder:openai-api-key", "sk-persisted");
    render(<Page />);

    await waitFor(() => expect(screen.getByRole("button", { name: /API 키 설정됨/ })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /API 키 설정됨/ }));
    await user.click(screen.getByRole("button", { name: "적용" }));

    expect(localStorage.getItem("ultimate-question-builder:openai-api-key")).toBe("sk-persisted");
    await user.type(screen.getByLabelText("AI에게 묻고 싶은 질문"), "저장된 키가 메뉴를 열어도 유지되는지 확인하고 싶어.");
    await user.click(screen.getByRole("button", { name: "시작" }));

    await screen.findByText("방향");
    expect(fetch).toHaveBeenCalledWith(
      "/api/analyze-question",
      expect.objectContaining({
        body: expect.stringContaining("sk-persisted")
      })
    );
  });
});
