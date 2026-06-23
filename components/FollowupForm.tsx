"use client";

import { useEffect, useState } from "react";
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
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={item.weight}
                aria-label={`${QUESTION_TYPE_LABELS[item.type]} 반영 정도`}
                onChange={(event) => updateWeight(item.type, Number(event.target.value))}
                className="tuning-range"
              />
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
