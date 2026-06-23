import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Page from "@/app/page";
import { PROMPT_HISTORY_STORAGE_KEY, type PromptHistoryEntry } from "@/lib/promptHistory";
import type { QuestionAnalysis, UltimatePromptResult } from "@/lib/types";

const analysis: QuestionAnalysis = {
  primaryType: "strategy_business",
  secondaryTypes: ["idea_generation"],
  confidence: 0.86,
  surfaceQuestion: "카페 콘셉트 질문",
  deeperIntent: "작은 카페의 방향과 실행 순서를 선명하게 만들고 싶어한다.",
  genericAnswerRisk: "예쁜 분위기 추천으로만 끝날 수 있다.",
  missingDimensions: ["주요 손님", "처음 시험할 방법"],
  recommendedFollowupFocus: ["주요 손님", "공간 분위기"],
  recommendedTypeOptions: [
    { type: "strategy_business", reason: "사업 방향을 먼저 봐야 해요." },
    { type: "idea_generation", reason: "아이디어를 더 열고 싶어요." }
  ],
  followupQuestions: Array.from({ length: 6 }, (_, index) => ({
    id: `question_${index + 1}`,
    purpose: `질문 ${index + 1}`,
    intent: "최종 질문을 더 잘 만들기 위한 추가 질문입니다.",
    question: `추가로 확인할 내용 ${index + 1}`,
    choices: [`선택 ${index + 1}-A`, `선택 ${index + 1}-B`, `선택 ${index + 1}-C`, `선택 ${index + 1}-D`]
  }))
};

const createResult = (deepVersion: string): UltimatePromptResult => ({
  shortVersion: "짧은 질문",
  deepVersion,
  expertVersion: "전문가 질문",
  whyThisPromptIsStrong: ["맥락이 선명합니다."],
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
  improvementSuggestions: []
});

const setupFetch = (synthesizeBodies: string[]) => {
  vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input.toString();
    const body = typeof init?.body === "string" ? init.body : "";

    if (url.includes("/api/test-api-key")) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    if (url.includes("/api/api-key")) {
      return new Response(JSON.stringify({ hasApiKey: false }), { status: 200 });
    }

    if (url.includes("/api/analyze-question")) {
      return new Response(JSON.stringify(analysis), { status: 200 });
    }

    if (url.includes("/api/synthesize-ultimate-prompt")) {
      synthesizeBodies.push(body);
      const revised = body.includes("\"revision\"");
      return new Response(JSON.stringify(createResult(revised ? "수정된 깊은 질문" : "처음 깊은 질문")), { status: 200 });
    }

    return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
  }));
};

const createFirstResult = async () => {
  const user = userEvent.setup();
  render(<Page />);

  await user.click(screen.getByRole("button", { name: "API등록" }));
  await user.type(screen.getByLabelText("OpenAI API 키"), "sk-test");
  await user.click(screen.getByRole("button", { name: "TEST" }));
  await user.type(screen.getByLabelText("AI에게 묻고 싶은 질문"), "작은 카페 콘셉트를 어떻게 정하면 좋을지 알고 싶어.");
  await user.click(screen.getByRole("button", { name: "궁극의 질문으로 만들어" }));
  await screen.findByText("방향");
  await user.click(screen.getByRole("button", { name: "선택 1-A" }));
  await user.click(screen.getByRole("button", { name: "선택 2-A" }));
  await user.click(screen.getByRole("button", { name: "궁극의 질문 생성" }));
  await screen.findByRole("dialog", { name: "AI에게 물어보는 궁극의 질문입니다." });

  return user;
};

