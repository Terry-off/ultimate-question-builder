"use client";

import { useState, type PointerEvent } from "react";

type MatrixColumn = {
  readonly id: number;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly delay: number;
  readonly text: string;
};

type MatrixBurst = {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly columns: readonly MatrixColumn[];
};

const MATRIX_TOKENS = ["0", "1", "AI", "01", "//", "<>"] as const;

export function MatrixClickEffect() {
  const [matrixBursts, setMatrixBursts] = useState<MatrixBurst[]>([]);

  const addMatrixBurst = (event: PointerEvent<HTMLElement>) => {
    const columns = Array.from({ length: 17 }, (_, index) => ({
      id: index,
      offsetX: (index - 8) * 14 + Math.round(Math.random() * 10 - 5),
      offsetY: Math.round(Math.random() * 18 - 28),
      delay: index * 14,
      text: Array.from({ length: 8 }, () => MATRIX_TOKENS[Math.floor(Math.random() * MATRIX_TOKENS.length)] ?? "0").join("")
    }));
    const burst = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      x: event.clientX,
      y: event.clientY,
      columns
    };
    setMatrixBursts((current) => [...current.slice(-3), burst]);
  };

  const removeMatrixBurst = (id: string) => {
    setMatrixBursts((current) => current.filter((item) => item.id !== id));
  };

  return (
    <>
      <div className="matrix-click-zones" aria-hidden="true">
        <div className="matrix-click-zone matrix-click-zone-left" onPointerDown={addMatrixBurst} />
        <div className="matrix-click-zone matrix-click-zone-right" onPointerDown={addMatrixBurst} />
        <div className="matrix-click-zone matrix-click-zone-top" onPointerDown={addMatrixBurst} />
        <div className="matrix-click-zone matrix-click-zone-bottom" onPointerDown={addMatrixBurst} />
      </div>
      {matrixBursts.length > 0 ? (
        <div className="matrix-click-layer" aria-hidden="true">
          {matrixBursts.map((burst) => (
            <div
              key={burst.id}
              className="matrix-click-burst"
              style={{ left: `${burst.x}px`, top: `${burst.y}px` }}
              onAnimationEnd={() => removeMatrixBurst(burst.id)}
            >
              {burst.columns.map((column) => (
                <span
                  key={column.id}
                  className="matrix-stream-origin"
                  style={{ left: `${column.offsetX}px`, top: `${column.offsetY}px` }}
                >
                  <span className="matrix-stream" style={{ animationDelay: `${column.delay}ms` }}>
                    {column.text}
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}
