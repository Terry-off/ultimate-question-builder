"use client";

import { useEffect, useState } from "react";
import { ApiKeyMenu } from "@/components/ApiKeyMenu";
import { FollowupForm } from "@/components/FollowupForm";
import { HistoryMenu } from "@/components/HistoryMenu";
import { LoadingLayer } from "@/components/LoadingLayer";
import { MatrixClickEffect } from "@/components/MatrixClickEffect";
import { QuestionInput } from "@/components/QuestionInput";
import { ResultModal, type ResultRefineRequest } from "@/components/ResultModal";
import { STORED_API_KEY_SENTINEL } from "@/lib/apiKeyShared";
import { readServerApiKeyState, readStoredApiKey, saveServerApiKey, saveStoredApiKey, testApiKeyConnection } from "@/lib/clientApiKey";
import { createDirectionSettings } from "@/lib/directionSettings";
import { readStoredModel, readStoredProvider, saveStoredModel, saveStoredProvider } from "@/lib/modelPreference";
import { DEFAULT_PROVIDER, PROVIDER_API_KEY_LABELS, getDefaultModelForProvider, type ModelProviderId } from "@/lib/modelProviders";
import { postJson } from "@/lib/postJson";
import { createPromptHistoryEntry, readPromptHistory, removePromptHistoryEntry, upsertPromptHistory, writePromptHistory, type PromptHistoryEntry, type PromptHistorySnapshot } from "@/lib/promptHistory";
import { DEFAULT_MODEL, questionAnalysisSchema, ultimatePromptResultSchema, type DirectionSetting, type FollowupAnswer, type FollowupQuestion, type QuestionAnalysis, type UltimatePromptResult } from "@/lib/types";

type SynthesizeInput = {
  readonly answers: FollowupAnswer[];
  readonly settings: DirectionSetting[];
  readonly revision?: ResultRefineRequest;
  readonly sourceAnalysis?: QuestionAnalysis;
};

