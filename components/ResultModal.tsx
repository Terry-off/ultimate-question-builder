"use client";

import { Eye, PencilLine, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { DEFAULT_PROVIDER, getModelLabel, getProviderLabel, type ModelProviderId } from "@/lib/modelProviders";
import { QUESTION_TYPE_LABELS } from "@/lib/questionTypes";
import type { DirectionSetting, FollowupAnswer, PromptRevision, PromptVersionId, UltimatePromptResult } from "@/lib/types";
import { createEditablePromptMap, type EditablePromptMap, ResultTabs } from "./ResultTabs";

export type ResultRefineRequest = PromptRevision;
export type ResultSourceSummary = {
  readonly rawQuestion: string;
  readonly directionSettings: readonly DirectionSetting[];
  readonly followupAnswers: readonly FollowupAnswer[];
  readonly provider?: ModelProviderId;
  readonly model?: string;
};

type ResultModalProps = {
  readonly result: UltimatePromptResult;
  readonly source?: ResultSourceSummary;
  readonly loading: boolean;
  readonly error?: string;
  readonly onBackToFollowups: () => void;
  readonly onReset: () => void;
  readonly onRefine: (request: ResultRefineRequest) => void;
};

export function ResultModal({ result, source, loading, error, onBackToFollowups, onReset, onRefine }: ResultModalProps) {
  const [activeVersion, setActiveVersion] = useState<PromptVersionId>("deepVersion");
  const [editable, setEditable] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [editedPrompts, setEditedPrompts] = useState<EditablePromptMap>(() => createEditablePromptMap(result));
  const [feedback, setFeedback] = useState("");
  const canRefine = feedback.trim().length > 0 && editedPrompts[activeVersion].trim().length > 0 && !loading;
  const provider = source?.provider ?? DEFAULT_PROVIDER;
  const model = source?.model;
  const providerLabel = getProviderLabel(provider);
  const modelLabel = getModelLabel(provider, model);

  useEffect(() => {
    setActiveVersion("deepVersion");
    setEditable(false);
    setSourceOpen(false);
    setEditedPrompts(createEditablePromptMap(result));
    setFeedback("");
  }, [result]);

  const updatePrompt = (version: PromptVersionId, value: string) => {
    setEditedPrompts((current) => ({ ...current, [version]: value }));
  };

  const submitRefinement = () => {
    if (!canRefine) return;

    onRefine({
      selectedVersion: activeVersion,
      editedPrompt: editedPrompts[activeVersion].trim(),
      feedback: feedback.trim()
    });
  };

  return (
    <div className="result-backdrop">
      <section className="result-modal" role="dialog" aria-modal="true" aria-label="AI에게 물어보는 궁극의 질문입니다.">
        <button type="button" onClick={onReset} className="modal-close">
          닫기
        </button>
        <div className="result-meta-row">
          <span className="result-model-badge">{providerLabel} · {modelLabel}</span>
          {source ? (
            <button type="button" onClick={() => setSourceOpen((current) => !current)} className="ghost-action ghost-action-dark source-toggle">
              <Eye size={15} aria-hidden="true" />
              처음 질문 보기
            </button>
          ) : null}
        </div>
        {source && sourceOpen ? (
          <section className="source-panel" aria-label="처음 질문과 선택한 답변">
            <div className="source-block">
              <strong>처음 질문</strong>
              <p>{source.rawQuestion}</p>
            </div>
            <div className="source-grid">
              <div className="source-block">
                <strong>2차 질문 선택</strong>
                <ul>
                  {source.followupAnswers.map((item) => (
                    <li key={item.id}>
                      <span>{item.question}</span>
                      <em className="source-answer">{item.answer || "선택 없음"}</em>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="source-block">
                <strong>방향</strong>
                <ul>
                  {source.directionSettings.map((item) => (
                    <li key={item.type}>{QUESTION_TYPE_LABELS[item.type]} {item.weight}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ) : null}
        <ResultTabs
          result={result}
          editable={editable}
          activeVersion={activeVersion}
          editedPrompts={editedPrompts}
          onActiveVersionChange={setActiveVersion}
          onPromptChange={updatePrompt}
        />
        <section className="result-refine-panel">
          <div className="result-edit-row">
            <button
              type="button"
              onClick={() => setEditable((current) => !current)}
              className={`ghost-action ghost-action-dark edit-toggle ${editable ? "edit-toggle-active" : ""}`}
            >
              <PencilLine size={16} />
              내용수정
            </button>
            {editable ? <p className="edit-state-note">지금 본문을 직접 수정할 수 있어요.</p> : null}
          </div>
          <label className="revision-field">
            <span>결과를 보고 추가로 반영할 내용</span>
            <textarea
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              aria-label="결과를 보고 추가로 반영할 내용"
              placeholder="예: 더 짧게, 더 전문가답게, 실행 순서를 더 분명하게 바꿔줘"
              className="revision-input"
            />
          </label>
          {error ? <p role="alert" className="result-refine-error">{error}</p> : null}
          <button
            type="button"
            disabled={!canRefine}
            aria-busy={loading}
            onClick={submitRefinement}
            className={`primary-action refine-action ${loading ? "is-refining" : ""}`}
          >
            <RefreshCw className="refine-action-icon" size={16} aria-hidden="true" />
            <span className="refine-action-label">{loading ? "다시 만드는 중..." : "다시 답변 받기"}</span>
          </button>
        </section>
        <div className="modal-actions">
          <button type="button" onClick={onBackToFollowups} className="ghost-action ghost-action-dark">
            이전 질문 선택 다시하기
          </button>
          <button type="button" onClick={onReset} className="primary-action">
            새 질문 만들기
          </button>
        </div>
      </section>
    </div>
  );
}
