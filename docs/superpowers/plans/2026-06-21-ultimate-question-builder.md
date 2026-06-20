# Ultimate Question Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved Ultimate Question Builder MVP as a Korean, step-by-step Next.js app with user-entered OpenAI API key, typed API routes, structured LLM output, and rule-based prompt quality scoring.

**Architecture:** Use a Next.js App Router app with React state for the four-step workspace. Keep domain logic in `lib/*`, server orchestration in `lib/server/*`, API routes as thin wrappers, and UI in small components. The OpenAI API key lives only in browser memory and is sent to server routes per request.

**Tech Stack:** Next.js, TypeScript, React, Tailwind CSS, Zod, OpenAI Node SDK, Vitest, Testing Library, jsdom, lucide-react.

---

## File Structure

Project setup:

- `package.json`: scripts and dependencies.
- `tsconfig.json`: strict TypeScript config with `@/*` path alias.
- `next.config.mjs`: Next.js config.
- `postcss.config.mjs`: PostCSS config for Tailwind.
- `tailwind.config.ts`: Tailwind content paths and theme tokens.
- `vitest.config.ts`: Vitest + React + jsdom test config.
- `test/setup.ts`: Testing Library setup.
- `app/layout.tsx`: root HTML shell.
- `app/globals.css`: global CSS and Tailwind layers.

Domain logic:

- `lib/questionTypes.ts`: question type constants and Korean labels.
- `lib/followupTemplates.ts`: five follow-up questions for all ten question types.
- `lib/types.ts`: TypeScript types plus Zod schemas for requests and responses.
- `lib/qualityScore.ts`: rule-based quality score and improvement suggestions.
- `lib/json.ts`: strict JSON parsing and OpenAI output text extraction.
- `lib/openaiSchemas.ts`: JSON Schemas passed to OpenAI Structured Outputs.
- `lib/llm.ts`: OpenAI Responses API wrapper with injectable client for tests.
- `lib/prompts/analyzeQuestion.ts`: analysis prompt builder.
- `lib/prompts/synthesizeUltimatePrompt.ts`: synthesis prompt builder.

Server logic:

- `lib/server/analyzeQuestion.ts`: validate input, call LLM, retry once, fallback on analysis failure.
- `lib/server/generateFollowups.ts`: validate input and return template follow-ups.
- `lib/server/synthesizeUltimatePrompt.ts`: validate input, call LLM, retry once, compute score.
- `app/api/analyze-question/route.ts`: thin POST route.
- `app/api/generate-followups/route.ts`: thin POST route.
- `app/api/synthesize-ultimate-prompt/route.ts`: thin POST route.

UI:

- `components/ApiKeyMenu.tsx`: API key and model menu.
- `components/QuestionInput.tsx`: raw question input step.
- `components/AnalysisCard.tsx`: analysis summary.
- `components/TypeSelector.tsx`: primary type selector.
- `components/FollowupForm.tsx`: five follow-up textareas.
- `components/CopyButton.tsx`: clipboard button.
- `components/PromptCard.tsx`: prompt display shell.
- `components/ResultTabs.tsx`: short, deep, expert result tabs.
- `components/QualityScoreCard.tsx`: score and suggestions.
- `app/page.tsx`: client workspace orchestration.

Tests:

- `tests/smoke.test.ts`: test harness sanity check.
- `tests/lib/questionTypes.test.ts`: type and label coverage.
- `tests/lib/followupTemplates.test.ts`: template coverage and purpose ordering.
- `tests/lib/types.test.ts`: Zod schema coverage.
- `tests/lib/qualityScore.test.ts`: scoring behavior.
- `tests/lib/json.test.ts`: JSON extraction and parse behavior.
- `tests/lib/llm.test.ts`: OpenAI wrapper request shape and validation.
- `tests/lib/server/analyzeQuestion.test.ts`: analysis server behavior.
- `tests/lib/server/generateFollowups.test.ts`: follow-up route behavior.
- `tests/lib/server/synthesizeUltimatePrompt.test.ts`: synthesis server behavior.
- `tests/components/*.test.tsx`: component behavior.
- `tests/app/page.test.tsx`: main four-step flow.

---

## Task 1: Project Scaffold And Test Harness

**Files:**

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `vitest.config.ts`
- Create: `test/setup.ts`
- Create: `tests/smoke.test.ts`
- Create: `app/layout.tsx`
- Create: `app/globals.css`

- [ ] **Step 1: Create package and config files**

Create `package.json`:

```json
{
  "name": "ultimate-question-builder",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^0.468.0",
    "next": "^16.2.9",
    "openai": "^6.44.0",
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.4.20",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.0",
    "vitest": "^4.1.9"
  }
}
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

Create `postcss.config.mjs`:

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};

export default config;
```

Create `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        paper: "#f7f4ee",
        line: "#d8d2c5",
        accent: "#0f766e"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"]
  },
  resolve: {
    alias: {
      "@": new URL(".", import.meta.url).pathname
    }
  }
});
```

Create `test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Create `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ultimate Question Builder",
  description: "평범한 질문을 AI가 깊게 사고할 수밖에 없는 궁극 질문으로 바꿉니다."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
```

Create `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color: #111827;
  background: #f7f4ee;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background:
    linear-gradient(180deg, rgba(247, 244, 238, 0.94), rgba(239, 234, 224, 0.98)),
    #f7f4ee;
  color: #111827;
}

button,
input,
textarea,
select {
  font: inherit;
}
```

- [ ] **Step 2: Write the harness smoke test**

Create `tests/smoke.test.ts`:

```ts
import { describe, expect, it } from "vitest";

