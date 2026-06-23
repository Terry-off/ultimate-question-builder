import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Page from "@/app/page";

const analysisResponse = {
  primaryType: "strategy_business",
  secondaryTypes: ["idea_generation"],
  confidence: 0.86,
  surfaceQuestion: "Cafe launch question",
  deeperIntent: "The user wants a more useful prompt before asking AI.",
  genericAnswerRisk: "A generic answer would skip the real constraints.",
  missingDimensions: ["customer", "format"],
  recommendedFollowupFocus: ["customer", "format"],
  recommendedTypeOptions: [
    { type: "strategy_business", reason: "Business direction matters most." },
    { type: "idea_generation", reason: "The user still needs fresh options." }
  ],
  followupQuestions: [
    {
      id: "customer",
      purpose: "main customer",
      intent: "Find who the prompt should focus on.",
      question: "Who should this cafe serve first?",
      choices: ["quiet workers", "coffee fans", "tourists", "neighbors"]
    },
    {
      id: "mood",
      purpose: "mood",
      intent: "Find the feeling to preserve.",
      question: "What feeling should the cafe have?",
      choices: ["warm", "premium", "small trip", "fast"]
    },
    {
      id: "menu",
      purpose: "menu",
      intent: "Find the menu direction.",
      question: "What should the menu focus on?",
      choices: ["signature coffee", "dessert", "simple brunch", "seasonal"]
    },
    {
      id: "test",
      purpose: "first test",
      intent: "Find the first realistic test.",
      question: "How should the idea be tested first?",
      choices: ["pop-up", "survey", "preorder", "friends"]
    },
    {
      id: "risk",
      purpose: "risk",
      intent: "Find the biggest concern.",
      question: "What is the biggest risk?",
      choices: ["rent", "traffic", "taste", "brand"]
    },
    {
      id: "output",
      purpose: "answer shape",
      intent: "Find the desired answer format.",
      question: "What answer format helps most?",
      choices: ["short plan", "deep plan", "checklist", "expert view"]
    }
  ]
} as const;

describe("main page synthesis errors", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/api/api-key")) {
        return new Response(JSON.stringify({ hasApiKey: true }), { status: 200 });
      }

      if (url.includes("/api/analyze-question")) {
        return new Response(JSON.stringify(analysisResponse), { status: 200 });
      }

      if (url.includes("/api/synthesize-ultimate-prompt")) {
        return new Response(JSON.stringify({ error: "2단계 생성에 실패했어요. API 키나 모델을 확인해주세요." }), { status: 502 });
      }

      return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
    }));
  });

  it("shows the step two API error instead of silently returning to the follow-up form", async () => {
    const user = userEvent.setup();
    render(<Page />);

    await user.click(screen.getByRole("button", { name: /API/ }));
    await user.type(screen.getByLabelText(/OpenAI API/), "sk-test");
    await user.click(screen.getByRole("button", { name: /적용/ }));

    await user.type(screen.getByRole("textbox"), "I want to turn a cafe idea into a concrete launch question.");
    await user.click(screen.getByRole("button", { name: /궁극.*질문.*만들/ }));

    await user.click(await screen.findByRole("button", { name: "quiet workers" }));
    await user.click(screen.getByRole("button", { name: "warm" }));
    await user.click(screen.getByRole("button", { name: /궁극.*질문.*생성/ }));

    await waitFor(() => expect(fetch).toHaveBeenCalledWith(
      "/api/synthesize-ultimate-prompt",
      expect.objectContaining({ method: "POST" })
    ));
    expect(await screen.findByRole("alert")).toHaveTextContent("2단계 생성에 실패했어요. API 키나 모델을 확인해주세요.");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
