"use client";

import type { CSSProperties, PointerEvent } from "react";

type LoadingLayerProps = {
  mode: "analyze" | "synthesize";
  question: string;
};

const loadingCopy = {
  analyze: {
    title: "생각 중",
    primary: "질문 속 숨은 목적을 찾고 있어요",
    steps: [
      "입력한 문장을 작은 단서로 나누고 있어요",
      "누가, 무엇을, 왜 묻는지 확인하고 있어요",
      "뻔한 답으로 흐를 위험을 걸러내고 있어요",
      "더 물어봐야 할 빈칸을 찾고 있어요",
      "바로 고를 수 있는 후속 질문 6개를 만들고 있어요"
    ],
    chips: ["읽기", "의도", "빈칸", "질문 6개"]
  },
  synthesize: {
    title: "조립 중",
    primary: "답변을 궁극의 질문으로 합치고 있어요",
    steps: [
      "선택한 답과 직접 입력한 내용을 합치고 있어요",
      "방향 슬라이더 값을 최종 질문에 반영하고 있어요",
      "AI가 헷갈리지 않게 조건을 정리하고 있어요",
      "짧게, 깊게, 전문가 버전으로 문장을 나누고 있어요",
      "마지막으로 뻔한 표현을 덜어내고 있어요"
    ],
    chips: ["답변", "방향", "조건", "완성"]
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