describe("test harness", () => {
  it("runs Vitest", () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 3: Install dependencies**

Run:

```powershell
npm install
```

Expected: command exits with code `0` and creates `package-lock.json`.

- [ ] **Step 4: Verify the harness**

Run:

```powershell
npm test
```

Expected: `tests/smoke.test.ts` passes.

- [ ] **Step 5: Verify TypeScript baseline**

Run:

```powershell
npm run typecheck
```

Expected: TypeScript exits with code `0`.

- [ ] **Step 6: Commit**

```powershell
git add package.json package-lock.json tsconfig.json next.config.mjs postcss.config.mjs tailwind.config.ts vitest.config.ts test/setup.ts tests/smoke.test.ts app/layout.tsx app/globals.css
git commit -m "chore: scaffold next app"
```

---

## Task 2: Domain Types, Labels, And Follow-Up Templates

**Files:**

- Create: `tests/lib/questionTypes.test.ts`
- Create: `tests/lib/followupTemplates.test.ts`
- Create: `lib/questionTypes.ts`
- Create: `lib/followupTemplates.ts`

- [ ] **Step 1: Write failing tests for question type coverage**

Create `tests/lib/questionTypes.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { FOLLOWUP_PURPOSES, QUESTION_TYPE_LABELS, QUESTION_TYPES } from "@/lib/questionTypes";

describe("question types", () => {
  it("defines exactly ten supported question types", () => {
    expect(QUESTION_TYPES).toEqual([
      "research_fact",
      "concept_learning",
      "perspective_interpretation",
      "idea_generation",
      "strategy_business",
      "decision_comparison",
      "problem_diagnosis",
      "critique_risk",
      "execution_roadmap",
      "artifact_creation"
    ]);
  });

  it("has a Korean label for every question type", () => {
    for (const type of QUESTION_TYPES) {
      expect(QUESTION_TYPE_LABELS[type]).toMatch(/[가-힣]/);
    }
  });

  it("defines the five follow-up purposes in product order", () => {
    expect(FOLLOWUP_PURPOSES).toEqual([
      "goal",
      "context",
      "known_or_excluded",
      "tension_or_assumption",
      "output_or_validation"
    ]);
  });
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```powershell
npm test -- tests/lib/questionTypes.test.ts
```

Expected: FAIL because `@/lib/questionTypes` does not exist.

- [ ] **Step 3: Implement question type constants**

Create `lib/questionTypes.ts`:

```ts
export const QUESTION_TYPES = [
  "research_fact",
  "concept_learning",
  "perspective_interpretation",
  "idea_generation",
  "strategy_business",
  "decision_comparison",
  "problem_diagnosis",
  "critique_risk",
  "execution_roadmap",
  "artifact_creation"
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  research_fact: "리서치/사실 확인형",
  concept_learning: "개념 이해/학습형",
  perspective_interpretation: "관점 확장/해석형",
  idea_generation: "아이디어 발상형",
  strategy_business: "전략/사업/시장 분석형",
  decision_comparison: "의사결정/비교형",
  problem_diagnosis: "문제 진단/해결형",
  critique_risk: "비판/반론/리스크 검토형",
  execution_roadmap: "실행 계획/로드맵형",
  artifact_creation: "산출물 제작/구현형"
};

export const FOLLOWUP_PURPOSES = [
  "goal",
  "context",
  "known_or_excluded",
  "tension_or_assumption",
  "output_or_validation"
] as const;

export type FollowupPurpose = (typeof FOLLOWUP_PURPOSES)[number];

export const FOLLOWUP_PURPOSE_LABELS: Record<FollowupPurpose, string> = {
  goal: "목표",
  context: "맥락",
  known_or_excluded: "이미 아는 것/제외할 답변",
  tension_or_assumption: "긴장/숨은 가정",
  output_or_validation: "출력/검증 방식"
};
```

- [ ] **Step 4: Verify question type tests pass**

Run:

```powershell
npm test -- tests/lib/questionTypes.test.ts
```

Expected: PASS.

- [ ] **Step 5: Write failing tests for follow-up templates**

Create `tests/lib/followupTemplates.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { FOLLOWUP_PURPOSES, QUESTION_TYPES } from "@/lib/questionTypes";
import { FOLLOWUP_TEMPLATES, getFollowupQuestions } from "@/lib/followupTemplates";

describe("follow-up templates", () => {
  it("has exactly five follow-up questions for every type", () => {
    for (const type of QUESTION_TYPES) {
      expect(FOLLOWUP_TEMPLATES[type]).toHaveLength(5);
    }
  });

  it("covers every purpose in the expected order", () => {
    for (const type of QUESTION_TYPES) {
      expect(FOLLOWUP_TEMPLATES[type].map((item) => item.purpose)).toEqual(FOLLOWUP_PURPOSES);
    }
  });

  it("returns purpose ids that match their purpose", () => {
    const questions = getFollowupQuestions("strategy_business");

    expect(questions).toHaveLength(5);
    expect(questions[0]).toMatchObject({
      id: "goal",
      purpose: "goal"
    });
    expect(questions[1].question).toContain("제품");
  });
});
```

- [ ] **Step 6: Run tests and verify they fail**

Run:

```powershell
npm test -- tests/lib/followupTemplates.test.ts
```

Expected: FAIL because `@/lib/followupTemplates` does not exist.

- [ ] **Step 7: Implement follow-up templates**

Create `lib/followupTemplates.ts`:

```ts
import type { FollowupPurpose, QuestionType } from "./questionTypes";

export type FollowupQuestion = {
  id: FollowupPurpose;
  purpose: FollowupPurpose;
  question: string;
};

type TemplateItem = Omit<FollowupQuestion, "id">;

const withIds = (items: TemplateItem[]): FollowupQuestion[] =>
  items.map((item) => ({ id: item.purpose, ...item }));

export const FOLLOWUP_TEMPLATES: Record<QuestionType, FollowupQuestion[]> = {
  research_fact: withIds([
    { purpose: "goal", question: "이 정보를 어떤 목적으로 확인하려고 하나요? 예: 의사결정, 보고서, 콘텐츠, 투자 판단, 단순 이해." },
    { purpose: "context", question: "정확히 어떤 범위의 정보를 알고 싶나요? 예: 국가, 산업, 기업, 기간, 특정 사건." },
    { purpose: "known_or_excluded", question: "이미 알고 있는 내용이나 제외하고 싶은 일반론은 무엇인가요?" },
    { purpose: "tension_or_assumption", question: "이 주제에서 비교하고 싶은 입장, 논쟁 지점, 혹은 의심되는 통념이 있나요?" },
    { purpose: "output_or_validation", question: "최종 답변은 어떤 형식이면 좋나요? 예: 요약, 표, 타임라인, 출처 중심 분석, 브리핑." }
  ]),
  concept_learning: withIds([
    { purpose: "goal", question: "이 개념을 왜 이해하려고 하나요? 예: 공부, 업무 적용, 사업 기획, 의사결정, 발표 준비." },
    { purpose: "context", question: "현재 이 주제에 대해 어느 정도 알고 있나요? 초보, 중급, 실무 경험 있음 중 어디에 가까운가요?" },
    { purpose: "known_or_excluded", question: "이미 알고 있는 설명이나 반복해서 듣고 싶지 않은 일반론은 무엇인가요?" },
    { purpose: "tension_or_assumption", question: "특히 헷갈리는 부분, 오해하고 있을까 걱정되는 부분, 서로 충돌하는 개념은 무엇인가요?" },
    { purpose: "output_or_validation", question: "답변 후 어떤 결과물이 있으면 좋나요? 예: 쉬운 비유, 구조도, 체크리스트, 학습 로드맵, 퀴즈." }
  ]),
  perspective_interpretation: withIds([
    { purpose: "goal", question: "이 주제를 어떤 용도로 깊게 이해하고 싶나요? 예: 글쓰기, 토론, 전략 판단, 자기 사고 확장." },
    { purpose: "context", question: "이 주제에 대해 지금 당신이 가진 생각이나 가설은 무엇인가요?" },
    { purpose: "known_or_excluded", question: "흔한 답변 중에서 듣고 싶지 않은 일반론은 무엇인가요?" },
    { purpose: "tension_or_assumption", question: "이 주제에서 가장 불편하거나 논쟁적인 지점은 무엇이라고 생각하나요?" },
    { purpose: "output_or_validation", question: "어떤 관점들을 충돌시켜보고 싶나요? 예: 경제학자, 예술가, 철학자, 창업자, 노동자, 미래학자." }
  ]),
  idea_generation: withIds([
    { purpose: "goal", question: "아이디어를 통해 최종적으로 얻고 싶은 것은 무엇인가요? 예: 사업, 콘텐츠, 앱, 프로젝트, 수익화, 실험." },
    { purpose: "context", question: "어떤 분야, 문제 영역, 사용자군에서 아이디어를 찾고 싶나요?" },
    { purpose: "known_or_excluded", question: "이미 떠올린 아이디어나 제외하고 싶은 뻔한 아이디어는 무엇인가요?" },
    { purpose: "tension_or_assumption", question: "원하는 새로움의 정도는 어느 쪽인가요? 현실적인 아이디어, 독특한 아이디어, 매우 실험적인 아이디어 중 골라주세요." },
    { purpose: "output_or_validation", question: "좋은 아이디어를 판단하는 기준은 무엇인가요? 예: 수익성, 실행 가능성, 차별성, 빠른 검증, 장기 확장성." }
  ]),
  strategy_business: withIds([
    { purpose: "goal", question: "이 분석을 통해 얻고 싶은 최종 결과는 무엇인가요? 예: 포지셔닝, 시장 검증, 차별화, 수익 모델, 투자 판단." },
    { purpose: "context", question: "현재 다루는 제품, 서비스, 사업 아이디어를 한 문장으로 설명해주세요." },
    { purpose: "known_or_excluded", question: "이미 알고 있거나 제외하고 싶은 일반적인 사업 조언은 무엇인가요?" },
    { purpose: "tension_or_assumption", question: "당신이 현재 믿고 있는 핵심 가정은 무엇인가요? 예: 고객은 이 문제에 돈을 낼 것이다, 경쟁자는 쉽게 따라오지 못할 것이다." },
    { purpose: "output_or_validation", question: "최종 답변에서 원하는 것은 무엇인가요? 예: 전략 옵션, 리스크 분석, 검증 실험, 포지셔닝 문장, 실행 로드맵." }
  ]),
  decision_comparison: withIds([
    { purpose: "goal", question: "이 결정을 통해 얻고 싶은 가장 중요한 결과는 무엇인가요?" },
    { purpose: "context", question: "비교하려는 선택지들을 구체적으로 적어주세요." },
    { purpose: "known_or_excluded", question: "이미 알고 있는 장단점이나 제외하고 싶은 뻔한 비교 기준은 무엇인가요?" },
    { purpose: "tension_or_assumption", question: "이 선택에서 가장 갈등되는 기준은 무엇인가요? 예: 돈 vs 자유, 안정성 vs 성장, 단기 이익 vs 장기 가능성." },
    { purpose: "output_or_validation", question: "최종 답변은 어떤 방식이면 좋나요? 예: 추천 결론, 조건부 판단, 점수표, 리스크 분석, 30일 실험." }
  ]),
  problem_diagnosis: withIds([
    { purpose: "goal", question: "이 문제가 해결되었다고 판단할 기준은 무엇인가요?" },
    { purpose: "context", question: "현재 문제가 어떤 현상으로 나타나고 있나요? 숫자, 사례, 반복 패턴이 있다면 적어주세요." },
    { purpose: "known_or_excluded", question: "지금까지 시도한 해결책과 그 결과는 무엇인가요?" },
    { purpose: "tension_or_assumption", question: "당신이 의심하는 원인은 무엇이고, 반대로 아닐 수도 있는 가능성은 무엇인가요?" },
    { purpose: "output_or_validation", question: "최종 답변은 어떤 형태이면 좋나요? 예: 원인 분석, 해결 실험, 우선순위, 체크리스트, 실행 계획." }
  ]),
  critique_risk: withIds([
    { purpose: "goal", question: "비판을 통해 최종적으로 얻고 싶은 것은 무엇인가요? 예: 폐기 여부, 개선안, 리스크 파악, 반론에 강한 버전." },
    { purpose: "context", question: "검토받고 싶은 주장, 아이디어, 계획을 구체적으로 적어주세요." },
    { purpose: "known_or_excluded", question: "이미 알고 있는 약점이나 듣고 싶지 않은 뻔한 비판은 무엇인가요?" },
    { purpose: "tension_or_assumption", question: "가장 두렵지만 확인해야 하는 실패 가능성이나 숨은 가정은 무엇인가요?" },
    { purpose: "output_or_validation", question: "최종 답변은 어떤 형식이면 좋나요? 예: 치명도 순위, 반론 목록, 보완 전략, 검증 실험." }
  ]),
  execution_roadmap: withIds([
    { purpose: "goal", question: "이 계획을 통해 최종적으로 달성하려는 결과는 무엇인가요?" },
    { purpose: "context", question: "현재 상태, 사용 가능한 자원, 기간, 함께 일하는 사람을 적어주세요." },
    { purpose: "known_or_excluded", question: "이미 정한 일, 시도한 일, 제외하고 싶은 실행 방식은 무엇인가요?" },
    { purpose: "tension_or_assumption", question: "가장 큰 병목, 실패 위험, 단기 실행과 장기 방향이 충돌하는 지점은 무엇인가요?" },
    { purpose: "output_or_validation", question: "로드맵은 어떤 단위로 보고 싶나요? 예: 7일, 30일, 90일, 체크리스트, 역할별 실행표." }
  ]),
  artifact_creation: withIds([
    { purpose: "goal", question: "만들고 싶은 산출물의 목적은 무엇인가요? 예: PRD, 코드 설계, 발표 자료, 문서, 화면 흐름." },
    { purpose: "context", question: "이 산출물을 볼 대상, 사용 상황, 톤, 제약 조건을 적어주세요." },
    { purpose: "known_or_excluded", question: "반드시 포함하거나 제외하고 싶은 내용, 이미 정한 구조는 무엇인가요?" },
    { purpose: "tension_or_assumption", question: "이 산출물이 평범해지거나 실패할 수 있는 가장 큰 위험은 무엇인가요?" },
    { purpose: "output_or_validation", question: "최종 산출물은 어떤 형식과 수준이면 좋나요? 예: 목차, 상세 PRD, 구현 순서, 코드 스캐폴드, 평가 기준." }
  ])
};

export function getFollowupQuestions(type: QuestionType): FollowupQuestion[] {
  return FOLLOWUP_TEMPLATES[type].map((item) => ({ ...item }));
}
```

- [ ] **Step 8: Verify follow-up tests pass**

Run:

```powershell
npm test -- tests/lib/questionTypes.test.ts tests/lib/followupTemplates.test.ts
```

Expected: PASS.

- [ ] **Step 9: Commit**

```powershell
git add lib/questionTypes.ts lib/followupTemplates.ts tests/lib/questionTypes.test.ts tests/lib/followupTemplates.test.ts
git commit -m "feat: add question taxonomy and followups"
```

---

## Task 3: Zod Schemas And Shared Types

**Files:**

- Create: `tests/lib/types.test.ts`
- Create: `lib/types.ts`

- [ ] **Step 1: Write failing schema tests**

Create `tests/lib/types.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  analyzeQuestionRequestSchema,
  questionAnalysisSchema,
  synthesizePromptRequestSchema,
  ultimatePromptResultSchema
} from "@/lib/types";

describe("shared schemas", () => {
  it("accepts a valid analyze request", () => {
    expect(
      analyzeQuestionRequestSchema.parse({
        rawQuestion: "이 사업 아이디어가 시장에서 통할지 알고 싶어.",
        apiKey: "sk-test",
        model: "gpt-5.5"
      })
    ).toMatchObject({ model: "gpt-5.5" });
  });

  it("rejects too-short raw questions", () => {
    expect(() =>
      analyzeQuestionRequestSchema.parse({
        rawQuestion: "사업",
        apiKey: "sk-test",
        model: "gpt-5.5"
      })
    ).toThrow("질문이 너무 짧습니다");
  });

  it("accepts valid analysis output", () => {
    const analysis = questionAnalysisSchema.parse({
      primaryType: "strategy_business",
      secondaryTypes: ["idea_generation", "critique_risk"],
      confidence: 0.86,
      surfaceQuestion: "사용자는 사업 아이디어 가능성을 묻고 있다.",
      deeperIntent: "시장 가능성과 실패 가능성을 알고 싶어한다.",
      genericAnswerRisk: "고객과 검증 방식이 빠지면 일반론으로 흐른다.",
      missingDimensions: ["타깃 고객", "경쟁자", "수익 모델", "검증 방식", "성공 기준"],
      recommendedFollowupFocus: ["goal", "context", "known_or_excluded", "tension_or_assumption", "output_or_validation"]
    });

    expect(analysis.primaryType).toBe("strategy_business");
  });

  it("accepts a synthesis request with empty follow-up answers", () => {
    const request = synthesizePromptRequestSchema.parse({
      rawQuestion: "내 앱 아이디어가 괜찮은지 알고 싶어.",
      apiKey: "sk-test",
      model: "gpt-5.5",
      analysis: {
        primaryType: "strategy_business",
        secondaryTypes: [],
        confidence: 0.5,
        surfaceQuestion: "앱 아이디어 평가",
        deeperIntent: "실제 가능성 판단",
        genericAnswerRisk: "일반적인 장단점으로 흐름",
        missingDimensions: [],
        recommendedFollowupFocus: []
      },
      followupAnswers: [
        { purpose: "goal", question: "목표는?", answer: "" },
        { purpose: "context", question: "맥락은?", answer: "" },
        { purpose: "known_or_excluded", question: "제외할 것은?", answer: "" },
        { purpose: "tension_or_assumption", question: "긴장은?", answer: "" },
        { purpose: "output_or_validation", question: "출력은?", answer: "" }
      ]
    });

    expect(request.followupAnswers[0].answer).toBe("");
  });

  it("accepts a valid ultimate prompt result", () => {
    const result = ultimatePromptResultSchema.parse({
      shortVersion: "짧은 프롬프트",
      deepVersion: "깊은 프롬프트",
      expertVersion: "전문가 프롬프트",
      whyThisPromptIsStrong: ["숨은 가정을 요구한다."],
      qualityScore: {
        total: 90,
        context: 15,
        goal: 15,
        knownExclusions: 10,
        tension: 20,
        perspectiveCollision: 15,
        selfRefutation: 10,
        outputClarity: 5
      },
      improvementSuggestions: ["검증 기준을 더 구체화하세요."]
    });

    expect(result.qualityScore.total).toBe(90);
  });
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```powershell
npm test -- tests/lib/types.test.ts
```

Expected: FAIL because `@/lib/types` does not exist.

- [ ] **Step 3: Implement shared schemas and types**

Create `lib/types.ts`:

```ts
import { z } from "zod";
import { FOLLOWUP_PURPOSES, QUESTION_TYPES } from "./questionTypes";

export const MAX_INPUT_LENGTH = 3000;
export const DEFAULT_MODEL = "gpt-5.5";

export const questionTypeSchema = z.enum(QUESTION_TYPES);
export const followupPurposeSchema = z.enum(FOLLOWUP_PURPOSES);

const rawQuestionSchema = z
  .string()
  .trim()
  .min(10, "질문이 너무 짧습니다. AI에게 묻고 싶은 내용을 한 문장 이상으로 적어주세요.")
  .max(MAX_INPUT_LENGTH, "질문은 3000자 이하로 입력해주세요.");

const apiKeySchema = z.string().trim().min(1, "OpenAI API 키를 입력해주세요.");
const modelSchema = z.string().trim().min(1).default(DEFAULT_MODEL);

export const questionAnalysisSchema = z.object({
  primaryType: questionTypeSchema,
  secondaryTypes: z.array(questionTypeSchema).max(2),
  confidence: z.number().min(0).max(1),
  surfaceQuestion: z.string().min(1),
  deeperIntent: z.string().min(1),
  genericAnswerRisk: z.string().min(1),
  missingDimensions: z.array(z.string()).max(8),
  recommendedFollowupFocus: z.array(followupPurposeSchema).max(5)
});

export const followupQuestionSchema = z.object({
  id: followupPurposeSchema,
  purpose: followupPurposeSchema,
  question: z.string().min(1)
});

export const followupAnswerSchema = z.object({
  purpose: followupPurposeSchema,
  question: z.string().min(1),
  answer: z.string().max(MAX_INPUT_LENGTH, "후속 답변은 3000자 이하로 입력해주세요.")
});

export const qualityScoreSchema = z.object({
  total: z.number().min(0).max(100),
  context: z.number().min(0).max(15),
  goal: z.number().min(0).max(15),
  knownExclusions: z.number().min(0).max(10),
  tension: z.number().min(0).max(20),
  perspectiveCollision: z.number().min(0).max(15),
  selfRefutation: z.number().min(0).max(10),
  outputClarity: z.number().min(0).max(15)
});

export const ultimatePromptResultSchema = z.object({
  shortVersion: z.string().min(1),
  deepVersion: z.string().min(1),
  expertVersion: z.string().min(1),
  whyThisPromptIsStrong: z.array(z.string()).min(1),
  qualityScore: qualityScoreSchema,
  improvementSuggestions: z.array(z.string())
});

export const analyzeQuestionRequestSchema = z.object({
  rawQuestion: rawQuestionSchema,
  apiKey: apiKeySchema,
  model: modelSchema
});

export const generateFollowupsRequestSchema = z.object({
  primaryType: questionTypeSchema
});

export const synthesizePromptRequestSchema = z.object({
  rawQuestion: rawQuestionSchema,
  apiKey: apiKeySchema,
  model: modelSchema,
  analysis: questionAnalysisSchema,
  followupAnswers: z.array(followupAnswerSchema).length(5)
});

export type QuestionAnalysis = z.infer<typeof questionAnalysisSchema>;
export type FollowupQuestion = z.infer<typeof followupQuestionSchema>;
export type FollowupAnswer = z.infer<typeof followupAnswerSchema>;
export type QualityScore = z.infer<typeof qualityScoreSchema>;
export type UltimatePromptResult = z.infer<typeof ultimatePromptResultSchema>;
export type AnalyzeQuestionRequest = z.infer<typeof analyzeQuestionRequestSchema>;
export type SynthesizePromptRequest = z.infer<typeof synthesizePromptRequestSchema>;
```

- [ ] **Step 4: Verify schema tests pass**

Run:

```powershell
npm test -- tests/lib/types.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add lib/types.ts tests/lib/types.test.ts
git commit -m "feat: add shared schemas"
```

---

## Task 4: Quality Scoring

**Files:**

- Create: `tests/lib/qualityScore.test.ts`
- Create: `lib/qualityScore.ts`

- [ ] **Step 1: Write failing quality score tests**

Create `tests/lib/qualityScore.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { calculateQualityScore, getQualityMessage } from "@/lib/qualityScore";
import type { FollowupAnswer } from "@/lib/types";

const answers = (overrides: Partial<Record<FollowupAnswer["purpose"], string>>): FollowupAnswer[] => [
  { purpose: "goal", question: "목표", answer: overrides.goal ?? "" },
  { purpose: "context", question: "맥락", answer: overrides.context ?? "" },
  { purpose: "known_or_excluded", question: "제외", answer: overrides.known_or_excluded ?? "" },
  { purpose: "tension_or_assumption", question: "긴장", answer: overrides.tension_or_assumption ?? "" },
  { purpose: "output_or_validation", question: "출력", answer: overrides.output_or_validation ?? "" }
];

describe("quality score", () => {
  it("rewards complete answers and required prompt devices", () => {
    const score = calculateQualityScore({
      promptText: "숨은 가정과 긴장/충돌을 찾고, 관점 충돌을 보여주고, 네 결론을 반박한 뒤, 추상화와 구체적 실행/검증 방법을 제시해줘.",
      followupAnswers: answers({
        goal: "시장 검증에 쓰고 싶다.",
        context: "초기 MVP를 만들고 있다.",
        known_or_excluded: "일반적인 장단점은 제외한다.",
        tension_or_assumption: "고객이 돈을 낼 것이라는 가정이 불안하다.",
        output_or_validation: "30일 검증 실험으로 받고 싶다."
      })
    });

    expect(score.total).toBeGreaterThanOrEqual(90);
    expect(score.tension).toBe(20);
    expect(score.selfRefutation).toBe(10);
  });

  it("penalizes missing goal and context", () => {
    const score = calculateQualityScore({
      promptText: "관점에서 분석해줘.",
      followupAnswers: answers({})
    });

    expect(score.total).toBeLessThan(60);
    expect(score.goal).toBe(0);
    expect(score.context).toBe(0);
  });

  it("returns Korean score messages", () => {
    expect(getQualityMessage(92)).toContain("매우 강한 질문");
    expect(getQualityMessage(80)).toContain("좋은 질문");
    expect(getQualityMessage(65)).toContain("긴장");
    expect(getQualityMessage(40)).toContain("일반론");
  });
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```powershell
npm test -- tests/lib/qualityScore.test.ts
```

Expected: FAIL because `@/lib/qualityScore` does not exist.

- [ ] **Step 3: Implement quality scoring**

Create `lib/qualityScore.ts`:

```ts
import type { FollowupAnswer, QualityScore } from "./types";

type ScoreInput = {
  promptText: string;
  followupAnswers: FollowupAnswer[];
};

const hasText = (value: string | undefined) => Boolean(value && value.trim().length >= 8);

const includesAny = (text: string, needles: string[]) => needles.some((needle) => text.includes(needle));

const answerByPurpose = (answers: FollowupAnswer[], purpose: FollowupAnswer["purpose"]) =>
  answers.find((answer) => answer.purpose === purpose)?.answer ?? "";

export function calculateQualityScore({ promptText, followupAnswers }: ScoreInput): QualityScore {
  const normalized = promptText.replace(/\s+/g, " ");

  const context = hasText(answerByPurpose(followupAnswers, "context")) ? 15 : 0;
  const goal = hasText(answerByPurpose(followupAnswers, "goal")) ? 15 : 0;
  const knownExclusions = hasText(answerByPurpose(followupAnswers, "known_or_excluded")) ? 10 : 0;
  const tension =
    hasText(answerByPurpose(followupAnswers, "tension_or_assumption")) &&
    includesAny(normalized, ["긴장", "충돌", "숨은 가정", "반대 가능성", "리스크"])
      ? 20
      : includesAny(normalized, ["긴장", "충돌", "숨은 가정", "반대 가능성", "리스크"])
        ? 12
        : 0;
  const perspectiveCollision = includesAny(normalized, ["관점 충돌", "서로 충돌", "충돌하는 지점"]) ? 15 : 0;
  const selfRefutation = includesAny(normalized, ["반박", "자기반박", "강한 반론"]) ? 10 : 0;
  const outputClarity =
    hasText(answerByPurpose(followupAnswers, "output_or_validation")) &&
    includesAny(normalized, ["출력 형식", "실행", "검증", "실험", "체크리스트", "로드맵"])
      ? 15
      : hasText(answerByPurpose(followupAnswers, "output_or_validation"))
        ? 8
        : 0;

  const total = context + goal + knownExclusions + tension + perspectiveCollision + selfRefutation + outputClarity;

  return {
    total,
    context,
    goal,
    knownExclusions,
    tension,
    perspectiveCollision,
    selfRefutation,
    outputClarity
  };
}

export function getQualityMessage(score: number) {
  if (score >= 90) return "매우 강한 질문입니다. AI가 일반론으로 도망가기 어렵습니다.";
  if (score >= 75) return "좋은 질문입니다. 깊이 있는 답변을 끌어낼 가능성이 높습니다.";
  if (score >= 60) return "기본 질문보다 낫지만, 긴장이나 검증 방식이 더 필요합니다.";
  return "아직 일반론으로 흐를 가능성이 큽니다. 목표, 맥락, 충돌 지점을 더 구체화하세요.";
}

export function buildImprovementSuggestions(score: QualityScore): string[] {
  const suggestions: string[] = [];

  if (score.goal < 15) suggestions.push("최종 답변을 어디에 쓸지 목표를 더 구체화하세요.");
  if (score.context < 15) suggestions.push("상황, 대상, 제약 조건 같은 맥락을 더 보강하세요.");
  if (score.knownExclusions < 10) suggestions.push("이미 알고 있는 일반론과 제외할 답변을 명시하세요.");
  if (score.tension < 20) suggestions.push("통념과 반대 가능성, 단기와 장기, 욕망과 현실의 충돌을 더 분명히 적으세요.");
  if (score.perspectiveCollision < 15) suggestions.push("여러 관점을 나열하지 말고 서로 충돌시키도록 요구하세요.");
  if (score.selfRefutation < 10) suggestions.push("AI가 자기 결론을 가장 강하게 반박한 뒤 다시 종합하도록 요구하세요.");
  if (score.outputClarity < 15) suggestions.push("원하는 출력 형식과 실제 검증 방법을 더 명확히 적으세요.");

  return suggestions;
}
```

- [ ] **Step 4: Verify quality tests pass**

Run:

```powershell
npm test -- tests/lib/qualityScore.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add lib/qualityScore.ts tests/lib/qualityScore.test.ts
git commit -m "feat: add prompt quality scoring"
```

---

## Task 5: Prompt Builders, JSON Helpers, And OpenAI Wrapper

**Files:**

- Create: `tests/lib/json.test.ts`
- Create: `tests/lib/llm.test.ts`
- Create: `lib/json.ts`
- Create: `lib/openaiSchemas.ts`
- Create: `lib/llm.ts`
- Create: `lib/prompts/analyzeQuestion.ts`
- Create: `lib/prompts/synthesizeUltimatePrompt.ts`

- [ ] **Step 1: Write failing JSON helper tests**

Create `tests/lib/json.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { extractOutputText, parseJsonObject } from "@/lib/json";

describe("json helpers", () => {
  it("parses a JSON object string", () => {
    expect(parseJsonObject('{"ok":true}')).toEqual({ ok: true });
  });

  it("rejects JSON arrays", () => {
    expect(() => parseJsonObject("[1,2,3]")).toThrow("Expected a JSON object");
  });

  it("extracts output_text from an OpenAI-like response", () => {
    expect(extractOutputText({ output_text: '{"ok":true}' })).toBe('{"ok":true}');
  });

  it("extracts text from nested response output content", () => {
    const response = {
      output: [
        {
          content: [
            { type: "output_text", text: '{"nested":true}' }
          ]
        }
      ]
    };

    expect(extractOutputText(response)).toBe('{"nested":true}');
  });
});
```

- [ ] **Step 2: Run JSON tests and verify they fail**

Run:

```powershell
npm test -- tests/lib/json.test.ts
```

Expected: FAIL because `@/lib/json` does not exist.

- [ ] **Step 3: Implement JSON helpers**

Create `lib/json.ts`:

```ts
export function parseJsonObject(text: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(text);

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Expected a JSON object");
  }

  return parsed as Record<string, unknown>;
}

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));

export function extractOutputText(response: unknown): string {
  if (isRecord(response) && typeof response.output_text === "string") {
    return response.output_text;
  }

  if (isRecord(response) && Array.isArray(response.output)) {
    for (const item of response.output) {
      if (!isRecord(item) || !Array.isArray(item.content)) continue;
      for (const content of item.content) {
        if (isRecord(content) && typeof content.text === "string") {
          return content.text;
        }
      }
    }
  }

  throw new Error("OpenAI response did not include output text");
}
```

- [ ] **Step 4: Verify JSON tests pass**

Run:

```powershell
npm test -- tests/lib/json.test.ts
```

Expected: PASS.

- [ ] **Step 5: Write failing OpenAI wrapper tests**

Create `tests/lib/llm.test.ts`:

```ts
import { z } from "zod";
import { describe, expect, it, vi } from "vitest";
import { requestStructuredOutput } from "@/lib/llm";

describe("OpenAI structured output wrapper", () => {
  it("sends a Responses API request with text.format JSON schema", async () => {
    const create = vi.fn().mockResolvedValue({ output_text: '{"ok":true}' });
    const clientFactory = () => ({ responses: { create } });

    const result = await requestStructuredOutput({
      apiKey: "sk-test",
      model: "gpt-5.5",
      prompt: "Return JSON",
      schemaName: "test_schema",
      jsonSchema: {
        type: "object",
        additionalProperties: false,
        properties: { ok: { type: "boolean" } },
        required: ["ok"]
      },
      schema: z.object({ ok: z.boolean() }),
      clientFactory
    });

    expect(result).toEqual({ ok: true });
    expect(create).toHaveBeenCalledWith({
      model: "gpt-5.5",
      input: "Return JSON",
      reasoning: { effort: "medium" },
      text: {
        format: {
          type: "json_schema",
          name: "test_schema",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: { ok: { type: "boolean" } },
            required: ["ok"]
          }
        }
      }
    });
  });

  it("throws when structured output fails Zod validation", async () => {
    const clientFactory = () => ({
      responses: {
        create: vi.fn().mockResolvedValue({ output_text: '{"ok":"wrong"}' })
      }
    });

    await expect(
      requestStructuredOutput({
        apiKey: "sk-test",
        model: "gpt-5.5",
        prompt: "Return JSON",
        schemaName: "test_schema",
        jsonSchema: {
          type: "object",
          additionalProperties: false,
          properties: { ok: { type: "boolean" } },
          required: ["ok"]
        },
        schema: z.object({ ok: z.boolean() }),
        clientFactory
      })
    ).rejects.toThrow();
  });
});
```

- [ ] **Step 6: Run OpenAI wrapper tests and verify they fail**

Run:

```powershell
npm test -- tests/lib/llm.test.ts
```

Expected: FAIL because `@/lib/llm` does not exist.

- [ ] **Step 7: Implement OpenAI wrapper and schemas**

Create `lib/llm.ts`:

```ts
import OpenAI from "openai";
import type { z } from "zod";
import { extractOutputText, parseJsonObject } from "./json";

