"use client";

import type { CSSProperties, PointerEvent } from "react";

type LoadingLayerProps = {
  mode: "analyze" | "synthesize";
  question: string;
};

const loadingCopy = {
  analyze: {
    title: "생각 중",
    primary: "질문을 읽고 있어요",
    steps: ["의도를 찾고 있어요", "빠진 단서를 보고 있어요", "다음 질문을 만들고 있어요"],
    chips: ["읽기", "분해", "질문"]
  },
  synthesize: {
    title: "조립 중",
    primary: "답변을 합치고 있어요",
    steps: ["선택한 방향을 반영해요", "문장을 다듬고 있어요", "최종 질문을 완성해요"],
    chips: ["선택", "정리", "완성"]
  }
};

export function LoadingLayer({ mode, question }: LoadingLayerProps) {
  const copy = loadingCopy[mode];
  const preview = question.trim().replace(/\s+/g, " ").slice(0, 64);
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
        <p className="loading-title">{copy.title}</p>
        <p className="loading-primary">{copy.primary}</p>
        {preview ? <p className="loading-question">{preview}</p> : null}
        <div className="loading-bars" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="loading-feed">
          {copy.steps.map((step) => (
            <span key={step}>{step}</span>
          ))}
        </div>
        <div className="loading-steps" aria-hidden="true">
          {copy.chips.map((chip) => (
            <span key={chip}>{chip}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
