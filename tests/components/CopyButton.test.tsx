import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CopyButton } from "@/components/CopyButton";

describe("CopyButton", () => {
  it("copies text and shows feedback", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    });
    render(<CopyButton text="복사할 프롬프트" />);

    await user.click(screen.getByRole("button", { name: "복사" }));

    expect(writeText).toHaveBeenCalledWith("복사할 프롬프트");
    expect(screen.getByRole("button", { name: "복사됨" })).toBeInTheDocument();
  });
});
