import type { CSSProperties } from "react";

export type HeroThemeId =
  | "nexbot"
  | "genku-greeting"
  | "magic-lock"
  | "zero-gravity"
  | "blue-marble"
  | "unchained"
  | "paper-boat"
  | "starship-flight-12"
  | "falcon-heavy-landing";

export type HeroThemeSource =
  | {
      readonly kind: "spline";
      readonly url: string;
    }
  | {
      readonly kind: "video";
      readonly url: string;
    };

export type HeroThemeCssVariables = CSSProperties & {
  readonly "--chrome": string;
  readonly "--muted": string;
  readonly "--panel": string;
  readonly "--panel-strong": string;
  readonly "--line": string;
  readonly "--line-strong": string;
  readonly "--accent": string;
  readonly "--accent-strong": string;
  readonly "--accent-rgb": string;
  readonly "--danger": string;
  readonly "--shell-bg": string;
  readonly "--hero-stage-bg": string;
  readonly "--spline-light-overlay": string;
  readonly "--spline-overlay": string;
  readonly "--spline-loaded-overlay": string;
  readonly "--glass-panel-bg": string;
  readonly "--question-console-bg": string;
  readonly "--surface-sheen": string;
  readonly "--action-gradient": string;
  readonly "--action-text": string;
  readonly "--action-shadow": string;
  readonly "--loading-layer-bg": string;
  readonly "--result-backdrop-bg": string;
};

export type HeroTheme = {
  readonly id: HeroThemeId;
  readonly name: string;
  readonly enabled: boolean;
  readonly source: HeroThemeSource;
  readonly cssVariables: HeroThemeCssVariables;
};

const darkPanel = "rgba(7, 10, 14, 0.78)";
const strongPanel = "rgba(7, 10, 14, 0.92)";

