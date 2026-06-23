# RealQuestion Design System

## 1. Atmosphere & Identity

RealQuestion feels like a quiet AI console floating over a cinematic robot scene. The signature is dark glass with cyan signal light: the interface should feel focused, futuristic, and simple enough that the user only thinks about the question they want to ask.

## 2. Color

### Palette

| Role | Token | Light | Dark | Usage |
|------|-------|-------|------|-------|
| Surface/base | `--surface-base` | #D7D7D7 | #06080B | Page background and robot stage |
| Surface/panel | `--surface-panel` | rgba(255,255,255,0.14) | rgba(7,10,14,0.74) | Glass panels |
| Surface/strong | `--surface-strong` | rgba(255,255,255,0.18) | rgba(7,10,14,0.90) | Modals and focused panels |
| Text/primary | `--text-primary` | #020507 | #F8FBFF | Main text |
| Text/secondary | `--text-secondary` | rgba(2,5,7,0.62) | rgba(248,251,255,0.58) | Labels and supporting text |
| Border/default | `--border-default` | rgba(2,5,7,0.18) | rgba(255,255,255,0.16) | Panel edges |
| Border/strong | `--border-strong` | rgba(2,5,7,0.28) | rgba(255,255,255,0.28) | Hover and active edges |
| Accent/primary | `--accent-primary` | #18DCE9 | #72F7FF | Focus, selected state, glow |
| Accent/strong | `--accent-strong` | #05BECB | #18DCE9 | Primary action and progress |
| Status/error | `--status-error` | #D94D5E | #FF9BA6 | Form errors |

### Rules

- Use cyan only for action, focus, selected state, and AI-processing signals.
- Keep the page mostly neutral: black, glass gray, white, and cyan.
- New colors must be added here before use.
- Hero-specific palettes live in `lib/heroThemes.ts`. Each theme must keep dark glass panels and high-contrast text, even when the Spline scene is bright.

## 3. Typography

### Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| Display | 46px | 900 | 1.05 | 0 | Share image headline |
| H1 | 24px | 900 | 1.2 | 0 | Modal and panel title |
| H2 | 18px | 900 | 1.3 | 0 | Section title |
| Body | 15px | 800 | 1.5 | 0 | Primary input text |
| Body/sm | 13px | 800 | 1.4 | 0 | Button and chip text |
| Caption | 12px | 800 | 1.35 | 0 | Labels and helper text |

### Font Stack

- Primary: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
- Mono: "SFMono-Regular", "Cascadia Mono", ui-monospace, monospace

### Rules

- Korean text must stay readable and avoid overly large panel text.
- Letter spacing stays at 0 for Korean readability.
- Body text never goes below 12px.

## 4. Spacing & Layout

### Base Unit

All spacing derives from 4px.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight inline spacing |
| `--space-2` | 8px | Button inner groups |
| `--space-3` | 12px | Compact field padding |
| `--space-4` | 16px | Panel inner spacing |
| `--space-5` | 20px | Hero padding |
| `--space-6` | 24px | Console padding |
| `--space-8` | 32px | Major panel gap |

### Grid

- Max content width: 1280px
- Main surface: fixed 100dvh experience without page scroll
- Follow-up layout: three columns on desktop, one column on narrow mobile with compact horizontal direction controls
- Result modal: inner content may scroll, but the page behind it must remain fixed.
- Desktop result modal: bottom controls stay visible; only the generated prompt body scrolls when the answer is long.

### Rules

- Avoid main document scrolling; inner panels may scroll only when content overflows.
- Controls must keep stable sizes during hover and loading.
- On mobile, the follow-up sheet should start near the top bar and give most of the height to question cards.
- First-screen robot stage does not apply custom wheel zoom; the Spline iframe keeps pointer input so hover and mouse-follow interactions work.

## 5. Components

### Glass Console

