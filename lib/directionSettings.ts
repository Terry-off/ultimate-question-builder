import type { QuestionType } from "./questionTypes";
import type { DirectionSetting, QuestionAnalysis, QuestionTypeOption } from "./types";

export function createDirectionSettings(analysis: QuestionAnalysis): DirectionSetting[] {
  const seen = new Set<QuestionType>();
  const options: QuestionTypeOption[] = [];
  const push = (option: QuestionTypeOption) => {
    if (seen.has(option.type) || options.length >= 3) return;
    seen.add(option.type);
    options.push(option);
  };

  analysis.recommendedTypeOptions.forEach(push);
  push({ type: analysis.primaryType, reason: "AI가 가장 맞는 방향으로 봤어요." });
  analysis.secondaryTypes.forEach((type) => push({ type, reason: "이 방향도 함께 생각해볼 만해요." }));

  return options.map((option, index) => ({
    ...option,
    weight: option.type === analysis.primaryType ? 80 : index === 1 ? 45 : 30
  }));
}
