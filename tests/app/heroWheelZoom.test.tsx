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

  it("shows a matrix click effect only when the first-screen background is clicked", () => {
    const { container } = render(<Page />);

    const clickZone = container.querySelector(".matrix-click-zone-left");
    if (!(clickZone instanceof HTMLElement)) throw new Error("매트릭스 클릭 구역을 찾지 못했습니다.");
    fireEvent.pointerDown(clickZone, { clientX: 240, clientY: 320 });

    const burst = container.querySelector(".matrix-click-burst");
    expect(burst).toBeInTheDocument();
    expect(container.querySelector(".matrix-stream")).toBeInTheDocument();

    const textarea = container.querySelector("#raw-question");
    if (!(textarea instanceof HTMLElement)) throw new Error("첫 질문 입력창을 찾지 못했습니다.");
    fireEvent.pointerDown(textarea, { clientX: 300, clientY: 360 });

    expect(container.querySelectorAll(".matrix-click-burst")).toHaveLength(1);
  });
});