type ResponsesClient = {
  responses: {
    create: (request: unknown) => Promise<unknown>;
  };
};

export type RequestStructuredOutputInput<T> = {
  apiKey: string;
  model: string;
  prompt: string;
  schemaName: string;
  jsonSchema: Record<string, unknown>;
  schema: z.ZodType<T>;
  clientFactory?: (apiKey: string) => ResponsesClient;
};

const createOpenAIClient = (apiKey: string): ResponsesClient => new OpenAI({ apiKey }) as unknown as ResponsesClient;

export async function requestStructuredOutput<T>({
  apiKey,
  model,
  prompt,
  schemaName,
  jsonSchema,
  schema,
  clientFactory = createOpenAIClient
}: RequestStructuredOutputInput<T>): Promise<T> {
  const client = clientFactory(apiKey);
  const response = await client.responses.create({
    model,
    input: prompt,
    reasoning: { effort: "medium" },
    text: {
      format: {
        type: "json_schema",
        name: schemaName,
        strict: true,
        schema: jsonSchema
      }
    }
  });
  const parsed = parseJsonObject(extractOutputText(response));
  return schema.parse(parsed);
}
```

Create `lib/openaiSchemas.ts`:

```ts
export const questionAnalysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    primaryType: { type: "string" },
    secondaryTypes: { type: "array", items: { type: "string" }, maxItems: 2 },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    surfaceQuestion: { type: "string" },
    deeperIntent: { type: "string" },
    genericAnswerRisk: { type: "string" },
    missingDimensions: { type: "array", items: { type: "string" }, maxItems: 8 },
    recommendedFollowupFocus: { type: "array", items: { type: "string" }, maxItems: 5 }
  },
  required: [
    "primaryType",
    "secondaryTypes",
    "confidence",
    "surfaceQuestion",
    "deeperIntent",
    "genericAnswerRisk",
    "missingDimensions",
    "recommendedFollowupFocus"
  ]
} as const;

