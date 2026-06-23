"use client";

import { PencilLine, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import type { PromptRevision, PromptVersionId, UltimatePromptResult } from "@/lib/types";
import { createEditablePromptMap, type EditablePromptMap, ResultTabs } from "./ResultTabs";

export type ResultRefineRequest = PromptRevision;

type ResultModalProps = {
  readonly result: UltimatePromptResult;
  readonly loading: boolean;
  readonly onBackToFollowups: () => void;
  readonly onReset: () => void;
  readonly onRefine: (request: ResultRefineRequest) => void;
};

export function ResultModal({ result, loading, onBackToFollowups, onReset, onRefine }: ResultModalProps) {
  const [activeVersion, setActiveVersion] = useState<PromptVersionId>("deepVersion");
  const [editable, setEditable] = useState(false);
  const [editedPrompts, setEditedPrompts] = useState<EditablePromptMap>(() => createEditablePromptMap(result));
  const [feedback, setFeedback] = useState("");
  const canRefine = feedback.trim().length > 0 && editedPrompts[activeVersion].trim().length > 0 && !loading;

  useEffect(() => {
    setActiveVersion("deepVersion");
    setEditable(false);
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
        <button type="button" onClick={onBackToFollowups} className="modal-close">
          닫기
        </button>
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
          <button type="button" disabled={!canRefine} onClick={submitRefinement} className="primary-action refine-action">
            <RefreshCw size={16} />
            {loading ? "다시 만드는 중..." : "다시 답변 받기"}
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
