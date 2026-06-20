import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FollowupForm } from "@/components/FollowupForm";

const questions = [
  { id: "goal", purpose: "goal", question: "목표는 무엇인가요?" },
  { id: "context", purpose: "context", question: "맥락은 무엇인가요?" },
  { id: "known_or_excluded", purpose: "known_or_excluded", question: "제외할 답변은 무엇인가요?" },
  { id: "tension_or_assumption", purpose: "tension_or_assumption", question: "긴장은 무엇인가요?" },
  { id: "output_or_validation", purpose: "output_or_validation", question: "출력은 무엇인가요?" }
] as const;

describe("FollowupForm", () => {
  it("collects answers and submits all five purposes", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<FollowupForm questions={[...questions]} initialAnswers={{}} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("목표"), "시장 검증");
    await user.click(screen.getByRole("button", { name: "궁극 질문 만들기" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ purpose: "goal", answer: "시장 검증" }),
        expect.objectContaining({ purpose: "context", answer: "" })
      ])
    );
    expect(screen.getByText("목표와 맥락이 비어 있으면 결과가 약해질 수 있습니다.")).toBeInTheDocument();
  });
});
