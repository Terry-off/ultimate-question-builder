import { getQualityMessage } from "@/lib/qualityScore";
import type { UltimatePromptResult } from "@/lib/types";

export function QualityScoreCard({ result }: { result: UltimatePromptResult }) {
  return (
    <div className="quality-panel">
      <p className="mono-kicker">QUALITY SIGNAL</p>
      <h3 className="quality-title">질문 품질 점수</h3>
      <div className="quality-score-row">
        <p className="quality-score">{result.qualityScore.total}</p>
        <p className="quality-unit">/ 100</p>
      </div>
      <p className="quality-message">{getQualityMessage(result.qualityScore.total)}</p>
      <div className="quality-grid">
        <div>
          <h3>왜 이 질문이 강한가</h3>
          <ul>
            {result.whyThisPromptIsStrong.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>개선 제안</h3>
          <ul>
            {result.improvementSuggestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