- **Structure**: panel with translucent gradient, blur, thin border, and dark fill.
- **Variants**: question input, follow-up dock, result modal, loading panel.
- **Spacing**: `--space-3` to `--space-6`.
- **States**: default, focus glow, hover border, loading overlay.
- **Accessibility**: visible labels are optional only when an `sr-only` label exists.
- **Motion**: enters with transform and opacity only.

### Mobile Follow-up Sheet

- **Structure**: near full-height bottom sheet with a compact direction strip, scrollable question list, and stable submit button.
- **Variants**: single-column cards on phones, multi-column cards on larger screens.
- **Spacing**: `--space-2` to `--space-4` on phones.
- **States**: selected choices use cyan border and glow; direct input remains one-line.
- **Accessibility**: each slider and direct input keeps a unique label.
- **Motion**: sheet-up transform only.

### Cyan Action

- **Structure**: pill button with cyan gradient and dark text.
- **Variants**: full-width start, compact final action.
- **Spacing**: `--space-2` to `--space-6`.
- **States**: hover lift, active scale, disabled opacity.
- **Accessibility**: clear text label, native button element.
- **Motion**: 180ms transform, shadow, and filter transitions.

### Share Identity Asset

- **Structure**: dark 1200x630 card with cyan light field, glass prompt window, and RealQuestion wordmark.
- **Variants**: Open Graph image and favicon.
- **Spacing**: 64px outer margin on share card.
- **States**: static asset, no interaction.
- **Accessibility**: Open Graph image includes descriptive alt text.
- **Motion**: none.

### Hero Theme Set

- **Structure**: one hero source, either a Spline URL or a direct video URL, plus one token set in `lib/heroThemes.ts`.
- **Variants**: NEXBOT, Genku greeting robot, Magic lock, Zero gravity, Blue marble, Unchained, Animated paper boat, SpaceX Starship flight test video, and SpaceX Falcon Heavy landing video.
- **States**: only `enabled: true` themes enter the random first-screen pool.
- **Accessibility**: theme tokens must preserve readable white text over dark panels.
- **Maintenance**: remove a broken theme by setting `enabled: false`; add a new theme by appending the same object shape with source URL and tokens.

### Result Refinement Panel

- **Structure**: editable prompt body, visible editing state, feedback textarea, and one cyan regenerate action.
- **Variants**: desktop inline controls, mobile stacked controls.
- **Spacing**: `--space-3` to `--space-4`.
- **States**: read-only, editing, loading, disabled when feedback is empty.
- **Accessibility**: editable prompt and feedback field must have explicit labels.
- **Motion**: button and panel feedback use transform, opacity, and glow only.

### API & History Menus

- **Structure**: compact top-right pill buttons with dark glass popovers.
- **Variants**: API key popover, GPT model selector, local question history list.
- **Spacing**: `--space-2` to `--space-4`.
- **States**: saved API key, empty history, active history item, delete hover.
- **Accessibility**: model selector and API key field keep explicit labels.
- **Interaction**: popovers close on outside click and Escape.
- **Storage**: API key and prompt history stay in the user's local browser storage.

## 6. Motion & Interaction

### Timing

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | 180ms | ease | Button hover and focus |
| Standard | 420ms | cubic-bezier(0.22, 1, 0.36, 1) | Follow-up sheet entry |
| Emphasis | 720ms | cubic-bezier(0.22, 1, 0.36, 1) | Robot zoom and stage change |

### Rules

- Animate `transform`, `opacity`, and `filter` only.
- Respect reduced motion for non-essential animation.
- Loading states should explain progress without adding visual clutter.

## 7. Depth & Surface

### Strategy

Mixed depth: glass borders, tonal overlays, and cyan glow.

| Level | Value | Usage |
|-------|-------|-------|
| Rest | 1px border with translucent panel | Inputs and chips |
| Elevated | blur with dark translucent fill | Consoles and modal |
| Active | cyan border plus soft glow | Focus, selected, primary action |

Depth must remain subtle. The robot and question are the subject; panels should support them, not compete.