export const ultimatePromptResultJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    shortVersion: { type: "string" },
    deepVersion: { type: "string" },
    expertVersion: { type: "string" },
    whyThisPromptIsStrong: { type: "array", items: { type: "string" }, minItems: 1 },
    improvementSuggestions: { type: "array", items: { type: "string" } }
  },
  required: ["shortVersion", "deepVersion", "expertVersion", "whyThisPromptIsStrong", "improvementSuggestions"]
} as const;
```

Create `lib/prompts/analyzeQuestion.ts`:

```ts
export function buildAnalyzeQuestionPrompt(rawQuestion: string) {
  return `너는 사용자의 질문에 답변하는 AI가 아니다.
너는 사용자의 질문을 더 강력한 질문으로 재설계하기 위한 질문 분석기다.

사용자의 최초 질문을 분석하라.

사용자 질문:
"${rawQuestion}"

질문 유형은 반드시 아래 10개 중 하나를 primaryType으로 선택하라.
research_fact, concept_learning, perspective_interpretation, idea_generation, strategy_business, decision_comparison, problem_diagnosis, critique_risk, execution_roadmap, artifact_creation

해야 할 일:
1. primaryType을 하나 선택하라.
2. secondaryTypes를 최대 2개까지 선택하라.
3. 사용자의 표면 질문을 요약하라.
4. 사용자의 더 깊은 의도를 합리적으로 추론하라.
5. 이 질문이 평범한 답변으로 흐를 위험을 설명하라.
6. 최종 궁극 질문을 만들기 위해 부족한 정보 missingDimensions를 제시하라.
7. 후속 질문이 집중해야 할 영역 recommendedFollowupFocus를 제시하라.

중요 원칙:
- 질문에 직접 답하지 마라.
- 사용자의 의도를 과도하게 확정하지 마라.
- 평범한 답변을 막기 위해 어떤 정보가 필요한지 판단하라.
- 한국어로 작성하라.`;
}
```

Create `lib/prompts/synthesizeUltimatePrompt.ts`:

```ts
import type { FollowupAnswer, QuestionAnalysis } from "../types";