describe("page history and result refinement", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("reruns the API with user feedback and saves the revised result locally", async () => {
    const synthesizeBodies: string[] = [];
    setupFetch(synthesizeBodies);
    const user = await createFirstResult();

    expect(screen.getByText("처음 깊은 질문")).toBeInTheDocument();
    await user.type(screen.getByLabelText("결과를 보고 추가로 반영할 내용"), "더 실행 가능하게 다시 써줘.");
    await user.click(screen.getByRole("button", { name: "다시 답변 받기" }));

    expect(await screen.findByText("수정된 깊은 질문")).toBeInTheDocument();
    expect(synthesizeBodies.some((body) => body.includes("\"revision\"") && body.includes("더 실행 가능하게"))).toBe(true);
    expect(localStorage.getItem(PROMPT_HISTORY_STORAGE_KEY)).toContain("수정된 깊은 질문");
  });

  it("shows the refinement API error inside the result screen", async () => {
    const synthesizeBodies: string[] = [];
    setupFetch(synthesizeBodies);
    const user = await createFirstResult();

    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      const body = typeof init?.body === "string" ? init.body : "";

      if (url.includes("/api/synthesize-ultimate-prompt") && body.includes("\"revision\"")) {
        synthesizeBodies.push(body);
        return new Response(JSON.stringify({ error: "수정 의견을 반영하지 못했습니다." }), { status: 502 });
      }

      if (url.includes("/api/synthesize-ultimate-prompt")) {
        synthesizeBodies.push(body);
        return new Response(JSON.stringify(createResult("처음 깊은 질문")), { status: 200 });
      }

      if (url.includes("/api/api-key")) {
        return new Response(JSON.stringify({ hasApiKey: false }), { status: 200 });
      }

      if (url.includes("/api/analyze-question")) {
        return new Response(JSON.stringify(analysis), { status: 200 });
      }

      return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
    });

    await user.type(screen.getByLabelText("결과를 보고 추가로 반영할 내용"), "현실적으로 바로 만들 수 있게 다시 써줘.");
    await user.click(screen.getByRole("button", { name: "다시 답변 받기" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("수정 의견을 반영하지 못했습니다.");
    expect(screen.getByText("처음 깊은 질문")).toBeInTheDocument();
    expect(synthesizeBodies.some((body) => body.includes("\"revision\""))).toBe(true);
  });

  it("restores saved questions from the history menu", async () => {
    const synthesizeBodies: string[] = [];
    setupFetch(synthesizeBodies);
    const user = await createFirstResult();

    expect(localStorage.getItem(PROMPT_HISTORY_STORAGE_KEY)).toContain("작은 카페");
    await user.click(screen.getByRole("button", { name: "새 질문 만들기" }));
    await user.click(screen.getByRole("button", { name: /히스토리/ }));
    const historyLoadButton = screen.getAllByRole("button", { name: /작은 카페/ }).find((button) => button.classList.contains("history-load"));
    if (!historyLoadButton) throw new Error("히스토리 불러오기 버튼을 찾지 못했습니다.");
    await user.click(historyLoadButton);

    await waitFor(() => expect(screen.getByRole("dialog", { name: "AI에게 물어보는 궁극의 질문입니다." })).toBeInTheDocument());
    expect(screen.getByText("처음 깊은 질문")).toBeInTheDocument();
  });

  it("returns to the first screen when users close a result opened from history", async () => {
    setupFetch([]);
    const user = userEvent.setup();
    const historyEntry: PromptHistoryEntry = {
      id: "history-close-target",
      title: "저장된 질문",
      rawQuestion: "작은 카페 콘셉트를 어떻게 정하면 좋을지 묻고 싶어.",
      analysis,
      directionSettings: [{ type: "strategy_business", reason: "사업 방향을 먼저 봐야 해요.", weight: 100 }],
      followupAnswers: analysis.followupQuestions.map((question) => ({
        id: question.id,
        purpose: question.purpose,
        question: question.question,
        answer: "저장된 답변"
      })),
      result: createResult("히스토리에서 불러온 깊은 질문"),
      createdAt: "2026-06-23T00:00:00.000Z",
      updatedAt: "2026-06-23T00:00:00.000Z"
    };
    localStorage.setItem(PROMPT_HISTORY_STORAGE_KEY, JSON.stringify([historyEntry]));

    render(<Page />);
    await waitFor(() => expect(document.querySelector(".history-count")).toHaveTextContent("1"));

    const historyButton = document.querySelector(".history-menu .topbar-button");
    if (!(historyButton instanceof HTMLElement)) throw new Error("히스토리 버튼을 찾지 못했습니다.");
    await user.click(historyButton);

    const historyLoadButton = await waitFor(() => {
      const button = document.querySelector(".history-load");
      if (!(button instanceof HTMLElement)) throw new Error("히스토리 불러오기 버튼을 찾지 못했습니다.");
      return button;
    });
    await user.click(historyLoadButton);
    await waitFor(() => expect(document.querySelector(".result-modal")).toBeInTheDocument());

    const closeButton = document.querySelector(".modal-close");
    if (!(closeButton instanceof HTMLElement)) throw new Error("결과 닫기 버튼을 찾지 못했습니다.");
    await user.click(closeButton);

    await waitFor(() => expect(document.querySelector("#raw-question")).toBeInTheDocument());
    expect(document.querySelector(".result-modal")).toBeNull();
    expect(document.querySelector(".followup-dock")).toBeNull();
  });
});
