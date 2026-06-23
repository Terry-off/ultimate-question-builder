import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Page from "@/app/page";

describe("hero robot wheel behavior", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ hasApiKey: false }), { status: 200 })));
  });

  it("keeps the robot background fixed when the mouse wheel moves", () => {
    const { container } = render(<Page />);

    const wheelLayer = container.querySelector(".robot-wheel-layer");
    const splineFrame = screen.getByTitle("NEXBOT robot animation").parentElement;
    expect(wheelLayer).not.toBeNull();
    expect(splineFrame).not.toBeNull();

    if (wheelLayer && splineFrame) {
      fireEvent.wheel(wheelLayer, { deltaY: -120 });
      expect(splineFrame).not.toHaveStyle("transform: scale(1.08)");

      fireEvent.wheel(wheelLayer, { deltaY: 120 });
      expect(splineFrame).not.toHaveStyle("transform: scale(0.92)");
    }
  });
});
