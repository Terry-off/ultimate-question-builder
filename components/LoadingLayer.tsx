"use client";

import type { CSSProperties, PointerEvent } from "react";

type LoadingLayerProps = {
  label: string;
};

export function LoadingLayer({ label }: LoadingLayerProps) {
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--cursor-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--cursor-y", `${event.clientY - rect.top}px`);
  };

  return (
    <div
      className="loading-layer"
      role="status"
      aria-live="polite"
      onPointerMove={handlePointerMove}
      style={{ "--cursor-x": "50%", "--cursor-y": "50%" } as CSSProperties}
    >
      <div className="loading-panel">
        <div className="loading-core" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="loading-title">{label}</p>
        <div className="loading-bars" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="loading-steps" aria-hidden="true">
          <span>맥락</span>
          <span>단서</span>
          <span>질문</span>
        </div>
      </div>
    </div>
  );
}
