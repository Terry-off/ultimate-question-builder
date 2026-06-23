import { describe, expect, it } from "vitest";
import { getEnabledHeroThemes, getHeroThemeStyle, HERO_THEMES, selectRandomHeroTheme } from "@/lib/heroThemes";

describe("hero theme registry", () => {
  it("keeps every configured hero source in one registry", () => {
    expect(HERO_THEMES).toHaveLength(9);
    expect(HERO_THEMES.map((theme) => theme.source.url)).toEqual([
      "https://my.spline.design/nexbotrobotcharacterconcept-Gzlk5cCKXuRUpeFXKYo5NQa8/",
      "https://my.spline.design/genkubgreetingrobot-6KnCXjHnweub6Tg0ii7CrrWv/",
      "https://my.spline.design/magiclock-9BEvo8IAdiqkmV2oCzlWjcee/",
      "https://my.spline.design/zerogravityphysicslandingpage-91iSUa2r2R85qk8D74elf5Pi/",
      "https://my.spline.design/thebluemarble-2KNR2Z7eB73PaHPmd4dC9MCC/",
      "https://my.spline.design/unchained-5MOmHZnGW3yfhPJzg53oK5WS/",
      "https://my.spline.design/animatedpaperboat-ppXNonvnqrOn60Qj3EEaFbmR/",
      "https://sxcontent9668.azureedge.us/cms-assets/assets/20260522_Starship_Flight12_web1920_v2_71d68b5ee9.mp4",
      "https://sxcontent9668.azureedge.us/cms-assets/assets/Space_X_Falcon_Heavy_UAS_Landing_DESKTOP_compress_b4568daf9c_5e2026727a.mp4"
    ]);
  });

  it("selects only enabled themes from the random pool", () => {
    expect(getEnabledHeroThemes()).toHaveLength(9);
    expect(selectRandomHeroTheme(() => 0).id).toBe("nexbot");
    expect(selectRandomHeroTheme(() => 0.999).id).toBe("falcon-heavy-landing");
  });

  it("exposes readable design tokens for the selected theme", () => {
    const paperBoat = selectRandomHeroTheme(() => 0.74);
    const style = getHeroThemeStyle(paperBoat);

    expect(style["--accent"]).toBe("#ffdd9a");
    expect(style["--hero-stage-bg"]).toBe("#d9eef2");
    expect(style["--glass-panel-bg"]).toContain("rgba(8, 17, 22");
    expect(style["--result-backdrop-bg"]).toContain("0.76");
  });

  it("uses a monochrome SpaceX-inspired token set for the Starship video theme", () => {
    const starship = selectRandomHeroTheme(() => 0.84);
    const style = getHeroThemeStyle(starship);

    expect(starship.source.kind).toBe("video");
    expect(style["--accent"]).toBe("#f0f0fa");
    expect(style["--action-gradient"]).toContain("#f0f0fa");
    expect(style["--glass-panel-bg"]).toContain("rgba(240, 240, 250");
  });

  it("uses a monochrome SpaceX-inspired token set for the Falcon Heavy landing video theme", () => {
    const falconHeavy = selectRandomHeroTheme(() => 0.999);
    const style = getHeroThemeStyle(falconHeavy);

    expect(falconHeavy.id).toBe("falcon-heavy-landing");
    expect(falconHeavy.source.kind).toBe("video");
    expect(style["--accent"]).toBe("#f0f0fa");
    expect(style["--question-console-bg"]).toContain("rgba(240, 240, 250");
  });
});