export function buildSynthesizeUltimatePrompt(input: {
  rawQuestion: string;
  analysis: QuestionAnalysis;
  followupAnswers: FollowupAnswer[];
}) {
  const answers = input.followupAnswers
    .map((item) => `- ${item.purpose}: ${item.answer.trim() || "정보 없음"}`)
    .join("\n");

  return `너는 사용자의 평범한 질문을 AI가 깊게 사고할 수밖에 없는 궁극 질문 프롬프트로 재설계한다.

원래 질문:
${input.rawQuestion}

질문 분석:
- primaryType: ${input.analysis.primaryType}
- secondaryTypes: ${input.analysis.secondaryTypes.join(", ") || "없음"}
- deeperIntent: ${input.analysis.deeperIntent}
- genericAnswerRisk: ${input.analysis.genericAnswerRisk}

사용자의 후속 답변:
${answers}

반드시 세 가지 버전을 생성하라.
1. shortVersion: 빠르게 복사해서 쓸 수 있는 버전
2. deepVersion: 깊은 사고를 요구하는 기본 추천 버전
3. expertVersion: 가장 강력한 사고 유도용 버전

세 버전에는 반드시 다음 사고 장치를 포함하라.
- 숨은 가정
- 긴장/충돌
- 관점 충돌
- 통념 반박
- 자기반박
- 추상/구체 왕복
- 실행/검증 방법

한국어로 작성하고, 뻔한 일반론과 블로그식 조언을 피하라.`;
}
```

- [ ] **Step 8: Verify wrapper tests pass**

Run:

```powershell
npm test -- tests/lib/json.test.ts tests/lib/llm.test.ts
```

Expected: PASS.

- [ ] **Step 9: Commit**

```powershell
git add lib/json.ts lib/openaiSchemas.ts lib/llm.ts lib/prompts/analyzeQuestion.ts lib/prompts/synthesizeUltimatePrompt.ts tests/lib/json.test.ts tests/lib/llm.test.ts
git commit -m "feat: add structured llm wrapper"
```

---

## Task 6: Server Services And API Routes

**Files:**

- Create: `tests/lib/server/analyzeQuestion.test.ts`
- Create: `tests/lib/server/generateFollowups.test.ts`
- Create: `tests/lib/server/synthesizeUltimatePrompt.test.ts`
- Create: `lib/server/analyzeQuestion.ts`
- Create: `lib/server/generateFollowups.ts`
- Create: `lib/server/synthesizeUltimatePrompt.ts`
- Create: `app/api/analyze-question/route.ts`
- Create: `app/api/generate-followups/route.ts`
- Create: `app/api/synthesize-ultimate-prompt/route.ts`

- [ ] **Step 1: Write failing analyze service tests**

Create `tests/lib/server/analyzeQuestion.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { analyzeQuestion } from "@/lib/server/analyzeQuestion";

