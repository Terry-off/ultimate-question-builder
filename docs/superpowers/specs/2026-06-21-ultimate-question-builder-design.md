# Ultimate Question Builder Design

## Goal

Build a single-page Next.js MVP that turns an ordinary Korean question into three stronger AI prompts by analyzing the question type, collecting five targeted follow-up answers, and synthesizing prompts that force hidden assumptions, tension, perspective collision, self-refutation, abstraction/concretion, and verifiable action.

## Product Shape

The app uses a step-by-step workspace:

1. Question input
2. Analysis result
3. Five follow-up answers
4. Final prompt results

The UI should feel like a focused thinking workbench, not a chat app or marketing landing page. The user always sees the current step, the next action, and enough side context to understand why the app is asking for more detail.

## Confirmed Decisions

- Layout: step-by-step workspace.
- Language: Korean UI and Korean prompt output by default.
- LLM provider: OpenAI API.
- Model default: `gpt-5.5`.
- API surface: OpenAI Responses API.
- Output validation: Structured Outputs at the OpenAI request layer, then Zod validation inside the app.
- API key entry: user enters the key from a menu in the app.
- API key storage: keep only in current browser memory; do not persist to `localStorage`.
- Server execution: client sends the session key to Next.js API routes; API routes call OpenAI server-side.
- Excluded: login, DB, payment, team features, cloud history, prompt marketplace.

## Architecture

Use Next.js App Router with TypeScript and Tailwind CSS. The app is a client-heavy single page backed by three API routes.

Client responsibilities:

- Store the current session state in React state.
- Store the OpenAI API key only in memory.
- Render the step workspace.
- Let the user change the primary question type after analysis.
- Regenerate the five follow-up questions from local templates when the primary type changes.
- Show loading, validation, and API errors without losing the user's typed work.
- Do not persist session data in MVP except the generated non-secret final result after the user explicitly clicks a future save action. The initial implementation does not include that save action.

Server responsibilities:

- Validate request bodies with Zod.
- Enforce input length limits.
- Call OpenAI using the user-provided API key from the request.
- Request JSON-shaped model output with Structured Outputs.
- Validate returned JSON with Zod.
- Retry once if parsing or validation fails.
- Return a safe fallback analysis or synthesis error instead of crashing.

## Main Files

- `app/page.tsx`: main step workspace and session orchestration.
- `app/api/analyze-question/route.ts`: classify and analyze the raw question.
- `app/api/generate-followups/route.ts`: return five template-based follow-up questions for the selected type.
- `app/api/synthesize-ultimate-prompt/route.ts`: generate final prompt versions and quality metadata.
- `components/QuestionInput.tsx`: raw question input step.
- `components/AnalysisCard.tsx`: analysis summary and type controls.
- `components/TypeSelector.tsx`: primary question type selector.
- `components/FollowupForm.tsx`: five follow-up textareas.
- `components/ResultTabs.tsx`: short, deep, and expert prompt tabs.
- `components/PromptCard.tsx`: prompt display with copy action.
- `components/QualityScoreCard.tsx`: score, explanation, and suggestions.
- `components/ApiKeyMenu.tsx`: menu for API key and model selection.
- `components/CopyButton.tsx`: clipboard interaction and copied state.
- `lib/types.ts`: shared product types and Zod schemas.
- `lib/questionTypes.ts`: question type enum and labels.
- `lib/followupTemplates.ts`: five templates per question type.
- `lib/qualityScore.ts`: rule-based scoring and improvement suggestions.
- `lib/llm.ts`: OpenAI Responses API wrapper.
- `lib/json.ts`: strict JSON parse helpers used by API routes before Zod validation.
- `lib/prompts/analyzeQuestion.ts`: analysis prompt.
- `lib/prompts/synthesizeUltimatePrompt.ts`: final prompt synthesis prompt.

## Data Flow

1. User enters API key from the app menu. The key is held in React state only.
2. User enters a raw question. Client validates at least 10 characters.
3. Client calls `POST /api/analyze-question` with `{ rawQuestion, apiKey, model }`.
4. Server validates length, calls OpenAI Responses API, validates the structured output, and returns `QuestionAnalysis`.
5. Client displays analysis and generates follow-up questions for the primary type.
6. If the user changes the primary type, client calls `POST /api/generate-followups` or uses the same local templates to refresh the five questions.
7. User answers five follow-up fields. Empty answers are allowed; empty goal or context show a warning.
8. Client calls `POST /api/synthesize-ultimate-prompt` with `{ rawQuestion, analysis, followupAnswers, apiKey, model }`.
9. Server generates `shortVersion`, `deepVersion`, `expertVersion`, `whyThisPromptIsStrong`, and `improvementSuggestions`.
10. Server or client computes the rule-based `QualityScore`.
11. Client renders results with copy buttons and a restart action.

