"use client";

import type { ReactNode } from "react";
import type { HeroTheme } from "@/lib/heroThemes";
import { MatrixClickEffect } from "./MatrixClickEffect";

type HeroStageProps = {
  readonly theme: HeroTheme;
  readonly splineReady: boolean;
  readonly isFirstScreen: boolean;
  readonly onSplineReadyChange: (ready: boolean) => void;
  readonly children: ReactNode;
};

export function HeroStage({ theme, splineReady, isFirstScreen, onSplineReadyChange, children }: HeroStageProps) {
  return (
    <section className="hero-stage" aria-label="첫 질문 입력">
      <div className="spline-frame">
        <iframe
          key={theme.id}
          title={`${theme.name} hero animation`}
          src={theme.splineUrl}
          data-hero-id={theme.id}
          frameBorder="0"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          onLoad={() => onSplineReadyChange(true)}
          onError={() => onSplineReadyChange(false)}
          className={`spline-embed ${splineReady ? "spline-embed-ready" : ""}`}
        />
      </div>
      {isFirstScreen ? <MatrixClickEffect /> : null}
      {isFirstScreen ? <div className="hero-input-layer">{children}</div> : null}
    </section>
  );
}