describe("analyzeQuestion service", () => {
  it("rejects too-short raw questions", async () => {
    const result = await analyzeQuestion({
      rawQuestion: "사업",
      apiKey: "sk-test",
      model: "gpt-5.5"
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain("질문이 너무 짧습니다");
  });

  it("returns structured analysis from the requester", async () => {
    const requestStructuredOutput = vi.fn().mockResolvedValue({
      primaryType: "strategy_business",
      secondaryTypes: ["idea_generation"],
      confidence: 0.9,
      surfaceQuestion: "사업성 질문",
      deeperIntent: "시장 가능성 판단",
      genericAnswerRisk: "일반론 위험",
      missingDimensions: ["고객", "경쟁자"],
      recommendedFollowupFocus: ["goal", "context"]
    });

    const result = await analyzeQuestion(
      {
        rawQuestion: "이 앱 아이디어가 사업성이 있을지 알고 싶어.",
        apiKey: "sk-test",
        model: "gpt-5.5"
      },
      requestStructuredOutput
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.primaryType).toBe("strategy_business");
  });

  it("falls back after requester failure", async () => {
    const requestStructuredOutput = vi.fn().mockRejectedValue(new Error("bad output"));

    const result = await analyzeQuestion(
      {
        rawQuestion: "이 앱 아이디어가 사업성이 있을지 알고 싶어.",
        apiKey: "sk-test",
        model: "gpt-5.5"
      },
      requestStructuredOutput
    );

    expect(requestStructuredOutput).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.primaryType).toBe("perspective_interpretation");
  });
});
```

- [ ] **Step 2: Run analyze tests and verify they fail**

Run:

```powershell
npm test -- tests/lib/server/analyzeQuestion.test.ts
```

Expected: FAIL because `@/lib/server/analyzeQuestion` does not exist.

- [ ] **Step 3: Implement analyze service and route**

Create `lib/server/analyzeQuestion.ts`:

```ts
import { buildAnalyzeQuestionPrompt } from "../prompts/analyzeQuestion";
import { questionAnalysisJsonSchema } from "../openaiSchemas";
import { requestStructuredOutput, type RequestStructuredOutputInput } from "../llm";
import { analyzeQuestionRequestSchema, questionAnalysisSchema, type AnalyzeQuestionRequest, type QuestionAnalysis } from "../types";

type ServiceResult<T> = { ok: true; data: T } | { ok: false; error: string; status: number };

type StructuredRequester = (input: RequestStructuredOutputInput<any>) => Promise<any>;

const fallbackAnalysis: QuestionAnalysis = {
  primaryType: "perspective_interpretation",
  secondaryTypes: [],
  confidence: 0.5,
  surfaceQuestion: "사용자의 질문을 더 깊게 해석해야 합니다.",
  deeperIntent: "사용자는 표면적인 답변보다 맥락과 관점이 포함된 답변을 얻고 싶어합니다.",
  genericAnswerRisk: "맥락, 목표, 긴장 지점이 없으면 일반적인 답변으로 흐를 수 있습니다.",
  missingDimensions: ["목표", "맥락", "이미 알고 있는 일반론", "숨은 가정", "검증 방식"],
  recommendedFollowupFocus: ["goal", "context", "known_or_excluded", "tension_or_assumption", "output_or_validation"]
};

export async function analyzeQuestion(
  input: unknown,
  structuredRequester: StructuredRequester = requestStructuredOutput
): Promise<ServiceResult<QuestionAnalysis>> {
  const parsed = analyzeQuestionRequestSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요.", status: 400 };
  }

  const request: AnalyzeQuestionRequest = parsed.data;
  const prompt = buildAnalyzeQuestionPrompt(request.rawQuestion);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const data = await structuredRequester({
        apiKey: request.apiKey,
        model: request.model,
        prompt: attempt === 0 ? prompt : `${prompt}\n\n이전 응답은 유효한 JSON이 아니었다. 스키마에 맞는 JSON만 출력하라.`,
        schemaName: "question_analysis",
        jsonSchema: questionAnalysisJsonSchema,
        schema: questionAnalysisSchema
      });
      return { ok: true, data };
    } catch {
      continue;
    }
  }

  return { ok: true, data: fallbackAnalysis };
}
```

Create `app/api/analyze-question/route.ts`:

```ts
import { NextResponse } from "next/server";
import { analyzeQuestion } from "@/lib/server/analyzeQuestion";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await analyzeQuestion(body);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data);
}
```

- [ ] **Step 4: Verify analyze tests pass**

Run:

```powershell
npm test -- tests/lib/server/analyzeQuestion.test.ts
```

Expected: PASS.

- [ ] **Step 5: Write failing follow-up and synthesis service tests**

Create `tests/lib/server/generateFollowups.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { generateFollowups } from "@/lib/server/generateFollowups";

describe("generateFollowups service", () => {
  it("returns five strategy business questions", async () => {
    const result = await generateFollowups({ primaryType: "strategy_business" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.followupQuestions).toHaveLength(5);
      expect(result.data.followupQuestions[0].purpose).toBe("goal");
    }
  });

  it("rejects unknown primary types", async () => {
    const result = await generateFollowups({ primaryType: "unknown" });

    expect(result.ok).toBe(false);
  });
});
```

Create `tests/lib/server/synthesizeUltimatePrompt.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { synthesizeUltimatePrompt } from "@/lib/server/synthesizeUltimatePrompt";

const validInput = {
  rawQuestion: "AI로 질문을 더 잘 만들게 도와주는 앱을 만들고 싶어.",
  apiKey: "sk-test",
  model: "gpt-5.5",
  analysis: {
    primaryType: "strategy_business",
    secondaryTypes: ["idea_generation"],
    confidence: 0.9,
    surfaceQuestion: "사업성 질문",
    deeperIntent: "시장 가능성과 실패 가능성을 알고 싶어한다.",
    genericAnswerRisk: "일반적인 장단점으로 흐를 수 있다.",
    missingDimensions: ["고객", "경쟁자"],
    recommendedFollowupFocus: ["goal", "context"]
  },
  followupAnswers: [
    { purpose: "goal", question: "목표", answer: "시장 검증에 쓰고 싶다." },
    { purpose: "context", question: "맥락", answer: "초기 MVP를 만들고 있다." },
    { purpose: "known_or_excluded", question: "제외", answer: "일반적인 조언은 제외한다." },
    { purpose: "tension_or_assumption", question: "긴장", answer: "사용자가 돈을 낼지 모르겠다." },
    { purpose: "output_or_validation", question: "출력", answer: "30일 검증 실험으로 받고 싶다." }
  ]
} as const;

describe("synthesizeUltimatePrompt service", () => {
  it("adds rule-based score to structured model output", async () => {
    const requestStructuredOutput = vi.fn().mockResolvedValue({
      shortVersion: "숨은 가정과 관점 충돌, 반박, 실행/검증 방법을 중심으로 분석해줘.",
      deepVersion: "긴장/충돌과 관점 충돌을 분석하고 네 결론을 반박한 뒤 추상화와 구체적 실행을 연결해줘.",
      expertVersion: "숨은 가정, 통념 반박, 자기반박, 추상/구체 왕복, 실행/검증 실험을 포함해줘.",
      whyThisPromptIsStrong: ["일반론을 제외하고 사고 장치를 강제한다."],
      improvementSuggestions: []
    });

    const result = await synthesizeUltimatePrompt(validInput, requestStructuredOutput);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.deepVersion).toContain("관점 충돌");
      expect(result.data.qualityScore.total).toBeGreaterThan(70);
    }
  });

  it("returns an error after two synthesis failures", async () => {
    const requestStructuredOutput = vi.fn().mockRejectedValue(new Error("bad output"));
    const result = await synthesizeUltimatePrompt(validInput, requestStructuredOutput);

    expect(requestStructuredOutput).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("궁극 질문 생성에 실패했습니다");
  });
});
```

- [ ] **Step 6: Run follow-up and synthesis tests and verify they fail**

Run:

```powershell
npm test -- tests/lib/server/generateFollowups.test.ts tests/lib/server/synthesizeUltimatePrompt.test.ts
```

Expected: FAIL because service files do not exist.

- [ ] **Step 7: Implement follow-up and synthesis services plus routes**

Create `lib/server/generateFollowups.ts`:

```ts
import { getFollowupQuestions } from "../followupTemplates";
import { generateFollowupsRequestSchema } from "../types";

