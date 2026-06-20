"use client";

import { QUESTION_TYPE_LABELS, type QuestionType } from "@/lib/questionTypes";
import type { QuestionAnalysis, QuestionTypeOption } from "@/lib/types";
import { TypeSelector } from "./TypeSelector";

export type AnalysisCardProps = {
  analysis: QuestionAnalysis;
  selectedType: QuestionType;
  onTypeChange: (type: QuestionType) => void;
  onContinue: () => void;
};

function recommendedOptions(analysis: QuestionAnalysis): QuestionTypeOption[] {
  const seen = new Set<QuestionType>();
  const options: QuestionTypeOption[] = [];
  const push = (option: QuestionTypeOption) => {
    if (seen.has(option.type) || options.length >= 3) return;
    seen.add(option.type);
    options.push(option);
  };

  for (const option of analysis.recommendedTypeOptions) {
    push(option);
  }

  push({ type: analysis.primaryType, reason: "AI가 가장 잘 맞는 방향으로 봤어요." });
  for (const type of analysis.secondaryTypes) {
    push({ type, reason: "이 방향도 함께 생각해볼 만해요." });
  }

  return options;
}

export function AnalysisCard({ analysis, selectedType, onTypeChange, onContinue }: AnalysisCardProps) {
  const typeOptions = recommendedOptions(analysis);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-accent">Step 2</p>
        <h2 className="mt-2 text-3xl font-semibold text-ink">AI가 질문의 방향을 읽었어요</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-500">가장 잘 맞는 방향</p>
            <p className="mt-1 text-xl font-semibold">{QUESTION_TYPE_LABELS[selectedType]}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">질문 속 진짜 의도</p>
            <p className="mt-1 leading-7">{analysis.deeperIntent}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">이대로 물으면 아쉬운 점</p>
            <p className="mt-1 leading-7">{analysis.genericAnswerRisk}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">더 알면 답이 좋아지는 것</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {analysis.missingDimensions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="space-y-4 rounded-lg border border-line bg-white p-4">
          <TypeSelector value={selectedType} options={typeOptions} onChange={onTypeChange} />
          <p className="text-sm text-gray-600">많이 고를 필요 없어요. 가장 가까운 방향 하나만 고르면 됩니다.</p>
          <button type="button" onClick={onContinue} className="w-full rounded-md bg-accent px-4 py-3 text-sm font-semibold text-white">
            후속 질문 답하기
          </button>
        </div>
      </div>
    </section>
  );
}
