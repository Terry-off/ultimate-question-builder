"use client";

import { QUESTION_TYPE_LABELS, type QuestionType } from "@/lib/questionTypes";
import type { QuestionAnalysis } from "@/lib/types";
import { TypeSelector } from "./TypeSelector";

export type AnalysisCardProps = {
  analysis: QuestionAnalysis;
  selectedType: QuestionType;
  onTypeChange: (type: QuestionType) => void;
  onContinue: () => void;
};

export function AnalysisCard({ analysis, selectedType, onTypeChange, onContinue }: AnalysisCardProps) {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-accent">Step 2</p>
        <h2 className="mt-2 text-3xl font-semibold text-ink">질문 유형 분석 결과</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-500">질문 유형</p>
            <p className="mt-1 text-xl font-semibold">{QUESTION_TYPE_LABELS[selectedType]}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">보조 유형</p>
            <p className="mt-1">{analysis.secondaryTypes.map((type) => QUESTION_TYPE_LABELS[type]).join(", ") || "없음"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">깊은 의도</p>
            <p className="mt-1 leading-7">{analysis.deeperIntent}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">평범한 답변으로 흐를 위험</p>
            <p className="mt-1 leading-7">{analysis.genericAnswerRisk}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">부족한 정보</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {analysis.missingDimensions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="space-y-4 rounded-lg border border-line bg-white p-4">
          <TypeSelector value={selectedType} onChange={onTypeChange} />
          <p className="text-sm text-gray-600">유형을 바꾸면 다음 단계의 후속 질문도 함께 바뀝니다.</p>
          <button type="button" onClick={onContinue} className="w-full rounded-md bg-accent px-4 py-3 text-sm font-semibold text-white">
            후속 질문 답하기
          </button>
        </div>
      </div>
    </section>
  );
}
