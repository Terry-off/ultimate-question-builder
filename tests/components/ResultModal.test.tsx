import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ResultModal } from "@/components/ResultModal";
import type { UltimatePromptResult } from "@/lib/types";

const result: UltimatePromptResult = {
  shortVersion: "짧은 질문",
  deepVersion: "깊은 질문",
  expertVersion: "전문가 질문",
  whyThisPromptIsStrong: ["사고 장치를 포함합니다."],
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
};

describe("ResultModal", () => {
  it("lets users edit the current prompt and request a refined answer", async () => {
    const user = userEvent.setup();
    const onRefine = vi.fn();

    render(
      <ResultModal
        result={result}
        loading={false}
        onBackToFollowups={vi.fn()}
        onReset={vi.fn()}
        onRefine={onRefine}
      />
    );

    expect(screen.getByRole("button", { name: "이전 질문 선택 다시하기" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "내용수정" }));

    expect(screen.getByText("지금 본문을 직접 수정할 수 있어요.")).toBeInTheDocument();
    const editablePrompt = screen.getByLabelText("깊게 물어보기 본문 수정");
    expect(editablePrompt).toHaveValue("깊은 질문");

    await user.clear(editablePrompt);
    await user.type(editablePrompt, "편집한 깊은 질문");
    await user.type(screen.getByLabelText("결과를 보고 추가로 반영할 내용"), "표현을 더 전문가답게 다듬어줘.");
    await user.click(screen.getByRole("button", { name: "다시 답변 받기" }));

    expect(onRefine).toHaveBeenCalledWith({
      selectedVersion: "deepVersion",
      editedPrompt: "편집한 깊은 질문",
      feedback: "표현을 더 전문가답게 다듬어줘."
    });
  });

  it("marks the refinement action as busy while regenerating", () => {
    render(
      <ResultModal
        result={result}
        loading={true}
        onBackToFollowups={vi.fn()}
        onReset={vi.fn()}
        onRefine={vi.fn()}
      />
    );

    const action = screen.getByRole("button", { name: "다시 만드는 중..." });

    expect(action).toBeDisabled();
    expect(action).toHaveClass("is-refining");
    expect(action).toHaveAttribute("aria-busy", "true");
  });
});