type ServiceResult<T> = { ok: true; data: T } | { ok: false; error: string; status: number };

export async function generateFollowups(input: unknown): Promise<ServiceResult<{ followupQuestions: ReturnType<typeof getFollowupQuestions> }>> {
  const parsed = generateFollowupsRequestSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: "질문 유형을 확인해주세요.", status: 400 };
  }

  return { ok: true, data: { followupQuestions: getFollowupQuestions(parsed.data.primaryType) } };
}
```

Create `lib/server/synthesizeUltimatePrompt.ts`:

```ts
import { requestStructuredOutput, type RequestStructuredOutputInput } from "../llm";
import { ultimatePromptResultJsonSchema } from "../openaiSchemas";
import { buildSynthesizeUltimatePrompt } from "../prompts/synthesizeUltimatePrompt";
import { buildImprovementSuggestions, calculateQualityScore } from "../qualityScore";
import { synthesizePromptRequestSchema, ultimatePromptResultSchema, type UltimatePromptResult } from "../types";

type ServiceResult<T> = { ok: true; data: T } | { ok: false; error: string; status: number };
type StructuredRequester = (input: RequestStructuredOutputInput<any>) => Promise<any>;

const modelOutputSchema = ultimatePromptResultSchema.omit({ qualityScore: true });

export async function synthesizeUltimatePrompt(
  input: unknown,
  structuredRequester: StructuredRequester = requestStructuredOutput
): Promise<ServiceResult<UltimatePromptResult>> {
  const parsed = synthesizePromptRequestSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요.", status: 400 };
  }

  const request = parsed.data;
  const prompt = buildSynthesizeUltimatePrompt(request);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const modelResult = await structuredRequester({
        apiKey: request.apiKey,
        model: request.model,
        prompt: attempt === 0 ? prompt : `${prompt}\n\n이전 응답은 유효한 JSON이 아니었다. 스키마에 맞는 JSON만 출력하라.`,
        schemaName: "ultimate_prompt_result",
        jsonSchema: ultimatePromptResultJsonSchema,
        schema: modelOutputSchema
      });
      const qualityScore = calculateQualityScore({
        promptText: `${modelResult.shortVersion}\n${modelResult.deepVersion}\n${modelResult.expertVersion}`,
        followupAnswers: request.followupAnswers
      });
      return {
        ok: true,
        data: {
          ...modelResult,
          qualityScore,
          improvementSuggestions: [
            ...modelResult.improvementSuggestions,
            ...buildImprovementSuggestions(qualityScore)
          ]
        }
      };
    } catch {
      continue;
    }
  }

  return { ok: false, error: "궁극 질문 생성에 실패했습니다. 잠시 후 다시 시도해주세요.", status: 502 };
}
```

Create `app/api/generate-followups/route.ts`:

```ts
import { NextResponse } from "next/server";
import { generateFollowups } from "@/lib/server/generateFollowups";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await generateFollowups(body);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data);
}
```

Create `app/api/synthesize-ultimate-prompt/route.ts`:

```ts
import { NextResponse } from "next/server";
import { synthesizeUltimatePrompt } from "@/lib/server/synthesizeUltimatePrompt";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await synthesizeUltimatePrompt(body);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data);
}
```

- [ ] **Step 8: Verify all server tests pass**

Run:

```powershell
npm test -- tests/lib/server/analyzeQuestion.test.ts tests/lib/server/generateFollowups.test.ts tests/lib/server/synthesizeUltimatePrompt.test.ts
```

Expected: PASS.

- [ ] **Step 9: Commit**

```powershell
git add lib/server app/api tests/lib/server
git commit -m "feat: add api services"
```

---

## Task 7: UI Components

**Files:**

- Create: `tests/components/ApiKeyMenu.test.tsx`
- Create: `tests/components/CopyButton.test.tsx`
- Create: `tests/components/FollowupForm.test.tsx`
- Create: `components/ApiKeyMenu.tsx`
- Create: `components/QuestionInput.tsx`
- Create: `components/AnalysisCard.tsx`
- Create: `components/TypeSelector.tsx`
- Create: `components/FollowupForm.tsx`
- Create: `components/CopyButton.tsx`
- Create: `components/PromptCard.tsx`
- Create: `components/ResultTabs.tsx`
- Create: `components/QualityScoreCard.tsx`

- [ ] **Step 1: Write failing component tests**

Create `tests/components/ApiKeyMenu.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ApiKeyMenu } from "@/components/ApiKeyMenu";

describe("ApiKeyMenu", () => {
  it("saves the API key through callback without rendering the secret", async () => {
    const user = userEvent.setup();
    const onApiKeyChange = vi.fn();

    render(<ApiKeyMenu apiKey="" model="gpt-5.5" onApiKeyChange={onApiKeyChange} onModelChange={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /API 키/ }));
    await user.type(screen.getByLabelText("OpenAI API 키"), "sk-secret");
    await user.click(screen.getByRole("button", { name: "적용" }));

    expect(onApiKeyChange).toHaveBeenCalledWith("sk-secret");
    expect(screen.queryByText("sk-secret")).not.toBeInTheDocument();
  });
});
```

Create `tests/components/CopyButton.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CopyButton } from "@/components/CopyButton";

describe("CopyButton", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });
  });

  it("copies text and shows feedback", async () => {
    const user = userEvent.setup();
    render(<CopyButton text="복사할 프롬프트" />);

    await user.click(screen.getByRole("button", { name: "복사" }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("복사할 프롬프트");
    expect(screen.getByRole("button", { name: "복사됨" })).toBeInTheDocument();
  });
});
```

Create `tests/components/FollowupForm.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FollowupForm } from "@/components/FollowupForm";

const questions = [
  { id: "goal", purpose: "goal", question: "목표는 무엇인가요?" },
  { id: "context", purpose: "context", question: "맥락은 무엇인가요?" },
  { id: "known_or_excluded", purpose: "known_or_excluded", question: "제외할 답변은 무엇인가요?" },
  { id: "tension_or_assumption", purpose: "tension_or_assumption", question: "긴장은 무엇인가요?" },
  { id: "output_or_validation", purpose: "output_or_validation", question: "출력은 무엇인가요?" }
] as const;