## API Key Handling

The key is never written to `localStorage`, cookies, logs, or generated result objects. It is passed from the browser to the app's own API routes only for the current request. API routes instantiate the OpenAI client with the provided key and never echo it back.

The menu should say that the key is kept only for the current tab session and will disappear on refresh. If no key is present, API-dependent buttons are disabled and show a concise Korean prompt to enter the key.

## OpenAI Usage

Use the Responses API because current OpenAI guidance recommends it for reasoning and structured output workflows. Use `gpt-5.5` by default, with the model configurable in the menu.

Use Structured Outputs through `text.format` so analysis and synthesis return predictable JSON. Zod remains the app-side guardrail.

OpenAI docs referenced:

- Latest model guidance: `https://developers.openai.com/api/docs/guides/latest-model.md`
- Responses API structured output migration: `https://developers.openai.com/api/docs/guides/migrate-to-responses#6-update-structured-outputs-definitions`

## Error Handling

Validation errors:

- Raw question under 10 characters: show `질문이 너무 짧습니다. AI에게 묻고 싶은 내용을 한 문장 이상으로 적어주세요.`
- Raw question over 3000 characters: show a clear length error.
- Follow-up answer over 3000 characters: show a clear length error near that field.

API errors:

- Missing API key: block request before calling the server.
- Invalid API key or OpenAI auth failure: show a Korean message asking the user to check the key.
- LLM output validation failure: retry once with a stricter JSON-only instruction.
- Analysis fallback: use `primaryType: "perspective_interpretation"`, `secondaryTypes: []`, `confidence: 0.5`, and safe Korean explanatory fields.
- Synthesis failure after retry: keep the follow-up answers on screen and show a retry action.

## Quality Score

Keep scoring rule-based in MVP. Score the generated prompt and follow-up answers across:

- context: 15
- goal: 15
- knownExclusions: 10
- tension: 20
- perspectiveCollision: 15
- selfRefutation: 10
- outputClarity: 15

The score message follows the PRD thresholds. Improvement suggestions should point to missing dimensions, especially weak goal/context, weak tension, missing validation method, or vague output format.

## UI Direction

Visual thesis: a quiet, precise Korean thinking workbench with strong typography, restrained surfaces, and one clear accent for progress and action.

Content plan:

- Header: product name, API key menu, model selector, restart.
- Main workspace: one active step at a time.
- Left or top progress rail: current step and completed states.
- Analysis step: type confidence, deeper intent, generic-answer risk, missing dimensions.
- Follow-up step: five labeled textareas with concise helper labels.
- Result step: tabs for three prompt versions plus quality score and copy actions.

Interaction thesis:

- Smooth step transitions after successful API calls.
- Copy buttons show immediate copied feedback.
- Type changes update follow-up questions with a small transition so the user notices the change.

## Testing Strategy

Use TDD for product logic and API behavior.

Unit tests:

- Question type labels and template coverage for all 10 types.
- Follow-up template count is exactly 5 per type and covers all purposes.
- Quality score rewards goal, context, known exclusions, tension, perspective collision, self-refutation, and output clarity.
- Zod schemas accept valid examples and reject malformed API results.

API tests:

- `analyze-question` rejects too-short input.
- `analyze-question` handles structured output and fallback.
- `generate-followups` returns the correct template for each primary type.
- `synthesize-ultimate-prompt` rejects oversized answers and returns all three versions.

UI checks:

- User can complete the four-step flow.
- Primary type changes refresh follow-up questions.
- Missing API key disables API calls.
- Copy buttons write the prompt text to clipboard.
- Layout works on desktop and mobile widths.

## Acceptance Criteria

- A user can enter an ordinary question and get an analysis.
- The analysis includes primary type, secondary types, deeper intent, and generic-answer risk.
- The primary type can be changed by the user.
- The five follow-up questions change by type.
- The user can answer all five follow-up questions.
- Final results include short, deep, and expert prompt versions.
- Final prompts include hidden assumptions, tension, perspective collision, convention refutation, self-refutation, abstraction/concretion, and execution or validation methods.
- Quality score and improvement suggestions are visible.
- Copy buttons work.
- The app does not break on LLM JSON or validation failures.
- API key is not persisted.

## Implementation Notes

The API key decision intentionally differs from the original PRD's environment-variable-only wording because the user explicitly requested in-app key entry. The adjusted design preserves the important security property: OpenAI calls still happen server-side and the key is not persisted.

When the app adds accounts or cloud history, API key handling must be redesigned before storing any user data.
