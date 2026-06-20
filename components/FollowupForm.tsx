"use client";

import { useState } from "react";
import { FOLLOWUP_PURPOSE_LABELS, type FollowupPurpose } from "@/lib/questionTypes";
import type { FollowupAnswer, FollowupQuestion } from "@/lib/types";

export type FollowupFormProps = {
  questions: FollowupQuestion[];
  initialAnswers: Partial<Record<FollowupPurpose, string>>;
  loading?: boolean;
  onSubmit: (answers: FollowupAnswer[]) => void;
};

export function FollowupForm({ questions, initialAnswers, loading = false, onSubmit }: FollowupFormProps) {
  const [answers, setAnswers] = useState<Partial<Record<FollowupPurpose, string>>>(initialAnswers);
  const [showWarning, setShowWarning] = useState(false);

  const submit = () => {
    const payload = questions.map((question) => ({
      purpose: question.purpose,
      question: question.question,
      answer: answers[question.purpose] ?? ""
    }));
    setShowWarning(!payload.find((item) => item.purpose === "goal")?.answer || !payload.find((item) => item.purpose === "context")?.answer);
    onSubmit(payload);
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-accent">Step 3</p>
        <h2 className="mt-2 text-3xl font-semibold text-ink">더 강한 질문을 만들기 위해 5가지만 답해주세요.</h2>
      </div>
      <div className="space-y-4">
        {questions.map((item) => (
          <label key={item.id} className="block rounded-lg border border-line bg-white p-4">
            <span className="text-sm font-semibold text-accent">{FOLLOWUP_PURPOSE_LABELS[item.purpose]}</span>
            <span className="mt-2 block leading-7 text-ink">{item.question}</span>
            <textarea
              aria-label={FOLLOWUP_PURPOSE_LABELS[item.purpose]}
              value={answers[item.purpose] ?? ""}
              onChange={(event) => setAnswers((current) => ({ ...current, [item.purpose]: event.target.value }))}
              rows={4}
              className="mt-3 w-full resize-y rounded-md border border-line p-3 leading-7 outline-none focus:border-accent"
            />
          </label>
        ))}
      </div>
      {showWarning ? <p className="text-sm text-amber-700">목표와 맥락이 비어 있으면 결과가 약해질 수 있습니다.</p> : null}
      <button type="button" disabled={loading} onClick={submit} className="rounded-md bg-accent px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {loading ? "생성 중..." : "궁극 질문 만들기"}
      </button>
    </section>
  );
}
