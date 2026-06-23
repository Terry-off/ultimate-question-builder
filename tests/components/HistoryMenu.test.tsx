import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HistoryMenu } from "@/components/HistoryMenu";

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
});
