"use client";

import { useEffect, useState } from "react";
import { ApiKeyMenu } from "@/components/ApiKeyMenu";
import { FollowupForm } from "@/components/FollowupForm";
import { QuestionInput } from "@/components/QuestionInput";
import { ResultTabs } from "@/components/ResultTabs";
import { DEFAULT_MODEL, type DirectionSetting, type FollowupAnswer, type FollowupQuestion, type QuestionAnalysis, type QuestionTypeOption, type UltimatePromptResult } from "@/lib/types";
import type { FollowupPurpose, QuestionType } from "@/lib/questionTypes";

type Step = "question" | "followups" | "result";
const API_KEY_STORAGE_KEY = "ultimate-question-builder:openai-api-key";

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

const stepLabels: Record<Step, string> = {
  question: "질문 입력",
  followups: "후속 답변",
  result: "결과"
};

function createDirectionSettings(analysis: QuestionAnalysis): DirectionSetting[] {
  const seen = new Set<QuestionType>();
  const options: QuestionTypeOption[] = [];
  const push = (option: QuestionTypeOption) => {
    if (seen.has(option.type) || options.length >= 3) return;
    seen.add(option.type);
    options.push(option);
  };

  analysis.recommendedTypeOptions.forEach(push);
  push({ type: analysis.primaryType, reason: "AI가 가장 잘 맞는 방향으로 봤어요." });
  analysis.secondaryTypes.forEach((type) => push({ type, reason: "이 방향도 함께 생각해볼 만해요." }));

  return options.map((option, index) => ({
    ...option,
    weight: option.type === analysis.primaryType ? 80 : index === 1 ? 45 : 30
  }));
}

function readStoredApiKey() {
  try {
    return window.localStorage.getItem(API_KEY_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function saveStoredApiKey(value: string) {
  try {
    if (value) {
      window.localStorage.setItem(API_KEY_STORAGE_KEY, value);
    } else {
      window.localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  } catch {
    // Some browsers can block localStorage; the in-memory key still works.
  }
}

export default function Page() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [step, setStep] = useState<Step>("question");
  const [rawQuestion, setRawQuestion] = useState("");
  const [analysis, setAnalysis] = useState<QuestionAnalysis | null>(null);
  const [directionSettings, setDirectionSettings] = useState<DirectionSetting[]>([]);
  const [followupQuestions, setFollowupQuestions] = useState<FollowupQuestion[]>([]);
  const [followupAnswers, setFollowupAnswers] = useState<FollowupAnswer[]>([]);
  const [answerDrafts, setAnswerDrafts] = useState<Partial<Record<FollowupPurpose, string>>>({});
  const [result, setResult] = useState<UltimatePromptResult | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedApiKey = readStoredApiKey();
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setError(undefined);
    }
  }, []);

  const updateApiKey = (value: string) => {
    const nextApiKey = value.trim();
    setApiKey(nextApiKey);
    saveStoredApiKey(nextApiKey);
    if (nextApiKey) {
      setError(undefined);
    }
  };

  const analyze = async () => {
    if (!apiKey) {
      setError("OpenAI API 키를 먼저 입력해주세요.");
      return;
    }

    setError(undefined);
    setLoading(true);
    try {
      const data = await postJson<QuestionAnalysis>("/api/analyze-question", { rawQuestion, apiKey, model });
      setAnalysis(data);
      setDirectionSettings(createDirectionSettings(data));
      setFollowupQuestions(data.followupQuestions);
      setStep("followups");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "분석에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const synthesize = async (answers: FollowupAnswer[], settings: DirectionSetting[]) => {
    if (!analysis) return;
    if (!apiKey) {
      setError("OpenAI API 키를 먼저 입력해주세요.");
      return;
    }

    setFollowupAnswers(answers);
    setAnswerDrafts(Object.fromEntries(answers.map((item) => [item.purpose, item.answer])) as Partial<Record<FollowupPurpose, string>>);
    setError(undefined);
    setLoading(true);
    try {
      const data = await postJson<UltimatePromptResult>("/api/synthesize-ultimate-prompt", {
        rawQuestion,
        apiKey,
        model,
        analysis,
        directionSettings: settings,
        followupAnswers: answers
      });
      setResult(data);
      setStep("result");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "궁극 질문 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("question");
    setRawQuestion("");
    setAnalysis(null);
    setDirectionSettings([]);
    setFollowupQuestions([]);
    setFollowupAnswers([]);
    setAnswerDrafts({});
    setResult(null);
    setError(undefined);
  };

  return (
    <main className="min-h-screen px-5 py-6 md:px-10">
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="text-sm font-semibold text-accent">Ultimate Question Builder</p>
          <p className="mt-1 text-sm text-gray-600">질문을 설계하는 작업대</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={reset} className="rounded-md border border-line bg-white px-3 py-2 text-sm">
            처음부터 다시 만들기
          </button>
          <ApiKeyMenu apiKey={apiKey} model={model} onApiKeyChange={updateApiKey} onModelChange={setModel} />
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 py-8 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-2">
          {(Object.keys(stepLabels) as Step[]).map((item, index) => {
            const activeIndex = (Object.keys(stepLabels) as Step[]).indexOf(step);
            const isActive = step === item;
            const isDone = index < activeIndex;
            return (
              <div
                key={item}
                className={`rounded-md border px-3 py-3 text-sm ${
                  isActive
                    ? "border-accent bg-white font-semibold text-accent"
                    : isDone
                      ? "border-line bg-white text-ink"
                      : "border-transparent text-gray-500"
                }`}
              >
                {index + 1}. {stepLabels[item]}
              </div>
            );
          })}
        </aside>

        <section className="rounded-lg border border-line bg-paper/70 p-5 md:p-8">
          {error ? <p className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

          {step === "question" ? (
            <QuestionInput
              rawQuestion={rawQuestion}
              disabled={!apiKey}
              error={error}
              loading={loading}
              onChange={setRawQuestion}
              onSubmit={analyze}
            />
          ) : null}

          {step === "followups" ? (
            <FollowupForm
              questions={followupQuestions}
              directionSettings={directionSettings}
              initialAnswers={answerDrafts}
              loading={loading}
              onSubmit={synthesize}
            />
          ) : null}

          {step === "result" && result ? (
            <div className="space-y-6">
              <ResultTabs result={result} />
              <button type="button" onClick={reset} className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold">
                처음부터 다시 만들기
              </button>
            </div>
          ) : null}

          {followupAnswers.length > 0 && step === "followups" ? (
            <p className="mt-4 text-xs text-gray-500">{followupAnswers.length}개의 답변이 임시 보관되어 있습니다.</p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
