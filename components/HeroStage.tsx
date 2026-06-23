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

const assertNever = (value: never): never => {
  throw new Error(`Unsupported hero source: ${JSON.stringify(value)}`);
};

export function HeroStage({ theme, splineReady, isFirstScreen, onSplineReadyChange, children }: HeroStageProps) {
  const mediaClassName = `spline-embed ${splineReady ? "spline-embed-ready" : ""}`;
  const heroTitle = `${theme.name} hero animation`;
  let heroMedia: ReactNode;

  switch (theme.source.kind) {
    case "spline":
      heroMedia = (
        <iframe
          key={theme.id}
          title={heroTitle}
          src={theme.source.url}
          data-hero-id={theme.id}
          frameBorder="0"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          onLoad={() => onSplineReadyChange(true)}
          onError={() => onSplineReadyChange(false)}
          className={mediaClassName}
        />
      );
      break;
    case "video":
      heroMedia = (
        <video
          key={theme.id}
          title={heroTitle}
          aria-label={heroTitle}
          data-hero-id={theme.id}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={() => onSplineReadyChange(true)}
          onError={() => onSplineReadyChange(false)}
          className={`${mediaClassName} hero-video`}
        >
          <source src={theme.source.url} type="video/mp4" />
        </video>
      );
      break;
    default:
      heroMedia = assertNever(theme.source);
  }

  return (
    <section className="hero-stage" aria-label="첫 질문 입력">
      <div className="spline-frame">{heroMedia}</div>
      {isFirstScreen ? <MatrixClickEffect /> : null}
      {isFirstScreen ? <div className="hero-input-layer">{children}</div> : null}
    </section>
  );
}
