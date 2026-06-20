import { getQualityMessage } from "@/lib/qualityScore";
import type { UltimatePromptResult } from "@/lib/types";

export function QualityScoreCard({ result }: { result: UltimatePromptResult }) {
  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <p className="text-sm font-semibold text-gray-500">질문 품질 점수</p>
      <div className="mt-2 flex items-end gap-3">
        <p className="text-5xl font-semibold text-accent">{result.qualityScore.total}</p>
        <p className="pb-2 text-sm text-gray-600">/ 100</p>
      </div>
      <p className="mt-3 text-sm text-gray-700">{getQualityMessage(result.qualityScore.total)}</p>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <h3 className="font-semibold">왜 이 질문이 강한가</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6">
            {result.whyThisPromptIsStrong.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">개선 제안</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6">
            {result.improvementSuggestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
