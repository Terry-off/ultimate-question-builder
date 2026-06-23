import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Page from "@/app/page";

describe("hero robot wheel behavior", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ hasApiKey: false }), { status: 200 })));
  });

  it("keeps the robot background fixed when the mouse wheel moves", () => {
    const { container } = render(<Page />);

    const heroStage = screen.getByLabelText("첫 질문 입력");
    const splineFrame = screen.getByTitle("NEXBOT robot animation").parentElement;
    expect(container.querySelector(".robot-wheel-layer")).toBeNull();
    expect(splineFrame).not.toBeNull();

    if (splineFrame) {
      fireEvent.wheel(heroStage, { deltaY: -120 });
      expect(splineFrame).not.toHaveStyle("transform: scale(1.08)");

      fireEvent.wheel(heroStage, { deltaY: 120 });
      expect(splineFrame).not.toHaveStyle("transform: scale(0.92)");
    }
  });
});
