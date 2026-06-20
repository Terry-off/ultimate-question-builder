"use client";

import { useEffect, useState } from "react";
import { FOLLOWUP_PURPOSE_LABELS, QUESTION_TYPE_LABELS, type FollowupPurpose } from "@/lib/questionTypes";
import type { DirectionSetting, FollowupAnswer, FollowupQuestion } from "@/lib/types";

export type FollowupFormProps = {
  questions: FollowupQuestion[];
  directionSettings: DirectionSetting[];
  initialAnswers: Partial<Record<FollowupPurpose, string>>;
  loading?: boolean;
  onSubmit: (answers: FollowupAnswer[], directionSettings: DirectionSetting[]) => void;
};

export function FollowupForm({ questions, directionSettings, initialAnswers, loading = false, onSubmit }: FollowupFormProps) {
  const [answers, setAnswers] = useState<Partial<Record<FollowupPurpose, string>>>(initialAnswers);
  const [choiceSelections, setChoiceSelections] = useState<Partial<Record<FollowupPurpose, string[]>>>({});
  const [settings, setSettings] = useState<DirectionSetting[]>(directionSettings);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    setSettings(directionSettings);
  }, [directionSettings]);

  const updateWeight = (type: DirectionSetting["type"], weight: number) => {
    setSettings((current) => current.map((item) => (item.type === type ? { ...item, weight } : item)));
  };

  const toggleChoice = (purpose: FollowupPurpose, choice: string) => {
    setChoiceSelections((current) => {
      const currentChoices = current[purpose] ?? [];
      const nextChoices = currentChoices.includes(choice)
        ? currentChoices.filter((item) => item !== choice)
        : [...currentChoices, choice];

      return { ...current, [purpose]: nextChoices };
    });
  };

  const combinedAnswer = (purpose: FollowupPurpose) =>
    [...(choiceSelections[purpose] ?? []), answers[purpose]?.trim()]
      .filter((item): item is string => Boolean(item))
      .join("\n");

  const submit = () => {
    const payload = questions.map((question) => ({
      purpose: question.purpose,
      question: question.question,
      answer: combinedAnswer(question.purpose)
    }));
    setShowWarning(!payload.find((item) => item.purpose === "goal")?.answer || !payload.find((item) => item.purpose === "context")?.answer);
    onSubmit(payload, settings);
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-accent">Step 2</p>
        <h2 className="mt-2 text-3xl font-semibold text-ink">더 강한 질문을 만들기 위해 5가지만 답해주세요.</h2>
      </div>
      <section className="rounded-lg border border-line bg-white p-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-accent">AI가 이해한 방향</p>
            <p className="mt-1 text-sm text-gray-600">조절바를 움직이면 최종 질문에 반영되는 정도가 달라져요.</p>
          </div>
        </div>
        <div className="mt-4 space-y-4">
          {settings.map((item) => (
            <label key={item.type} className="block">
              <span className="flex items-center justify-between gap-3 text-sm font-semibold text-ink">
                <span>{QUESTION_TYPE_LABELS[item.type]}</span>
                <span className="text-accent">{item.weight}</span>
              </span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={item.weight}
                aria-label={`${QUESTION_TYPE_LABELS[item.type]} 반영 정도`}
                onChange={(event) => updateWeight(item.type, Number(event.target.value))}
                className="mt-2 w-full accent-teal-700"
              />
              <span className="mt-1 block text-xs leading-5 text-gray-500">{item.reason}</span>
            </label>
          ))}
        </div>
      </section>
      <div className="space-y-4">
        {questions.map((item) => (
          <section key={item.id} className="rounded-lg border border-line bg-white p-4">
            <p className="text-sm font-semibold text-accent">{FOLLOWUP_PURPOSE_LABELS[item.purpose]}</p>
            <p className="mt-2 leading-7 text-ink">{item.question}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {item.choices.map((choice) => {
                const selected = choiceSelections[item.purpose]?.includes(choice) ?? false;

                return (
                  <button
                    key={choice}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleChoice(item.purpose, choice)}
                    className={`rounded-md border px-3 py-2 text-left text-sm leading-6 transition ${
                      selected ? "border-accent bg-emerald-50 font-semibold text-ink" : "border-line bg-white hover:border-accent"
                    }`}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
            <label className="mt-3 block">
              <span className="text-xs font-semibold text-gray-500">{FOLLOWUP_PURPOSE_LABELS[item.purpose]} 직접 입력</span>
              <textarea
                aria-label={`${FOLLOWUP_PURPOSE_LABELS[item.purpose]} 직접 입력`}
                value={answers[item.purpose] ?? ""}
                onChange={(event) => setAnswers((current) => ({ ...current, [item.purpose]: event.target.value }))}
                rows={3}
                placeholder="선택지를 고쳐 쓰거나 직접 적어주세요."
                className="mt-2 w-full resize-y rounded-md border border-line p-3 leading-7 outline-none focus:border-accent"
              />
            </label>
          </section>
        ))}
      </div>
      {showWarning ? <p className="text-sm text-amber-700">정하고 싶은 것과 지금 상황이 비어 있으면 답이 약해질 수 있어요.</p> : null}
      <button type="button" disabled={loading} onClick={submit} className="rounded-md bg-accent px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {loading ? "생성 중..." : "궁극 질문 만들기"}
      </button>
    </section>
  );
}