export default function Page() {
  const [provider, setProvider] = useState<ModelProviderId>(DEFAULT_PROVIDER);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [splineReady, setSplineReady] = useState(false);
  const [rawQuestion, setRawQuestion] = useState("");
  const [analysis, setAnalysis] = useState<QuestionAnalysis | null>(null);
  const [directionSettings, setDirectionSettings] = useState<DirectionSetting[]>([]);
  const [followupQuestions, setFollowupQuestions] = useState<FollowupQuestion[]>([]);
  const [answerDrafts, setAnswerDrafts] = useState<Partial<Record<string, string>>>({});
  const [result, setResult] = useState<UltimatePromptResult | null>(null);
  const [promptHistory, setPromptHistory] = useState<PromptHistoryEntry[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | undefined>();
  const [lastPromptSnapshot, setLastPromptSnapshot] = useState<PromptHistorySnapshot | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const isAnalyzingQuestion = loading && !analysis;
  const isBuildingPrompt = loading && Boolean(analysis);
  const isFirstScreen = !analysis && !loading;
  const shellClassName = [
    "experience-shell",
    isAnalyzingQuestion ? "is-analyzing" : "",
    analysis ? "has-followups" : "",
    isBuildingPrompt ? "is-building" : ""
  ].filter(Boolean).join(" ");

  useEffect(() => {
    const storedProvider = readStoredProvider();
    const storedModel = readStoredModel(storedProvider);
    setProvider(storedProvider);
    setModel(storedModel);

    const storedApiKey = readStoredApiKey(storedProvider);
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setError(undefined);
      void saveServerApiKey(storedProvider, storedApiKey).catch(() => undefined);
    } else {
      void readServerApiKeyState(storedProvider)
        .then((hasApiKey) => {
          if (hasApiKey) {
            setApiKey(STORED_API_KEY_SENTINEL);
            setError(undefined);
          }
        })
        .catch(() => undefined);
    }

    try {
      setPromptHistory(readPromptHistory(window.localStorage));
    } catch (caught) {
      if (caught instanceof Error) {
        setPromptHistory([]);
      } else {
        throw caught;
      }
    }
  }, []);

  const persistHistory = (entries: readonly PromptHistoryEntry[]) => {
    const nextEntries = [...entries];
    setPromptHistory(nextEntries);
    try {
      writePromptHistory(window.localStorage, nextEntries);
    } catch (caught) {
      if (!(caught instanceof Error)) throw caught;
    }
  };

  const updateApiKey = (value: string) => {
    const nextApiKey = value.trim();
    setApiKey(nextApiKey);
    saveStoredApiKey(provider, nextApiKey);
    void saveServerApiKey(provider, nextApiKey).catch(() => undefined);
    if (nextApiKey) setError(undefined);
  };

  const testAndSaveApiKey = async (value: string) => {
    const nextApiKey = value.trim();
    await testApiKeyConnection(provider, model, nextApiKey);
    updateApiKey(nextApiKey);
  };

  const updateProvider = (value: ModelProviderId) => {
    const nextModel = readStoredModel(value);
    setProvider(value);
    setModel(nextModel);
    saveStoredProvider(value);
    const storedApiKey = readStoredApiKey(value);
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setError(undefined);
      void saveServerApiKey(value, storedApiKey).catch(() => undefined);
      return;
    }

    setApiKey("");
    void readServerApiKeyState(value)
      .then((hasApiKey) => {
        if (hasApiKey) setApiKey(STORED_API_KEY_SENTINEL);
      })
      .catch(() => undefined);
  };

  const updateModel = (value: string) => {
    setModel(value);
    saveStoredModel(provider, value);
  };

  const saveResultHistory = (resultData: UltimatePromptResult, snapshot: PromptHistorySnapshot) => {
    const previousEntry = activeHistoryId ? promptHistory.find((entry) => entry.id === activeHistoryId) : undefined;
    const historyEntry = createPromptHistoryEntry({
      existingId: activeHistoryId,
      previousEntry,
      rawQuestion,
      analysis: snapshot.analysis,
      directionSettings: snapshot.directionSettings,
      followupAnswers: snapshot.followupAnswers,
      provider: snapshot.provider,
      model: snapshot.model,
      result: resultData
    });
    setActiveHistoryId(historyEntry.id);
    persistHistory(upsertPromptHistory(promptHistory, historyEntry));
  };

  const analyze = async () => {
    if (!apiKey) {
      setError(`${PROVIDER_API_KEY_LABELS[provider]}를 먼저 입력해주세요.`);
      return;
    }

    setActiveHistoryId(undefined);
    setError(undefined);
    setLoading(true);
    try {
      const data = questionAnalysisSchema.parse(await postJson("/api/analyze-question", { rawQuestion, apiKey, provider, model }));
      setAnalysis(data);
      setDirectionSettings(createDirectionSettings(data));
      setFollowupQuestions(data.followupQuestions);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "분석에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const synthesize = async ({ answers, settings, revision, sourceAnalysis }: SynthesizeInput) => {
    const requestAnalysis = sourceAnalysis ?? analysis;
    if (!requestAnalysis) return;
    if (!apiKey) {
      setError(`${PROVIDER_API_KEY_LABELS[provider]}를 먼저 입력해주세요.`);
      return;
    }

    const requestProvider = provider;
    const requestModel = model;
    const snapshot = {
      analysis: requestAnalysis,
      directionSettings: settings,
      followupAnswers: answers,
      provider: requestProvider,
      model: requestModel
    };
    setDirectionSettings(settings);
    setAnswerDrafts(Object.fromEntries(answers.map((item) => [item.id, item.answer])));
    setLastPromptSnapshot(snapshot);
    setError(undefined);
    setLoading(true);
    try {
      const data = ultimatePromptResultSchema.parse(await postJson("/api/synthesize-ultimate-prompt", {
        rawQuestion,
        apiKey,
        provider: requestProvider,
        model: requestModel,
        analysis: requestAnalysis,
        directionSettings: settings,
        followupAnswers: answers,
        revision
      }));
      setResult(data);
      saveResultHistory(data, snapshot);
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
    setAnswerDrafts({});
    setResult(null);
    setLastPromptSnapshot(null);
    setActiveHistoryId(undefined);
    setError(undefined);
  };

  const selectHistoryEntry = (entry: PromptHistoryEntry) => {
    setRawQuestion(entry.rawQuestion);
    const entryProvider = entry.provider ?? DEFAULT_PROVIDER;
    const entryModel = entry.model ?? getDefaultModelForProvider(entryProvider);
    setProvider(entryProvider);
    setModel(entryModel);
    const entryApiKey = readStoredApiKey(entryProvider);
    setApiKey(entryApiKey);
    if (!entryApiKey) {
      void readServerApiKeyState(entryProvider)
        .then((hasApiKey) => {
          if (hasApiKey) setApiKey(STORED_API_KEY_SENTINEL);
        })
        .catch(() => undefined);
    }
    setAnalysis(entry.analysis);
    setDirectionSettings(entry.directionSettings);
    setFollowupQuestions(entry.analysis.followupQuestions);
    setAnswerDrafts(Object.fromEntries(entry.followupAnswers.map((item) => [item.id, item.answer])));
    setResult(entry.result);
    setLastPromptSnapshot({
      analysis: entry.analysis,
      directionSettings: entry.directionSettings,
      followupAnswers: entry.followupAnswers,
      provider: entryProvider,
      model: entryModel
    });
    setActiveHistoryId(entry.id);
    setError(undefined);
  };

  const deleteHistoryEntry = (id: string) => {
    if (activeHistoryId === id) setActiveHistoryId(undefined);
    persistHistory(removePromptHistoryEntry(promptHistory, id));
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
          <HistoryMenu entries={promptHistory} activeId={activeHistoryId} onSelect={selectHistoryEntry} onDelete={deleteHistoryEntry} />
          <ApiKeyMenu
            apiKey={apiKey}
            provider={provider}
            model={model}
            onProviderChange={updateProvider}
            onApiKeyChange={updateApiKey}
            onApiKeyTest={testAndSaveApiKey}
            onModelChange={updateModel}
          />
        </div>
      </header>

      <section className="hero-stage" aria-label="첫 질문 입력">
        <div className="spline-frame">
          <iframe
            title="NEXBOT robot animation"
            src="https://my.spline.design/nexbotrobotcharacterconcept-Gzlk5cCKXuRUpeFXKYo5NQa8/"
            frameBorder="0"
            allow="autoplay; fullscreen; xr-spatial-tracking"
            onLoad={() => setSplineReady(true)}
            onError={() => setSplineReady(false)}
            className={`spline-embed ${splineReady ? "spline-embed-ready" : ""}`}
          />
        </div>
        {isFirstScreen ? <MatrixClickEffect /> : null}
        {isFirstScreen ? (
          <div className="hero-input-layer">
            <QuestionInput rawQuestion={rawQuestion} error={error} loading={loading} onChange={setRawQuestion} onSubmit={analyze} />
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
            error={error}
            loading={loading}
            onSubmit={(answers, settings) => void synthesize({ answers, settings })}
          />
        </section>
      ) : null}

      {result ? (
        <ResultModal
          result={result}
          source={lastPromptSnapshot ? {
            rawQuestion,
            directionSettings: lastPromptSnapshot.directionSettings,
            followupAnswers: lastPromptSnapshot.followupAnswers,
            provider: lastPromptSnapshot.provider,
            model: lastPromptSnapshot.model
          } : undefined}
          loading={loading}
          error={error}
          onBackToFollowups={() => setResult(null)}
          onReset={reset}
          onRefine={(revision) => {
            if (!lastPromptSnapshot) return setError("이전 질문 정보가 없어 다시 답변할 수 없습니다. 이전 질문 선택을 다시 해주세요.");
            void synthesize({
              answers: lastPromptSnapshot.followupAnswers,
              settings: lastPromptSnapshot.directionSettings,
              sourceAnalysis: lastPromptSnapshot.analysis,
              revision
            });
          }}
        />
      ) : null}
    </main>
  );
}
