"use client";

import { useEffect, useState } from "react";
import { ApiKeyMenu } from "@/components/ApiKeyMenu";
import { FollowupForm } from "@/components/FollowupForm";
import { HistoryMenu } from "@/components/HistoryMenu";
import { LoadingLayer } from "@/components/LoadingLayer";
import { QuestionInput } from "@/components/QuestionInput";
import { ResultModal, type ResultRefineRequest } from "@/components/ResultModal";
import { STORED_API_KEY_SENTINEL } from "@/lib/apiKeyShared";
import { readServerApiKeyState, readStoredApiKey, saveServerApiKey, saveStoredApiKey } from "@/lib/clientApiKey";
import { createDirectionSettings } from "@/lib/directionSettings";
import { readStoredModel, saveStoredModel } from "@/lib/modelPreference";
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
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [splineReady, setSplineReady] = useState(false);
  const [rawQuestion, setRawQuestion] = useState("");
  const [analysis, setAnalysis] = useState<QuestionAnalysis | null>(null);
  const [directionSettings, setDirectionSettings] = useState<DirectionSetting[]>([]);
  const [followupQuestions, setFollowupQuestions] = useState<FollowupQuestion[]>([]);
  const [followupAnswers, setFollowupAnswers] = useState<FollowupAnswer[]>([]);
  const [answerDrafts, setAnswerDrafts] = useState<Partial<Record<string, string>>>({});
  const [result, setResult] = useState<UltimatePromptResult | null>(null);
  const [promptHistory, setPromptHistory] = useState<PromptHistoryEntry[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | undefined>();
  const [lastPromptSnapshot, setLastPromptSnapshot] = useState<PromptHistorySnapshot | null>(null);
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
    setModel(readStoredModel());

    const storedApiKey = readStoredApiKey();
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setError(undefined);
      void saveServerApiKey(storedApiKey).catch(() => undefined);
    } else {
      void readServerApiKeyState()
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
    saveStoredApiKey(nextApiKey);
    void saveServerApiKey(nextApiKey).catch(() => undefined);
    if (nextApiKey) setError(undefined);
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
      result: resultData
    });
    setActiveHistoryId(historyEntry.id);
    persistHistory(upsertPromptHistory(promptHistory, historyEntry));
  };

  const analyze = async () => {
    if (!apiKey) {
      setError("OpenAI API 키를 먼저 입력해주세요.");
      return;
    }

    setActiveHistoryId(undefined);
    setError(undefined);
    setLoading(true);
    try {
      const data = questionAnalysisSchema.parse(await postJson("/api/analyze-question", { rawQuestion, apiKey, model }));
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
      setError("OpenAI API 키를 먼저 입력해주세요.");
      return;
    }

    const snapshot = { analysis: requestAnalysis, directionSettings: settings, followupAnswers: answers };
    setFollowupAnswers(answers);
    setDirectionSettings(settings);
    setAnswerDrafts(Object.fromEntries(answers.map((item) => [item.id, item.answer])));
    setLastPromptSnapshot(snapshot);
    setError(undefined);
    setLoading(true);
    try {
      const data = ultimatePromptResultSchema.parse(await postJson("/api/synthesize-ultimate-prompt", {
        rawQuestion,
        apiKey,
        model,
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
    setFollowupAnswers([]);
    setAnswerDrafts({});
    setResult(null);
    setLastPromptSnapshot(null);
    setActiveHistoryId(undefined);
    setError(undefined);
  };

  const selectHistoryEntry = (entry: PromptHistoryEntry) => {
    setRawQuestion(entry.rawQuestion);
    setAnalysis(entry.analysis);
    setDirectionSettings(entry.directionSettings);
    setFollowupQuestions(entry.analysis.followupQuestions);
    setFollowupAnswers(entry.followupAnswers);
    setAnswerDrafts(Object.fromEntries(entry.followupAnswers.map((item) => [item.id, item.answer])));
    setResult(entry.result);
    setLastPromptSnapshot({
      analysis: entry.analysis,
      directionSettings: entry.directionSettings,
      followupAnswers: entry.followupAnswers
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
          <ApiKeyMenu apiKey={apiKey} model={model} onApiKeyChange={updateApiKey} onModelChange={(value) => { setModel(value); saveStoredModel(value); }} />
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
        {!analysis && !loading ? (
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
            loading={loading}
            onSubmit={(answers, settings) => void synthesize({ answers, settings })}
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
            if (!lastPromptSnapshot) return;
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
