import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ResultTabs } from "@/components/ResultTabs";
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

describe("ResultTabs", () => {
  it("renders final result content without step labels", () => {
    render(<ResultTabs result={result} />);

    expect(screen.getByText("AI에게 물어보는 궁극의 질문입니다.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "짧게 물어보기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "깊게 물어보기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "전문가로 물어보기" })).toBeInTheDocument();
    expect(screen.queryByText("Step 3")).not.toBeInTheDocument();
    expect(screen.queryByText("Step 4")).not.toBeInTheDocument();
  });

  it("resets copy feedback when users select another prompt version", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) }
    });
    render(<ResultTabs result={result} />);

    await user.click(screen.getByRole("button", { name: "복사" }));
    expect(screen.getByRole("button", { name: "복사됨" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "짧게 물어보기" }));

    expect(screen.getByRole("button", { name: "복사" })).toBeInTheDocument();
  });

  it("resets copy feedback on version changes even when prompt text is identical", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) }
    });
    render(
      <ResultTabs
        result={{
          ...result,
          shortVersion: "같은 질문",
          deepVersion: "같은 질문",
          expertVersion: "같은 질문"
        }}
      />
    );

    await user.click(screen.getByRole("button", { name: "복사" }));
    expect(screen.getByRole("button", { name: "복사됨" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "전문가로 물어보기" }));

    expect(screen.getByRole("button", { name: "복사" })).toBeInTheDocument();
  });
});
