import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FollowupForm } from "@/components/FollowupForm";
import type { FollowupQuestion } from "@/lib/types";

const questions: FollowupQuestion[] = [
  { id: "goal", purpose: "goal", question: "무엇을 정하고 싶나요?", choices: ["사업을 계속할지 정하고 싶어요", "고객을 정하고 싶어요", "위험한 점을 알고 싶어요", "첫 실험을 정하고 싶어요"] },
  { id: "context", purpose: "context", question: "지금은 어느 단계인가요?", choices: ["처음 떠올린 단계예요", "주변 반응을 들었어요", "간단히 만들어봤어요", "돈을 낸 사람이 있어요"] },
  { id: "known_or_excluded", purpose: "known_or_excluded", question: "빼고 싶은 답은 무엇인가요?", choices: ["뻔한 장단점은 빼주세요", "큰 회사 사례는 빼주세요", "기술 설명은 줄여주세요", "이미 경쟁자는 봤어요"] },
  { id: "tension_or_assumption", purpose: "tension_or_assumption", question: "가장 불안한 부분은 무엇인가요?", choices: ["고객이 돈을 낼지 모르겠어요", "경쟁 앱과 달라 보일지 걱정돼요", "혼자 만들 수 있을지 모르겠어요", "처음 고객을 찾기 어려워요"] },
  { id: "output_or_validation", purpose: "output_or_validation", question: "어떤 형태의 답이 필요하나요?", choices: ["바로 할 일 목록", "위험도 높은 순서", "검증 실험 3개", "짧은 결론 먼저"] }
];

describe("FollowupForm", () => {
  it("collects answers and submits all five purposes", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<FollowupForm questions={[...questions]} initialAnswers={{}} onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "위험한 점을 알고 싶어요" }));
    expect(screen.getByLabelText("정하고 싶은 것 직접 입력")).toHaveValue("위험한 점을 알고 싶어요");
    await user.click(screen.getByRole("button", { name: "궁극 질문 만들기" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ purpose: "goal", answer: "위험한 점을 알고 싶어요" }),
        expect.objectContaining({ purpose: "context", answer: "" })
      ])
    );
    expect(screen.getByText("정하고 싶은 것과 지금 상황이 비어 있으면 답이 약해질 수 있어요.")).toBeInTheDocument();
  });
});
