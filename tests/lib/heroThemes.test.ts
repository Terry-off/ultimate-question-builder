import { describe, expect, it } from "vitest";
import { getEnabledHeroThemes, getHeroThemeStyle, HERO_THEMES, selectRandomHeroTheme } from "@/lib/heroThemes";

describe("hero theme registry", () => {
  it("keeps every configured Spline hero in one registry", () => {
    expect(HERO_THEMES).toHaveLength(7);
    expect(HERO_THEMES.map((theme) => theme.splineUrl)).toEqual([
      "https://my.spline.design/nexbotrobotcharacterconcept-Gzlk5cCKXuRUpeFXKYo5NQa8/",
      "https://my.spline.design/genkubgreetingrobot-6KnCXjHnweub6Tg0ii7CrrWv/",
      "https://my.spline.design/magiclock-9BEvo8IAdiqkmV2oCzlWjcee/",
      "https://my.spline.design/zerogravityphysicslandingpage-91iSUa2r2R85qk8D74elf5Pi/",
      "https://my.spline.design/thebluemarble-2KNR2Z7eB73PaHPmd4dC9MCC/",
      "https://my.spline.design/unchained-5MOmHZnGW3yfhPJzg53oK5WS/",
      "https://my.spline.design/animatedpaperboat-ppXNonvnqrOn60Qj3EEaFbmR/"
    ]);
  });

  it("selects only enabled themes from the random pool", () => {
    expect(getEnabledHeroThemes()).toHaveLength(7);
    expect(selectRandomHeroTheme(() => 0).id).toBe("nexbot");
    expect(selectRandomHeroTheme(() => 0.999).id).toBe("paper-boat");
  });

  it("exposes readable design tokens for the selected theme", () => {
    const paperBoat = selectRandomHeroTheme(() => 0.999);
    const style = getHeroThemeStyle(paperBoat);

    expect(style["--accent"]).toBe("#ffdd9a");
    expect(style["--hero-stage-bg"]).toBe("#d9eef2");
    expect(style["--glass-panel-bg"]).toContain("rgba(8, 17, 22");
    expect(style["--result-backdrop-bg"]).toContain("0.76");
  });
});
