"use client";

import { QUESTION_TYPE_LABELS, QUESTION_TYPES, type QuestionType } from "@/lib/questionTypes";

export type TypeSelectorProps = {
  value: QuestionType;
  onChange: (type: QuestionType) => void;
};

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  return (
    <label className="block text-sm font-medium">
      질문 유형 직접 변경
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as QuestionType)}
        className="mt-2 w-full rounded-md border border-line bg-white px-3 py-2"
      >
        {QUESTION_TYPES.map((type) => (
          <option key={type} value={type}>
            {QUESTION_TYPE_LABELS[type]}
          </option>
        ))}
      </select>
    </label>
  );
}
