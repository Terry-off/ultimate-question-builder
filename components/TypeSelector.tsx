"use client";

import { QUESTION_TYPE_HELP_TEXT, QUESTION_TYPE_LABELS, type QuestionType } from "@/lib/questionTypes";
import type { QuestionTypeOption } from "@/lib/types";

export type TypeSelectorProps = {
  value: QuestionType;
  options: QuestionTypeOption[];
  onChange: (type: QuestionType) => void;
};

export function TypeSelector({ value, options, onChange }: TypeSelectorProps) {
  const visibleOptions = options.slice(0, 3);

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-ink">어떤 방향으로 바꿀까요?</legend>
      <div className="space-y-2">
        {visibleOptions.map((option) => {
          const selected = value === option.type;

          return (
            <button
              key={option.type}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.type)}
              className={`w-full rounded-md border p-3 text-left transition ${
                selected ? "border-accent bg-emerald-50 text-ink" : "border-line bg-white hover:border-accent"
              }`}
            >
              <span className="block text-sm font-semibold">{QUESTION_TYPE_LABELS[option.type]}</span>
              <span className="mt-1 block text-xs leading-5 text-gray-600">{option.reason || QUESTION_TYPE_HELP_TEXT[option.type]}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
