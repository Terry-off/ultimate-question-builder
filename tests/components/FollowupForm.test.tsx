import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FollowupForm } from "@/components/FollowupForm";
import type { DirectionSetting, FollowupQuestion } from "@/lib/types";

const questions: FollowupQuestion[] = [
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
];

const directionSettings: DirectionSetting[] = [
  { type: "strategy_business", reason: "사업 가능성을 먼저 봐야 해요.", weight: 80 },
  { type: "critique_risk", reason: "실패할 수 있는 이유도 같이 봐야 해요.", weight: 45 }
];

describe("FollowupForm", () => {
  it("collects answers and submits all six custom follow-up questions", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<FollowupForm questions={[...questions]} directionSettings={directionSettings} initialAnswers={{}} onSubmit={onSubmit} />);

    expect(screen.getByLabelText("돈을 낼 고객 직접 입력").tagName).toBe("INPUT");
    expect(screen.queryByText("Step 2")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "작은 팀의 리더" }));
    await user.click(screen.getByRole("button", { name: "궁극의 질문 생성" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: "paying_customer", purpose: "돈을 낼 고객", answer: "작은 팀의 리더" }),
        expect.objectContaining({ id: "current_alternative", purpose: "지금 쓰는 방법", answer: "" })
      ]),
      directionSettings
    );
    expect(screen.getByText("답변을 조금 더 골라주세요.")).toBeInTheDocument();
  });

  it("lets users select multiple choices and add their own text", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<FollowupForm questions={[...questions]} directionSettings={directionSettings} initialAnswers={{}} onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "혼자 일하는 사람" }));
    await user.click(screen.getByRole("button", { name: "작은 팀의 리더" }));
    await user.type(screen.getByLabelText("돈을 낼 고객 직접 입력"), "B2B 팀 리더도 같이 보고 싶어요");
    await user.click(screen.getByRole("button", { name: "궁극의 질문 생성" }));

    expect(screen.getByRole("button", { name: "혼자 일하는 사람" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "작은 팀의 리더" })).toHaveAttribute("aria-pressed", "true");
    expect(onSubmit).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: "paying_customer",
          purpose: "돈을 낼 고객",
          answer: ["혼자 일하는 사람", "작은 팀의 리더", "B2B 팀 리더도 같이 보고 싶어요"].join("\n")
        })
      ]),
      directionSettings
    );
  });

  it("submits adjusted direction slider values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<FollowupForm questions={[...questions]} directionSettings={directionSettings} initialAnswers={{}} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("사업 가능성을 보고 싶어요 반영 정도"), { target: { value: "95" } });
    await user.click(screen.getByRole("button", { name: "궁극의 질문 생성" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.any(Array),
      expect.arrayContaining([
        expect.objectContaining({ type: "strategy_business", weight: 95 }),
        expect.objectContaining({ type: "critique_risk", weight: 45 })
      ])
    );
  });

  it("submits adjusted direction values from the mobile dial", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<FollowupForm questions={[...questions]} directionSettings={directionSettings} initialAnswers={{}} onSubmit={onSubmit} />);

    fireEvent.keyDown(screen.getByRole("slider", { name: "사업 가능성을 보고 싶어요 모바일 다이얼" }), { key: "ArrowRight" });
    await user.click(screen.getByRole("button", { name: "궁극의 질문 생성" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.any(Array),
      expect.arrayContaining([
        expect.objectContaining({ type: "strategy_business", weight: 85 }),
        expect.objectContaining({ type: "critique_risk", weight: 45 })
      ])
    );
  });
});
