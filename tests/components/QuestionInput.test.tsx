import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuestionInput } from "@/components/QuestionInput";

describe("QuestionInput", () => {
  it("shows the welcoming first-screen copy", () => {
    render(
      <QuestionInput
        rawQuestion=""
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText("너의 생각을 아무거나 적어봐. 내가 최고의 질문으로 만들어줄게.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "내 생각을 도와줘" })).toBeInTheDocument();
  });
});
