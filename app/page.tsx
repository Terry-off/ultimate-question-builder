"use client";

import { useEffect, useState, type WheelEvent } from "react";
import { ApiKeyMenu } from "@/components/ApiKeyMenu";
import { FollowupForm } from "@/components/FollowupForm";
import { LoadingLayer } from "@/components/LoadingLayer";
import { QuestionInput } from "@/components/QuestionInput";
import { ResultModal, type ResultRefineRequest } from "@/components/ResultModal";
import { API_KEY_STORAGE_KEY, STORED_API_KEY_SENTINEL, isSharedApiKeyPersistenceEnabled } from "@/lib/apiKeyShared";
import { DEFAULT_MODEL, type DirectionSetting, type FollowupAnswer, type FollowupQuestion, type QuestionAnalysis, type QuestionTypeOption, type UltimatePromptResult } from "@/lib/types";
import type { QuestionType } from "@/lib/questionTypes";

const SPLINE_URL = "https://my.spline.design/nexbotrobotcharacterconcept-Gzlk5cCKXuRUpeFXKYo5NQa8/";

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
    const storedApiKey = window.localStorage.getItem(API_KEY_STORAGE_KEY)?.trim() ?? "";
    return storedApiKey === STORED_API_KEY_SENTINEL ? "" : storedApiKey;
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

async function readServerApiKeyState() {
  if (!isSharedApiKeyPersistenceEnabled()) return false;

  const response = await fetch("/api/api-key");
  if (!response.ok) return false;
  const data = await response.json();
  return Boolean(data.hasApiKey);
}

async function saveServerApiKey(value: string) {
  if (!isSharedApiKeyPersistenceEnabled()) return;

  await fetch("/api/api-key", {
    method: value ? "POST" : "DELETE",
    headers: { "Content-Type": "application/json" },
    body: value ? JSON.stringify({ apiKey: value }) : undefined
  });
}

export default function Page() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [splineReady, setSplineReady] = useState(false);
  const [stageZoom, setStageZoom] = useState(1);
  const [rawQuestion, setRawQuestion] = useState("");
  const [analysis, setAnalysis] = useState<QuestionAnalysis | null>(null);
  const [directionSettings, setDirectionSettings] = useState<DirectionSetting[]>([]);
  const [followupQuestions, setFollowupQuestions] = useState<FollowupQuestion[]>([]);
  const [followupAnswers, setFollowupAnswers] = useState<FollowupAnswer[]>([]);
  const [answerDrafts, setAnswerDrafts] = useState<Partial<Record<string, string>>>({});
  const [result, setResult] = useState<UltimatePromptResult | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const isAnalyzingQuestion = loading && !analysis;
  const isBuildingPrompt = loading && Boolean(analysis);
  const shellClassName = [
    "experience-shell",
    isAnalyzingQuestion ? "is-analyzing" : "",
    analysis ? "has-followups" : "",
    isBuildingPrompt ? "is-building" : ""
  ].filter(Boolean).join(" ");

  useEffect(() => {
    const storedApiKey = readStoredApiKey();
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setError(undefined);
      void saveServerApiKey(storedApiKey).catch(() => undefined);
      return;
    }

    void readServerApiKeyState()
      .then((hasApiKey) => {
        if (hasApiKey) {
          setApiKey(STORED_API_KEY_SENTINEL);
          setError(undefined);
        }
      })
      .catch(() => undefined);
  }, []);

  const updateApiKey = (value: string) => {
    const nextApiKey = value.trim();
    setApiKey(nextApiKey);
    saveStoredApiKey(nextApiKey);
    void saveServerApiKey(nextApiKey).catch(() => undefined);
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
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "분석에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const synthesize = async (answers: FollowupAnswer[], settings: DirectionSetting[], revision?: ResultRefineRequest) => {
    if (!analysis) return;
    if (!apiKey) {
      setError("OpenAI API 키를 먼저 입력해주세요.");
      return;
    }

    setFollowupAnswers(answers);
    setAnswerDrafts(Object.fromEntries(answers.map((item) => [item.id, item.answer])));
    setError(undefined);
    setLoading(true);
    try {
      const data = await postJson<UltimatePromptResult>("/api/synthesize-ultimate-prompt", {
        rawQuestion,
        apiKey,
        model,
        analysis,
        directionSettings: settings,
        followupAnswers: answers,
        revision
      });
      setResult(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "궁극 질문 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setRawQuestion("");
    setAnalysis(null);
    setDirectionSettings([]);
    setFollowupQuestions([]);
    setFollowupAnswers([]);
    setAnswerDrafts({});
    setResult(null);
    setError(undefined);
  };

  const adjustRobotZoom = (event: WheelEvent<HTMLElement>) => {
    if (analysis || loading) return;

    event.preventDefault();
    const direction = event.deltaY < 0 ? 0.08 : -0.08;
    setStageZoom((current) => Math.min(1.28, Math.max(0.88, Math.round((current + direction) * 100) / 100)));
  };

  return (
    <main className={shellClassName}>
      <header className="site-topbar">
        <div className="topbar-actions">
          {(rawQuestion || analysis || result) ? (
            <button type="button" onClick={reset} className="ghost-action">
              새 질문
            </button>
          ) : null}
          <ApiKeyMenu apiKey={apiKey} model={model} onApiKeyChange={updateApiKey} onModelChange={setModel} />
        </div>
      </header>

      <section className="hero-stage" aria-label="첫 질문 입력">
        <div className="spline-frame" style={!analysis && !loading ? { transform: `scale(${stageZoom})` } : undefined}>
          <iframe
            title="NEXBOT robot animation"
            src={SPLINE_URL}
            frameBorder="0"
            allow="autoplay; fullscreen; xr-spatial-tracking"
            onLoad={() => setSplineReady(true)}
            onError={() => setSplineReady(false)}
            className={`spline-embed ${splineReady ? "spline-embed-ready" : ""}`}
          />
        </div>
        {!analysis && !loading ? <div className="robot-wheel-layer" aria-hidden="true" onWheel={adjustRobotZoom} /> : null}
        {!analysis && !loading ? (
          <div className="hero-input-layer">
            <QuestionInput
              rawQuestion={rawQuestion}
              error={error}
              loading={loading}
              onChange={setRawQuestion}
              onSubmit={analyze}
            />
          </div>
        ) : null}
      </section>

      {loading ? <LoadingLayer mode={analysis ? "synthesize" : "analyze"} question={rawQuestion} /> : null}

      {analysis && !result ? (
        <section className="followup-dock" aria-label="맞춤 후속 질문">
          <FollowupForm
            questions={followupQuestions}
            directionSettings={directionSettings}
            initialAnswers={answerDrafts}
            loading={loading}
            onSubmit={synthesize}
          />
        </section>
      ) : null}

      {result ? (
        <ResultModal
          result={result}
          loading={loading}
          onBackToFollowups={() => setResult(null)}
          onReset={reset}
          onRefine={(revision) => {
            void synthesize(followupAnswers, directionSettings, revision);
          }}
        />
      ) : null}
    </main>
  );
}
