"use client";

import { useEffect, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { QUESTION_TYPE_LABELS } from "@/lib/questionTypes";
import type { DirectionSetting, FollowupAnswer, FollowupQuestion } from "@/lib/types";

export type FollowupFormProps = {
  questions: FollowupQuestion[];
  directionSettings: DirectionSetting[];
  initialAnswers: Partial<Record<string, string>>;
  error?: string;
  loading?: boolean;
  onSubmit: (answers: FollowupAnswer[], directionSettings: DirectionSetting[]) => void;
};

const DIAL_STEP = 5;
const DIAL_MAX = 100;
const DIAL_MIN = 0;
const DIAL_START_DEGREES = -135;
const DIAL_ARC_DEGREES = 270;

type DialStyle = CSSProperties & {
  readonly "--dial-progress": string;
  readonly "--dial-angle": string;
};

const clampWeight = (weight: number) => Math.min(DIAL_MAX, Math.max(DIAL_MIN, weight));

const snapWeight = (weight: number) => clampWeight(Math.round(weight / DIAL_STEP) * DIAL_STEP);

const getDialStyle = (weight: number): DialStyle => ({
  "--dial-progress": `${weight}%`,
  "--dial-angle": `${DIAL_START_DEGREES + (weight / DIAL_MAX) * DIAL_ARC_DEGREES}deg`
});

const getPointerWeight = (element: HTMLElement, clientX: number) => {
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0) return DIAL_MIN;

  return snapWeight(((clientX - rect.left) / rect.width) * DIAL_MAX);
};

export function FollowupForm({ questions, directionSettings, initialAnswers, error, loading = false, onSubmit }: FollowupFormProps) {
  const [answers, setAnswers] = useState<Partial<Record<string, string>>>(initialAnswers);
  const [choiceSelections, setChoiceSelections] = useState<Partial<Record<string, string[]>>>({});
  const [settings, setSettings] = useState<DirectionSetting[]>(directionSettings);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    setSettings(directionSettings);
  }, [directionSettings]);

  const updateWeight = (type: DirectionSetting["type"], weight: number) => {
    setSettings((current) => current.map((item) => (item.type === type ? { ...item, weight } : item)));
  };

  const startDialDrag = (type: DirectionSetting["type"], event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    updateWeight(type, getPointerWeight(event.currentTarget, event.clientX));
  };

  const moveDialDrag = (type: DirectionSetting["type"], event: PointerEvent<HTMLDivElement>) => {
    if (event.buttons !== 1) return;
    updateWeight(type, getPointerWeight(event.currentTarget, event.clientX));
  };

  const updateDialWithKeyboard = (type: DirectionSetting["type"], currentWeight: number, event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      updateWeight(type, snapWeight(currentWeight + DIAL_STEP));
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      updateWeight(type, snapWeight(currentWeight - DIAL_STEP));
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      updateWeight(type, DIAL_MIN);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      updateWeight(type, DIAL_MAX);
    }
  };

  const toggleChoice = (id: string, choice: string) => {
    setChoiceSelections((current) => {
      const currentChoices = current[id] ?? [];
      const nextChoices = currentChoices.includes(choice)
        ? currentChoices.filter((item) => item !== choice)
        : [...currentChoices, choice];

      return { ...current, [id]: nextChoices };
    });
  };

  const combinedAnswer = (id: string) =>
    [...(choiceSelections[id] ?? []), answers[id]?.trim()]
      .filter((item): item is string => Boolean(item))
      .join("\n");

  const submit = () => {
    const payload = questions.map((question) => ({
      id: question.id,
      purpose: question.purpose,
      question: question.question,
      answer: combinedAnswer(question.id)
    }));
    setShowWarning(payload.filter((item) => item.answer.trim()).length < 2);
    onSubmit(payload, settings);
  };

  return (
    <section className="followup-console">
      <section className="tuning-panel">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3>방향</h3>
          </div>
        </div>
        <div className="tuning-grid">
          {settings.map((item) => (
            <label key={item.type} className="tuning-row">
              <span className="flex items-center justify-between gap-3 text-sm font-semibold text-white">
                <span>{QUESTION_TYPE_LABELS[item.type]}</span>
                <span className="tuning-value">{item.weight}</span>
              </span>
              <div className="tuning-control">
                <input
                  type="range"
                  min={DIAL_MIN}
                  max={DIAL_MAX}
                  step={DIAL_STEP}
                  value={item.weight}
                  aria-label={`${QUESTION_TYPE_LABELS[item.type]} 반영 정도`}
                  onChange={(event) => updateWeight(item.type, Number(event.target.value))}
                  className="tuning-range"
                />
                <div
                  role="slider"
                  tabIndex={0}
                  aria-label={`${QUESTION_TYPE_LABELS[item.type]} 모바일 다이얼`}
                  aria-valuemin={DIAL_MIN}
                  aria-valuemax={DIAL_MAX}
                  aria-valuenow={item.weight}
                  aria-valuetext={`${item.weight}`}
                  className="tuning-dial-control"
                  style={getDialStyle(item.weight)}
                  onPointerDown={(event) => startDialDrag(item.type, event)}
                  onPointerMove={(event) => moveDialDrag(item.type, event)}
                  onKeyDown={(event) => updateDialWithKeyboard(item.type, item.weight, event)}
                >
                  <span className="tuning-dial-number">{item.weight}</span>
                </div>
              </div>
            </label>
          ))}
        </div>
      </section>
      <div className="question-signal-list">
        {questions.map((item) => (
          <section key={item.id} className="signal-panel">
            <p className="signal-purpose">{item.purpose}</p>
            <h3>{item.question}</h3>
            <div className="choice-grid">
              {item.choices.map((choice) => {
                const selected = choiceSelections[item.id]?.includes(choice) ?? false;

                return (
                  <button
                    key={choice}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleChoice(item.id, choice)}
                    className={`choice-chip ${selected ? "choice-chip-selected" : ""}`}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
            <label className="direct-answer">
              <span>직접 입력</span>
              <input
                type="text"
                aria-label={`${item.purpose} 직접 입력`}
                value={answers[item.id] ?? ""}
                onChange={(event) => setAnswers((current) => ({ ...current, [item.id]: event.target.value }))}
                placeholder="직접 입력"
                className="direct-input"
              />
            </label>
          </section>
        ))}
      </div>
      {showWarning ? <p className="console-error">답변을 조금 더 골라주세요.</p> : null}
      {error ? <p className="console-error" role="alert">{error}</p> : null}
      <button type="button" disabled={loading} onClick={submit} className="primary-action followup-submit">
        {loading ? "생성 중..." : "궁극의 질문 생성"}
      </button>
    </section>
  );
}