// allow: SIZE_OK - append-only hero theme token registry.
export const HERO_THEMES = [
  {
    id: "nexbot",
    name: "NEXBOT",
    enabled: true,
    source: { kind: "spline", url: "https://my.spline.design/nexbotrobotcharacterconcept-Gzlk5cCKXuRUpeFXKYo5NQa8/" },
    cssVariables: {
      "--chrome": "#f8fbff",
      "--muted": "rgba(248, 251, 255, 0.58)",
      "--panel": darkPanel,
      "--panel-strong": strongPanel,
      "--line": "rgba(255, 255, 255, 0.16)",
      "--line-strong": "rgba(255, 255, 255, 0.28)",
      "--accent": "#72f7ff",
      "--accent-strong": "#18dce9",
      "--accent-rgb": "114, 247, 255",
      "--danger": "#ff9ba6",
      "--shell-bg": "linear-gradient(180deg, transparent 0, #06080b 100dvh), #06080b",
      "--hero-stage-bg": "#d7d7d7",
      "--spline-light-overlay": "radial-gradient(circle at 50% 42%, rgba(255, 255, 255, 0.22), transparent 12%), radial-gradient(ellipse at 50% 55%, rgba(6, 8, 11, 0.24), transparent 31%), radial-gradient(circle at 54% 30%, rgba(114, 247, 255, 0.12), transparent 26%), linear-gradient(90deg, rgba(6, 8, 11, 0.34), transparent 36%, transparent 64%, rgba(6, 8, 11, 0.34))",
      "--spline-overlay": "radial-gradient(circle at 50% 50%, rgba(215, 222, 222, 0.94) 0 52px, transparent 92px), linear-gradient(90deg, rgba(6, 8, 11, 0.5), transparent 22%, transparent 72%, rgba(6, 8, 11, 0.44)), linear-gradient(180deg, rgba(6, 8, 11, 0.18), transparent 34%, rgba(6, 8, 11, 0.76))",
      "--spline-loaded-overlay": "radial-gradient(circle at 50% 50%, rgba(215, 222, 222, 0.74) 0 44px, transparent 86px), linear-gradient(90deg, rgba(6, 8, 11, 0.5), transparent 22%, transparent 72%, rgba(6, 8, 11, 0.44)), linear-gradient(180deg, rgba(6, 8, 11, 0.18), transparent 34%, rgba(6, 8, 11, 0.76))",
      "--glass-panel-bg": "linear-gradient(135deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.04)), rgba(7, 10, 14, 0.74)",
      "--question-console-bg": "linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.025)), rgba(7, 10, 14, 0.58)",
      "--surface-sheen": "linear-gradient(105deg, rgba(255, 255, 255, 0.09), transparent 38%, rgba(114, 247, 255, 0.08))",
      "--action-gradient": "linear-gradient(135deg, #f0ffff, #18dce9)",
      "--action-text": "#020507",
      "--action-shadow": "rgba(24, 220, 233, 0.26)",
      "--loading-layer-bg": "linear-gradient(180deg, rgba(6, 8, 11, 0.12), rgba(6, 8, 11, 0.56)), linear-gradient(115deg, transparent, rgba(114, 247, 255, 0.1), transparent)",
      "--result-backdrop-bg": "rgba(0, 0, 0, 0.72)"
    }
  },
  {
    id: "genku-greeting",
    name: "Genku greeting robot",
    enabled: true,
    source: { kind: "spline", url: "https://my.spline.design/genkubgreetingrobot-6KnCXjHnweub6Tg0ii7CrrWv/" },
    cssVariables: {
      "--chrome": "#f5fffb",
      "--muted": "rgba(245, 255, 251, 0.62)",
      "--panel": "rgba(5, 18, 15, 0.77)",
      "--panel-strong": "rgba(5, 18, 15, 0.94)",
      "--line": "rgba(204, 255, 235, 0.17)",
      "--line-strong": "rgba(204, 255, 235, 0.32)",
      "--accent": "#8fffd8",
      "--accent-strong": "#31e6b3",
      "--accent-rgb": "143, 255, 216",
      "--danger": "#ff9ba6",
      "--shell-bg": "linear-gradient(180deg, transparent 0, #04110f 100dvh), #04110f",
      "--hero-stage-bg": "#dfeee9",
      "--spline-light-overlay": "radial-gradient(circle at 50% 38%, rgba(255, 255, 255, 0.24), transparent 13%), radial-gradient(ellipse at 48% 58%, rgba(3, 19, 16, 0.22), transparent 34%), radial-gradient(circle at 28% 32%, rgba(143, 255, 216, 0.16), transparent 28%), linear-gradient(90deg, rgba(4, 17, 15, 0.32), transparent 35%, transparent 66%, rgba(4, 17, 15, 0.3))",
      "--spline-overlay": "radial-gradient(circle at 50% 50%, rgba(230, 252, 244, 0.74) 0 42px, transparent 90px), linear-gradient(90deg, rgba(4, 17, 15, 0.5), transparent 23%, transparent 72%, rgba(4, 17, 15, 0.42)), linear-gradient(180deg, rgba(4, 17, 15, 0.08), transparent 36%, rgba(4, 17, 15, 0.74))",
      "--spline-loaded-overlay": "linear-gradient(90deg, rgba(4, 17, 15, 0.5), transparent 23%, transparent 72%, rgba(4, 17, 15, 0.42)), linear-gradient(180deg, rgba(4, 17, 15, 0.08), transparent 36%, rgba(4, 17, 15, 0.72))",
      "--glass-panel-bg": "linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(143, 255, 216, 0.055)), rgba(5, 18, 15, 0.77)",
      "--question-console-bg": "linear-gradient(135deg, rgba(255, 255, 255, 0.13), rgba(143, 255, 216, 0.04)), rgba(5, 18, 15, 0.62)",
      "--surface-sheen": "linear-gradient(105deg, rgba(255, 255, 255, 0.09), transparent 38%, rgba(143, 255, 216, 0.1))",
      "--action-gradient": "linear-gradient(135deg, #f0fff8, #31e6b3)",
      "--action-text": "#02100c",
      "--action-shadow": "rgba(49, 230, 179, 0.28)",
      "--loading-layer-bg": "linear-gradient(180deg, rgba(4, 17, 15, 0.08), rgba(4, 17, 15, 0.58)), linear-gradient(115deg, transparent, rgba(143, 255, 216, 0.12), transparent)",
      "--result-backdrop-bg": "rgba(1, 9, 8, 0.74)"
    }
  },
  {
    id: "magic-lock",
    name: "Magic lock",
    enabled: true,
    source: { kind: "spline", url: "https://my.spline.design/magiclock-9BEvo8IAdiqkmV2oCzlWjcee/" },
    cssVariables: {
      "--chrome": "#fffaf2",
      "--muted": "rgba(255, 250, 242, 0.62)",
      "--panel": "rgba(16, 10, 24, 0.8)",
      "--panel-strong": "rgba(16, 10, 24, 0.95)",
      "--line": "rgba(255, 226, 151, 0.17)",
      "--line-strong": "rgba(255, 226, 151, 0.34)",
      "--accent": "#ffd36a",
      "--accent-strong": "#ff9f2f",
      "--accent-rgb": "255, 211, 106",
      "--danger": "#ff9ba6",
      "--shell-bg": "radial-gradient(circle at 50% 8%, rgba(255, 159, 47, 0.14), transparent 32%), linear-gradient(180deg, transparent 0, #08040f 100dvh), #08040f",
      "--hero-stage-bg": "#1b1325",
      "--spline-light-overlay": "radial-gradient(circle at 50% 36%, rgba(255, 220, 142, 0.24), transparent 16%), radial-gradient(ellipse at 50% 58%, rgba(8, 4, 15, 0.24), transparent 36%), radial-gradient(circle at 60% 30%, rgba(255, 159, 47, 0.22), transparent 26%), linear-gradient(90deg, rgba(8, 4, 15, 0.34), transparent 36%, transparent 64%, rgba(8, 4, 15, 0.34))",
      "--spline-overlay": "radial-gradient(circle at 50% 44%, rgba(255, 211, 106, 0.22) 0 48px, transparent 100px), linear-gradient(90deg, rgba(8, 4, 15, 0.56), transparent 24%, transparent 72%, rgba(8, 4, 15, 0.5)), linear-gradient(180deg, rgba(8, 4, 15, 0.16), transparent 34%, rgba(8, 4, 15, 0.8))",
      "--spline-loaded-overlay": "radial-gradient(circle at 50% 44%, rgba(255, 211, 106, 0.14) 0 42px, transparent 92px), linear-gradient(90deg, rgba(8, 4, 15, 0.54), transparent 24%, transparent 72%, rgba(8, 4, 15, 0.48)), linear-gradient(180deg, rgba(8, 4, 15, 0.12), transparent 34%, rgba(8, 4, 15, 0.78))",
      "--glass-panel-bg": "linear-gradient(135deg, rgba(255, 255, 255, 0.13), rgba(255, 211, 106, 0.055)), rgba(16, 10, 24, 0.8)",
      "--question-console-bg": "linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 211, 106, 0.04)), rgba(16, 10, 24, 0.64)",
      "--surface-sheen": "linear-gradient(105deg, rgba(255, 255, 255, 0.08), transparent 38%, rgba(255, 211, 106, 0.11))",
      "--action-gradient": "linear-gradient(135deg, #fff7d6, #ff9f2f)",
      "--action-text": "#140800",
      "--action-shadow": "rgba(255, 159, 47, 0.3)",
      "--loading-layer-bg": "linear-gradient(180deg, rgba(8, 4, 15, 0.1), rgba(8, 4, 15, 0.62)), linear-gradient(115deg, transparent, rgba(255, 211, 106, 0.13), transparent)",
      "--result-backdrop-bg": "rgba(6, 2, 11, 0.76)"
    }
  },
  {
    id: "zero-gravity",
    name: "Zero gravity physics",
    enabled: true,
    source: { kind: "spline", url: "https://my.spline.design/zerogravityphysicslandingpage-91iSUa2r2R85qk8D74elf5Pi/" },
    cssVariables: {
      "--chrome": "#f6fbff",
      "--muted": "rgba(246, 251, 255, 0.62)",
      "--panel": "rgba(4, 8, 20, 0.8)",
      "--panel-strong": "rgba(4, 8, 20, 0.95)",
      "--line": "rgba(132, 213, 255, 0.18)",
      "--line-strong": "rgba(132, 213, 255, 0.35)",
      "--accent": "#84d5ff",
      "--accent-strong": "#5cffbd",
      "--accent-rgb": "132, 213, 255",
      "--danger": "#ff9ba6",
      "--shell-bg": "radial-gradient(circle at 54% 10%, rgba(92, 255, 189, 0.13), transparent 28%), linear-gradient(180deg, transparent 0, #030711 100dvh), #030711",
      "--hero-stage-bg": "#071226",
      "--spline-light-overlay": "radial-gradient(circle at 48% 36%, rgba(132, 213, 255, 0.2), transparent 16%), radial-gradient(ellipse at 48% 58%, rgba(3, 7, 17, 0.25), transparent 34%), radial-gradient(circle at 62% 30%, rgba(92, 255, 189, 0.16), transparent 26%), linear-gradient(90deg, rgba(3, 7, 17, 0.36), transparent 36%, transparent 64%, rgba(3, 7, 17, 0.36))",
      "--spline-overlay": "radial-gradient(circle at 50% 44%, rgba(132, 213, 255, 0.18) 0 48px, transparent 96px), linear-gradient(90deg, rgba(3, 7, 17, 0.58), transparent 24%, transparent 72%, rgba(3, 7, 17, 0.5)), linear-gradient(180deg, rgba(3, 7, 17, 0.12), transparent 34%, rgba(3, 7, 17, 0.82))",
      "--spline-loaded-overlay": "radial-gradient(circle at 50% 44%, rgba(92, 255, 189, 0.1) 0 42px, transparent 92px), linear-gradient(90deg, rgba(3, 7, 17, 0.56), transparent 24%, transparent 72%, rgba(3, 7, 17, 0.48)), linear-gradient(180deg, rgba(3, 7, 17, 0.1), transparent 34%, rgba(3, 7, 17, 0.8))",
      "--glass-panel-bg": "linear-gradient(135deg, rgba(255, 255, 255, 0.13), rgba(132, 213, 255, 0.055)), rgba(4, 8, 20, 0.8)",
      "--question-console-bg": "linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(92, 255, 189, 0.04)), rgba(4, 8, 20, 0.66)",
      "--surface-sheen": "linear-gradient(105deg, rgba(255, 255, 255, 0.08), transparent 38%, rgba(92, 255, 189, 0.1))",
      "--action-gradient": "linear-gradient(135deg, #edfaff, #5cffbd)",
      "--action-text": "#020b0d",
      "--action-shadow": "rgba(92, 255, 189, 0.28)",
      "--loading-layer-bg": "linear-gradient(180deg, rgba(3, 7, 17, 0.08), rgba(3, 7, 17, 0.62)), linear-gradient(115deg, transparent, rgba(132, 213, 255, 0.13), transparent)",
      "--result-backdrop-bg": "rgba(2, 5, 12, 0.78)"
    }
  },
  {
    id: "blue-marble",
    name: "The blue marble",
    enabled: true,
    source: { kind: "spline", url: "https://my.spline.design/thebluemarble-2KNR2Z7eB73PaHPmd4dC9MCC/" },
    cssVariables: {
      "--chrome": "#f5fbff",
      "--muted": "rgba(245, 251, 255, 0.62)",
      "--panel": "rgba(4, 16, 25, 0.8)",
      "--panel-strong": "rgba(4, 16, 25, 0.95)",
      "--line": "rgba(115, 226, 255, 0.18)",
      "--line-strong": "rgba(115, 226, 255, 0.34)",
      "--accent": "#73e2ff",
      "--accent-strong": "#5de7a8",
      "--accent-rgb": "115, 226, 255",
      "--danger": "#ff9ba6",
      "--shell-bg": "radial-gradient(circle at 50% 4%, rgba(93, 231, 168, 0.12), transparent 30%), linear-gradient(180deg, transparent 0, #031018 100dvh), #031018",
      "--hero-stage-bg": "#071a2a",
      "--spline-light-overlay": "radial-gradient(circle at 48% 34%, rgba(115, 226, 255, 0.2), transparent 15%), radial-gradient(ellipse at 50% 58%, rgba(3, 16, 24, 0.25), transparent 34%), radial-gradient(circle at 36% 30%, rgba(93, 231, 168, 0.16), transparent 26%), linear-gradient(90deg, rgba(3, 16, 24, 0.38), transparent 36%, transparent 64%, rgba(3, 16, 24, 0.38))",
      "--spline-overlay": "radial-gradient(circle at 50% 44%, rgba(115, 226, 255, 0.17) 0 48px, transparent 96px), linear-gradient(90deg, rgba(3, 16, 24, 0.56), transparent 24%, transparent 72%, rgba(3, 16, 24, 0.5)), linear-gradient(180deg, rgba(3, 16, 24, 0.12), transparent 34%, rgba(3, 16, 24, 0.82))",
      "--spline-loaded-overlay": "radial-gradient(circle at 50% 44%, rgba(93, 231, 168, 0.1) 0 42px, transparent 92px), linear-gradient(90deg, rgba(3, 16, 24, 0.54), transparent 24%, transparent 72%, rgba(3, 16, 24, 0.48)), linear-gradient(180deg, rgba(3, 16, 24, 0.1), transparent 34%, rgba(3, 16, 24, 0.8))",
      "--glass-panel-bg": "linear-gradient(135deg, rgba(255, 255, 255, 0.13), rgba(115, 226, 255, 0.055)), rgba(4, 16, 25, 0.8)",
      "--question-console-bg": "linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(93, 231, 168, 0.04)), rgba(4, 16, 25, 0.66)",
      "--surface-sheen": "linear-gradient(105deg, rgba(255, 255, 255, 0.08), transparent 38%, rgba(93, 231, 168, 0.1))",
      "--action-gradient": "linear-gradient(135deg, #edfaff, #5de7a8)",
      "--action-text": "#020d0f",
      "--action-shadow": "rgba(93, 231, 168, 0.28)",
      "--loading-layer-bg": "linear-gradient(180deg, rgba(3, 16, 24, 0.08), rgba(3, 16, 24, 0.62)), linear-gradient(115deg, transparent, rgba(115, 226, 255, 0.13), transparent)",
      "--result-backdrop-bg": "rgba(2, 10, 15, 0.78)"
    }
  },
  {
    id: "unchained",
    name: "Unchained",
    enabled: true,
    source: { kind: "spline", url: "https://my.spline.design/unchained-5MOmHZnGW3yfhPJzg53oK5WS/" },
    cssVariables: {
      "--chrome": "#fff8f8",
      "--muted": "rgba(255, 248, 248, 0.62)",
      "--panel": "rgba(18, 9, 10, 0.8)",
      "--panel-strong": "rgba(18, 9, 10, 0.95)",
      "--line": "rgba(255, 133, 116, 0.19)",
      "--line-strong": "rgba(255, 133, 116, 0.34)",
      "--accent": "#ff8574",
      "--accent-strong": "#ff3f57",
      "--accent-rgb": "255, 133, 116",
      "--danger": "#ffb0b8",
      "--shell-bg": "radial-gradient(circle at 50% 8%, rgba(255, 63, 87, 0.13), transparent 30%), linear-gradient(180deg, transparent 0, #0c0608 100dvh), #0c0608",
      "--hero-stage-bg": "#1c1112",
      "--spline-light-overlay": "radial-gradient(circle at 48% 36%, rgba(255, 133, 116, 0.22), transparent 15%), radial-gradient(ellipse at 50% 58%, rgba(12, 6, 8, 0.26), transparent 34%), radial-gradient(circle at 62% 30%, rgba(255, 63, 87, 0.16), transparent 26%), linear-gradient(90deg, rgba(12, 6, 8, 0.4), transparent 36%, transparent 64%, rgba(12, 6, 8, 0.4))",
      "--spline-overlay": "radial-gradient(circle at 50% 44%, rgba(255, 133, 116, 0.16) 0 48px, transparent 96px), linear-gradient(90deg, rgba(12, 6, 8, 0.58), transparent 24%, transparent 72%, rgba(12, 6, 8, 0.52)), linear-gradient(180deg, rgba(12, 6, 8, 0.14), transparent 34%, rgba(12, 6, 8, 0.84))",
      "--spline-loaded-overlay": "radial-gradient(circle at 50% 44%, rgba(255, 63, 87, 0.1) 0 42px, transparent 92px), linear-gradient(90deg, rgba(12, 6, 8, 0.56), transparent 24%, transparent 72%, rgba(12, 6, 8, 0.5)), linear-gradient(180deg, rgba(12, 6, 8, 0.12), transparent 34%, rgba(12, 6, 8, 0.82))",
      "--glass-panel-bg": "linear-gradient(135deg, rgba(255, 255, 255, 0.13), rgba(255, 133, 116, 0.055)), rgba(18, 9, 10, 0.8)",
      "--question-console-bg": "linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 133, 116, 0.04)), rgba(18, 9, 10, 0.66)",
      "--surface-sheen": "linear-gradient(105deg, rgba(255, 255, 255, 0.08), transparent 38%, rgba(255, 133, 116, 0.1))",
      "--action-gradient": "linear-gradient(135deg, #fff4f2, #ff3f57)",
      "--action-text": "#130405",
      "--action-shadow": "rgba(255, 63, 87, 0.3)",
      "--loading-layer-bg": "linear-gradient(180deg, rgba(12, 6, 8, 0.08), rgba(12, 6, 8, 0.64)), linear-gradient(115deg, transparent, rgba(255, 133, 116, 0.13), transparent)",
      "--result-backdrop-bg": "rgba(8, 3, 5, 0.78)"
    }
  },
  {
    id: "paper-boat",
    name: "Animated paper boat",
    enabled: true,
    source: { kind: "spline", url: "https://my.spline.design/animatedpaperboat-ppXNonvnqrOn60Qj3EEaFbmR/" },
    cssVariables: {
      "--chrome": "#fffdf6",
      "--muted": "rgba(255, 253, 246, 0.64)",
      "--panel": "rgba(8, 17, 22, 0.78)",
      "--panel-strong": "rgba(8, 17, 22, 0.94)",
      "--line": "rgba(255, 221, 154, 0.19)",
      "--line-strong": "rgba(255, 221, 154, 0.34)",
      "--accent": "#ffdd9a",
      "--accent-strong": "#43d7d5",
      "--accent-rgb": "255, 221, 154",
      "--danger": "#ff9ba6",
      "--shell-bg": "radial-gradient(circle at 52% 8%, rgba(67, 215, 213, 0.13), transparent 30%), linear-gradient(180deg, transparent 0, #071015 100dvh), #071015",
      "--hero-stage-bg": "#d9eef2",
      "--spline-light-overlay": "radial-gradient(circle at 48% 36%, rgba(255, 221, 154, 0.2), transparent 15%), radial-gradient(ellipse at 50% 58%, rgba(7, 16, 21, 0.22), transparent 34%), radial-gradient(circle at 62% 30%, rgba(67, 215, 213, 0.16), transparent 26%), linear-gradient(90deg, rgba(7, 16, 21, 0.34), transparent 36%, transparent 64%, rgba(7, 16, 21, 0.34))",
      "--spline-overlay": "radial-gradient(circle at 50% 48%, rgba(255, 221, 154, 0.16) 0 48px, transparent 96px), linear-gradient(90deg, rgba(7, 16, 21, 0.52), transparent 24%, transparent 72%, rgba(7, 16, 21, 0.48)), linear-gradient(180deg, rgba(7, 16, 21, 0.1), transparent 34%, rgba(7, 16, 21, 0.78))",
      "--spline-loaded-overlay": "radial-gradient(circle at 50% 48%, rgba(67, 215, 213, 0.1) 0 42px, transparent 92px), linear-gradient(90deg, rgba(7, 16, 21, 0.5), transparent 24%, transparent 72%, rgba(7, 16, 21, 0.46)), linear-gradient(180deg, rgba(7, 16, 21, 0.08), transparent 34%, rgba(7, 16, 21, 0.76))",
      "--glass-panel-bg": "linear-gradient(135deg, rgba(255, 255, 255, 0.14), rgba(255, 221, 154, 0.055)), rgba(8, 17, 22, 0.78)",
      "--question-console-bg": "linear-gradient(135deg, rgba(255, 255, 255, 0.13), rgba(67, 215, 213, 0.04)), rgba(8, 17, 22, 0.64)",
      "--surface-sheen": "linear-gradient(105deg, rgba(255, 255, 255, 0.09), transparent 38%, rgba(255, 221, 154, 0.1))",
      "--action-gradient": "linear-gradient(135deg, #fff7da, #43d7d5)",
      "--action-text": "#061014",
      "--action-shadow": "rgba(67, 215, 213, 0.28)",
      "--loading-layer-bg": "linear-gradient(180deg, rgba(7, 16, 21, 0.08), rgba(7, 16, 21, 0.6)), linear-gradient(115deg, transparent, rgba(255, 221, 154, 0.13), transparent)",
      "--result-backdrop-bg": "rgba(4, 10, 13, 0.76)"
    }
  },
  {
    id: "starship-flight-12",
    name: "Starship's twelfth flight test",
    enabled: true,
    source: { kind: "video", url: "https://sxcontent9668.azureedge.us/cms-assets/assets/20260522_Starship_Flight12_web1920_v2_71d68b5ee9.mp4" },
    cssVariables: {
      "--chrome": "#f0f0fa",
      "--muted": "rgba(240, 240, 250, 0.62)",
      "--panel": "rgba(0, 0, 0, 0.68)",
      "--panel-strong": "rgba(0, 0, 0, 0.88)",
      "--line": "rgba(240, 240, 250, 0.2)",
      "--line-strong": "rgba(240, 240, 250, 0.38)",
      "--accent": "#f0f0fa",
      "--accent-strong": "#cfd3da",
      "--accent-rgb": "240, 240, 250",
      "--danger": "#ff9ba6",
      "--shell-bg": "linear-gradient(180deg, transparent 0, #030303 100dvh), #030303",
      "--hero-stage-bg": "#030303",
      "--spline-light-overlay": "linear-gradient(90deg, rgba(0, 0, 0, 0.42), transparent 35%, transparent 68%, rgba(0, 0, 0, 0.36)), linear-gradient(180deg, rgba(0, 0, 0, 0.34), transparent 36%, rgba(0, 0, 0, 0.8))",
      "--spline-overlay": "linear-gradient(90deg, rgba(0, 0, 0, 0.54), transparent 31%, transparent 68%, rgba(0, 0, 0, 0.5)), linear-gradient(180deg, rgba(0, 0, 0, 0.18), transparent 38%, rgba(0, 0, 0, 0.86))",
      "--spline-loaded-overlay": "linear-gradient(90deg, rgba(0, 0, 0, 0.46), transparent 30%, transparent 70%, rgba(0, 0, 0, 0.42)), linear-gradient(180deg, rgba(0, 0, 0, 0.1), transparent 38%, rgba(0, 0, 0, 0.78))",
      "--glass-panel-bg": "linear-gradient(135deg, rgba(240, 240, 250, 0.12), rgba(240, 240, 250, 0.025)), rgba(0, 0, 0, 0.64)",
      "--question-console-bg": "linear-gradient(135deg, rgba(240, 240, 250, 0.1), rgba(240, 240, 250, 0.015)), rgba(0, 0, 0, 0.54)",
      "--surface-sheen": "linear-gradient(105deg, rgba(240, 240, 250, 0.1), transparent 38%, rgba(240, 240, 250, 0.08))",
      "--action-gradient": "linear-gradient(135deg, #f0f0fa, #cfd3da)",
      "--action-text": "#050505",
      "--action-shadow": "rgba(240, 240, 250, 0.22)",
      "--loading-layer-bg": "linear-gradient(180deg, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.7)), linear-gradient(115deg, transparent, rgba(240, 240, 250, 0.1), transparent)",
      "--result-backdrop-bg": "rgba(0, 0, 0, 0.8)"
    }
  },
  {
    id: "falcon-heavy-landing",
    name: "Falcon Heavy landing",
    enabled: true,
    source: { kind: "video", url: "https://sxcontent9668.azureedge.us/cms-assets/assets/Space_X_Falcon_Heavy_UAS_Landing_DESKTOP_compress_b4568daf9c_5e2026727a.mp4" },
    cssVariables: {
      "--chrome": "#f0f0fa",
      "--muted": "rgba(240, 240, 250, 0.62)",
      "--panel": "rgba(0, 0, 0, 0.68)",
      "--panel-strong": "rgba(0, 0, 0, 0.88)",
      "--line": "rgba(240, 240, 250, 0.2)",
      "--line-strong": "rgba(240, 240, 250, 0.38)",
      "--accent": "#f0f0fa",
      "--accent-strong": "#d8dce4",
      "--accent-rgb": "240, 240, 250",
      "--danger": "#ff9ba6",
      "--shell-bg": "linear-gradient(180deg, transparent 0, #030303 100dvh), #030303",
      "--hero-stage-bg": "#030303",
      "--spline-light-overlay": "linear-gradient(90deg, rgba(0, 0, 0, 0.48), transparent 34%, transparent 68%, rgba(0, 0, 0, 0.42)), linear-gradient(180deg, rgba(0, 0, 0, 0.28), transparent 36%, rgba(0, 0, 0, 0.82))",
      "--spline-overlay": "linear-gradient(90deg, rgba(0, 0, 0, 0.56), transparent 30%, transparent 68%, rgba(0, 0, 0, 0.5)), linear-gradient(180deg, rgba(0, 0, 0, 0.14), transparent 36%, rgba(0, 0, 0, 0.86))",
      "--spline-loaded-overlay": "linear-gradient(90deg, rgba(0, 0, 0, 0.48), transparent 30%, transparent 70%, rgba(0, 0, 0, 0.44)), linear-gradient(180deg, rgba(0, 0, 0, 0.08), transparent 36%, rgba(0, 0, 0, 0.78))",
      "--glass-panel-bg": "linear-gradient(135deg, rgba(240, 240, 250, 0.12), rgba(240, 240, 250, 0.025)), rgba(0, 0, 0, 0.64)",
      "--question-console-bg": "linear-gradient(135deg, rgba(240, 240, 250, 0.1), rgba(240, 240, 250, 0.015)), rgba(0, 0, 0, 0.54)",
      "--surface-sheen": "linear-gradient(105deg, rgba(240, 240, 250, 0.1), transparent 38%, rgba(240, 240, 250, 0.08))",
      "--action-gradient": "linear-gradient(135deg, #f0f0fa, #d8dce4)",
      "--action-text": "#050505",
      "--action-shadow": "rgba(240, 240, 250, 0.22)",
      "--loading-layer-bg": "linear-gradient(180deg, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.72)), linear-gradient(115deg, transparent, rgba(240, 240, 250, 0.1), transparent)",
      "--result-backdrop-bg": "rgba(0, 0, 0, 0.8)"
    }
  }
] as const satisfies readonly HeroTheme[];

export const DEFAULT_HERO_THEME: HeroTheme = HERO_THEMES[0];

export const getEnabledHeroThemes = () => HERO_THEMES.filter((theme) => theme.enabled);

export const selectRandomHeroTheme = (random = Math.random): HeroTheme => {
  const enabledThemes = getEnabledHeroThemes();
  const randomValue = Math.min(0.999999, Math.max(0, random()));
  const selectedIndex = Math.floor(randomValue * enabledThemes.length);

  return enabledThemes[selectedIndex] ?? DEFAULT_HERO_THEME;
};

export const getHeroThemeStyle = (theme: HeroTheme): HeroThemeCssVariables => theme.cssVariables;
