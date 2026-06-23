import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HistoryMenu } from "@/components/HistoryMenu";
import type { PromptHistoryEntry } from "@/lib/promptHistory";

const createHistoryEntry = (id: string, title = "테스트 질문"): PromptHistoryEntry => ({
  id,
  title,
  rawQuestion: "사용자가 처음 입력한 질문입니다",
  analysis: {
    primaryType: "idea_generation",
    secondaryTypes: [],
    confidence: 0.9,
    surfaceQuestion: "겉으로 보이는 질문",
    deeperIntent: "더 좋은 질문을 만들고 싶음",
    genericAnswerRisk: "답변이 너무 뻔해질 수 있음",
    missingDimensions: [],
    recommendedFollowupFocus: [],
    recommendedTypeOptions: [{ type: "idea_generation", reason: "아이디어를 넓히기 위해" }],
    followupQuestions: Array.from({ length: 6 }, (_, index) => ({
      id: `followup-${index}`,
      purpose: "추가 확인",
      intent: "사용자의 생각을 더 잘 이해하기 위해",
      question: "무엇을 더 알고 싶나요?",
      choices: ["첫 번째", "두 번째", "세 번째", "네 번째"]
    }))
  },
  directionSettings: [{ type: "idea_generation", reason: "아이디어를 넓히기 위해", weight: 100 }],
  followupAnswers: Array.from({ length: 6 }, (_, index) => ({
    id: `answer-${index}`,
    purpose: "추가 확인",
    question: "무엇을 더 알고 싶나요?",
    answer: "답변"
  })),
  result: {
    shortVersion: "짧게 묻기",
    deepVersion: "깊게 묻기",
    expertVersion: "전문가로 묻기",
    whyThisPromptIsStrong: ["맥락이 선명합니다"],
    qualityScore: {
      total: 80,
      context: 12,
      goal: 12,
      knownExclusions: 8,
      tension: 16,
      perspectiveCollision: 12,
      selfRefutation: 8,
      outputClarity: 12
    },
    improvementSuggestions: []
  },
  createdAt: "2026-06-23T00:00:00.000Z",
  updatedAt: "2026-06-23T00:00:00.000Z"
});

describe("HistoryMenu", () => {
  it("closes the popover when users click outside", async () => {
    const user = userEvent.setup();

    render(
      <>
        <HistoryMenu entries={[]} onSelect={vi.fn()} onDelete={vi.fn()} />
        <button type="button">바깥 영역</button>
      </>
    );

    await user.click(screen.getByRole("button", { name: "히스토리" }));
    expect(screen.getByText("질문 히스토리")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "바깥 영역" }));

    expect(screen.queryByText("질문 히스토리")).not.toBeInTheDocument();
  });

  it("closes the popover through the dismiss layer", async () => {
    const user = userEvent.setup();

    render(<HistoryMenu entries={[]} onSelect={vi.fn()} onDelete={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "히스토리" }));
    expect(screen.getByText("질문 히스토리")).toBeInTheDocument();

    await user.click(await screen.findByLabelText("메뉴 닫기"));

    expect(screen.queryByText("질문 히스토리")).not.toBeInTheDocument();
  });

  it("hides the history count after users open the history list", async () => {
    const user = userEvent.setup();

    render(<HistoryMenu entries={[createHistoryEntry("first")]} onSelect={vi.fn()} onDelete={vi.fn()} />);

    expect(document.querySelector(".history-count")).toHaveTextContent("1");

    await user.click(screen.getByRole("button", { name: /히스토리/ }));

    expect(document.querySelector(".history-popover")).toBeInTheDocument();
    expect(document.querySelector(".history-count")).toBeNull();
  });

  it("shows the history count again only for newly added entries", async () => {
    const user = userEvent.setup();
    const selectHistory = vi.fn();
    const deleteHistory = vi.fn();
    const firstEntry = createHistoryEntry("first");
    const secondEntry = createHistoryEntry("second", "새 테스트 질문");
    const { rerender } = render(<HistoryMenu entries={[firstEntry]} onSelect={selectHistory} onDelete={deleteHistory} />);

    await user.click(screen.getByRole("button", { name: /히스토리/ }));
    await user.click(screen.getByRole("button", { name: /히스토리/ }));

    rerender(<HistoryMenu entries={[secondEntry, firstEntry]} onSelect={selectHistory} onDelete={deleteHistory} />);

    expect(document.querySelector(".history-count")).toHaveTextContent("1");
  });
});