describe("FollowupForm", () => {
  it("collects answers and submits all five purposes", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<FollowupForm questions={[...questions]} initialAnswers={{}} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("목표"), "시장 검증");
    await user.click(screen.getByRole("button", { name: "궁극 질문 만들기" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ purpose: "goal", answer: "시장 검증" }),
        expect.objectContaining({ purpose: "context", answer: "" })
      ])
    );
    expect(screen.getByText("목표와 맥락이 비어 있으면 결과가 약해질 수 있습니다.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run component tests and verify they fail**

Run:

```powershell
npm test -- tests/components/ApiKeyMenu.test.tsx tests/components/CopyButton.test.tsx tests/components/FollowupForm.test.tsx
```

Expected: FAIL because components do not exist.

- [ ] **Step 3: Implement component files**

Create the components with these interfaces:

```tsx
// components/ApiKeyMenu.tsx
"use client";

import { KeyRound } from "lucide-react";
import { useState } from "react";

type ApiKeyMenuProps = {
  apiKey: string;
  model: string;
  onApiKeyChange: (value: string) => void;
  onModelChange: (value: string) => void;
};

export function ApiKeyMenu({ apiKey, model, onApiKeyChange, onModelChange }: ApiKeyMenuProps) {
  const [open, setOpen] = useState(false);
  const [draftKey, setDraftKey] = useState("");

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm"
      >
        <KeyRound size={16} />
        {apiKey ? "API 키 설정됨" : "API 키"}
      </button>
      {open ? (
        <div className="absolute right-0 z-10 mt-2 w-80 rounded-lg border border-line bg-white p-4 shadow-xl">
          <label className="block text-sm font-medium" htmlFor="api-key-input">OpenAI API 키</label>
          <input
            id="api-key-input"
            aria-label="OpenAI API 키"
            type="password"
            value={draftKey}
            onChange={(event) => setDraftKey(event.target.value)}
            className="mt-2 w-full rounded-md border border-line px-3 py-2"
            placeholder="sk-..."
          />
          <label className="mt-4 block text-sm font-medium" htmlFor="model-input">모델</label>
          <input
            id="model-input"
            value={model}
            onChange={(event) => onModelChange(event.target.value)}
            className="mt-2 w-full rounded-md border border-line px-3 py-2"
          />
          <p className="mt-3 text-xs text-gray-500">키는 현재 탭 메모리에만 유지되며 새로고침하면 사라집니다.</p>
          <button
            type="button"
            onClick={() => {
              onApiKeyChange(draftKey.trim());
              setDraftKey("");
              setOpen(false);
            }}
            className="mt-4 w-full rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white"
          >
            적용
          </button>
        </div>
      ) : null}
    </div>
  );
}
```

Implement the remaining components with these exported names and prop contracts:

```ts
// components/QuestionInput.tsx
export type QuestionInputProps = {
  rawQuestion: string;
  disabled: boolean;
  error?: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};
export function QuestionInput(props: QuestionInputProps): JSX.Element;

// components/AnalysisCard.tsx
export type AnalysisCardProps = {
  analysis: QuestionAnalysis;
  selectedType: QuestionType;
  onTypeChange: (type: QuestionType) => void;
  onContinue: () => void;
};
export function AnalysisCard(props: AnalysisCardProps): JSX.Element;

// components/TypeSelector.tsx
export type TypeSelectorProps = {
  value: QuestionType;
  onChange: (type: QuestionType) => void;
};
export function TypeSelector(props: TypeSelectorProps): JSX.Element;

// components/FollowupForm.tsx
export type FollowupFormProps = {
  questions: FollowupQuestion[];
  initialAnswers: Partial<Record<FollowupPurpose, string>>;
  onSubmit: (answers: FollowupAnswer[]) => void;
};
export function FollowupForm(props: FollowupFormProps): JSX.Element;

// components/CopyButton.tsx
export function CopyButton({ text }: { text: string }): JSX.Element;

// components/PromptCard.tsx
export function PromptCard({ title, text }: { title: string; text: string }): JSX.Element;

// components/ResultTabs.tsx
export function ResultTabs({ result }: { result: UltimatePromptResult }): JSX.Element;

// components/QualityScoreCard.tsx
export function QualityScoreCard({ result }: { result: UltimatePromptResult }): JSX.Element;
```

For `CopyButton`, use `navigator.clipboard.writeText(text)` and show button label `복사됨` after success. For `FollowupForm`, render textareas with labels from `FOLLOWUP_PURPOSE_LABELS`, submit five answers in question order, and render the warning `목표와 맥락이 비어 있으면 결과가 약해질 수 있습니다.` when either `goal` or `context` is empty at submit time.

Component behavior requirements:

- `QuestionInput` renders a textarea labeled `AI에게 묻고 싶은 질문`, placeholder examples from the PRD, an error line when `error` is present, and a submit button labeled `질문 분석하기`.
- `QuestionInput` shows `API 키를 먼저 입력하면 분석을 시작할 수 있습니다.` when `disabled` is true.
- `AnalysisCard` renders `질문 유형`, `보조 유형`, `깊은 의도`, `평범한 답변으로 흐를 위험`, missing dimensions, a `TypeSelector`, and a button labeled `후속 질문 답하기`.
- `TypeSelector` renders a native `select` with all ten `QUESTION_TYPE_LABELS` so keyboard users can change the primary type.
- `PromptCard` renders the prompt text in a `pre` element with `whitespace-pre-wrap` and includes a `CopyButton`.
- `ResultTabs` starts on `깊은 분석 버전`, offers tab buttons `짧은 버전`, `깊은 분석 버전`, `전문가 버전`, and renders one `PromptCard` at a time.
- `QualityScoreCard` renders `질문 품질 점수`, the numeric total, `whyThisPromptIsStrong`, and `improvementSuggestions`.

- [ ] **Step 4: Verify component tests pass**

Run:

```powershell
npm test -- tests/components/ApiKeyMenu.test.tsx tests/components/CopyButton.test.tsx tests/components/FollowupForm.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add components tests/components
git commit -m "feat: add workspace components"
```

---

## Task 8: Main Page Flow

**Files:**

- Create: `tests/app/page.test.tsx`
- Create: `app/page.tsx`

- [ ] **Step 1: Write failing four-step flow test**

Create `tests/app/page.test.tsx`:

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Page from "@/app/page";

describe("main page flow", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.includes("/api/analyze-question")) {
        return new Response(JSON.stringify({
          primaryType: "strategy_business",
          secondaryTypes: ["idea_generation", "critique_risk"],
          confidence: 0.86,
          surfaceQuestion: "사업성 질문",
          deeperIntent: "시장 가능성과 실패 가능성을 알고 싶어한다.",
          genericAnswerRisk: "일반적인 장단점으로 흐를 수 있다.",
          missingDimensions: ["고객", "경쟁자"],
          recommendedFollowupFocus: ["goal", "context"]
        }), { status: 200 });
      }

      if (url.includes("/api/synthesize-ultimate-prompt")) {
        return new Response(JSON.stringify({
          shortVersion: "짧은 버전",
          deepVersion: "깊은 분석 버전",
          expertVersion: "전문가 버전",
          whyThisPromptIsStrong: ["숨은 가정을 요구한다."],
          qualityScore: {
            total: 90,
            context: 15,
            goal: 15,
            knownExclusions: 10,
            tension: 20,
            perspectiveCollision: 15,
            selfRefutation: 10,
            outputClarity: 5
          },
          improvementSuggestions: ["검증 방식을 더 구체화하세요."]
        }), { status: 200 });
      }

      return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
    }));
  });

  it("lets a user enter a key, analyze a question, answer followups, and see results", async () => {
    const user = userEvent.setup();
    render(<Page />);

    await user.click(screen.getByRole("button", { name: /API 키/ }));
    await user.type(screen.getByLabelText("OpenAI API 키"), "sk-test");
    await user.click(screen.getByRole("button", { name: "적용" }));

    await user.type(screen.getByLabelText("AI에게 묻고 싶은 질문"), "AI 질문 생성 앱의 사업성이 있을지 알고 싶어.");
    await user.click(screen.getByRole("button", { name: "질문 분석하기" }));

    expect(await screen.findByText("시장 가능성과 실패 가능성을 알고 싶어한다.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "후속 질문 답하기" }));

    await user.type(screen.getByLabelText("목표"), "시장 검증");
    await user.type(screen.getByLabelText("맥락"), "MVP 단계");
    await user.click(screen.getByRole("button", { name: "궁극 질문 만들기" }));

    await waitFor(() => expect(screen.getByText("깊은 분석 버전")).toBeInTheDocument());
    expect(screen.getByText("질문 품질 점수")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run page test and verify it fails**

Run:

```powershell
npm test -- tests/app/page.test.tsx
```

Expected: FAIL because `app/page.tsx` does not implement the flow.

- [ ] **Step 3: Implement the page flow**

Create `app/page.tsx` as a client component that:

- Holds `apiKey`, `model`, `step`, `rawQuestion`, `analysis`, `selectedType`, `followupQuestions`, `followupAnswers`, `result`, `error`, and `loading` in React state.
- Uses `DEFAULT_MODEL` for initial model.
- Blocks analysis when `apiKey` is empty with `OpenAI API 키를 먼저 입력해주세요.`
- Calls `/api/analyze-question` with `{ rawQuestion, apiKey, model }`.
- Calls `getFollowupQuestions(analysis.primaryType)` after analysis succeeds.
- Refreshes `followupQuestions` through `getFollowupQuestions(type)` when the user changes type.
- Calls `/api/synthesize-ultimate-prompt` with `{ rawQuestion, apiKey, model, analysis, followupAnswers }`.
- Renders `QuestionInput`, `AnalysisCard`, `FollowupForm`, and `ResultTabs` according to `step`.
- Renders a restart button labeled `처음부터 다시 만들기` after results.

Use this helper inside the page:

```ts
async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "요청에 실패했습니다.");
  }

  return data as T;
}
```

- [ ] **Step 4: Verify page test passes**

Run:

```powershell
npm test -- tests/app/page.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add app/page.tsx tests/app/page.test.tsx
git commit -m "feat: wire main question builder flow"
```

---

## Task 9: Verification, Build, And Browser QA

**Files:**

- Modify: files changed in prior tasks only when verification finds a concrete defect.

- [ ] **Step 1: Run the full automated suite**

Run:

```powershell
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Run TypeScript**

Run:

```powershell
npm run typecheck
```

Expected: TypeScript exits with code `0`.

- [ ] **Step 3: Run production build**

Run:

```powershell
npm run build
```

Expected: Next.js build exits with code `0`.

- [ ] **Step 4: Start local dev server**

Run:

```powershell
npm run dev
```

Expected: dev server prints a localhost URL, usually `http://localhost:3000`.

- [ ] **Step 5: Browser QA**

Open the local URL and verify:

- Desktop width: the header, API key menu, step workspace, and result tabs do not overlap.
- Mobile width: controls wrap cleanly, textareas remain usable, and tab labels stay readable.
- With no API key: `질문 분석하기` does not call the API and shows `OpenAI API 키를 먼저 입력해주세요.`
- With a test-shaped key and mocked API disabled: invalid key errors show a Korean message.
- Copy button changes to `복사됨` after clicking.

- [ ] **Step 6: Fix concrete verification defects with TDD**

For each defect found:

1. Write a failing unit or component test that reproduces the defect.
2. Run that test and verify it fails for the defect.
3. Implement the smallest fix.
4. Run the specific test and the full affected suite.

- [ ] **Step 7: Final commit**

```powershell
git status --short
git add .
git commit -m "chore: verify ultimate question builder"
```

Skip this commit when `git status --short` is empty after verification.

---

## Self-Review Checklist

- The plan implements the approved four-step workspace.
- The plan implements user-entered OpenAI API keys with in-memory storage only.
- The plan uses server-side API routes for OpenAI calls.
- The plan uses `gpt-5.5` as the default model.
- The plan uses Responses API Structured Outputs through `text.format`.
- The plan covers all ten question types and five follow-up purposes.
- The plan covers analysis, follow-up generation, synthesis, quality score, copy action, and restart.
- The plan has tests before production code for domain logic, server services, and UI behavior.
- The plan includes verification commands for tests, typecheck, build, and browser QA.
