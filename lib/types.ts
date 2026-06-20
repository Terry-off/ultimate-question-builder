import { z } from "zod";
import { FOLLOWUP_PURPOSES, QUESTION_TYPES } from "./questionTypes";

export const MAX_INPUT_LENGTH = 3000;
export const DEFAULT_MODEL = "gpt-5.5";

export const questionTypeSchema = z.enum(QUESTION_TYPES);
export const followupPurposeSchema = z.enum(FOLLOWUP_PURPOSES);

const rawQuestionSchema = z
  .string()
  .trim()
  .min(10, "질문이 너무 짧습니다. AI에게 묻고 싶은 내용을 한 문장 이상으로 적어주세요.")
  .max(MAX_INPUT_LENGTH, "질문은 3000자 이하로 입력해주세요.");

const apiKeySchema = z.string().trim().min(1, "OpenAI API 키를 입력해주세요.");
const modelSchema = z.string().trim().min(1).default(DEFAULT_MODEL);

export const questionTypeOptionSchema = z.object({
  type: questionTypeSchema,
  reason: z.string().min(1).max(120)
});

export const directionSettingSchema = questionTypeOptionSchema.extend({
  weight: z.number().min(0).max(100)
});

export const followupQuestionSchema = z.object({
  id: followupPurposeSchema,
  purpose: followupPurposeSchema,
  question: z.string().min(1).max(120),
  choices: z.array(z.string().min(1).max(80)).length(4)
});

export const questionAnalysisSchema = z.object({
  primaryType: questionTypeSchema,
  secondaryTypes: z.array(questionTypeSchema).max(2),
  confidence: z.number().min(0).max(1),
  surfaceQuestion: z.string().min(1),
  deeperIntent: z.string().min(1),
  genericAnswerRisk: z.string().min(1),
  missingDimensions: z.array(z.string()).max(8),
  recommendedFollowupFocus: z.array(followupPurposeSchema).max(5),
  recommendedTypeOptions: z.array(questionTypeOptionSchema).min(1).max(3),
  followupQuestions: z.array(followupQuestionSchema).length(5)
});

export const followupAnswerSchema = z.object({
  purpose: followupPurposeSchema,
  question: z.string().min(1),
  answer: z.string().max(MAX_INPUT_LENGTH, "후속 답변은 3000자 이하로 입력해주세요.")
});

export const qualityScoreSchema = z.object({
  total: z.number().min(0).max(100),
  context: z.number().min(0).max(15),
  goal: z.number().min(0).max(15),
  knownExclusions: z.number().min(0).max(10),
  tension: z.number().min(0).max(20),
  perspectiveCollision: z.number().min(0).max(15),
  selfRefutation: z.number().min(0).max(10),
  outputClarity: z.number().min(0).max(15)
});

export const ultimatePromptResultSchema = z.object({
  shortVersion: z.string().min(1),
  deepVersion: z.string().min(1),
  expertVersion: z.string().min(1),
  whyThisPromptIsStrong: z.array(z.string()).min(1),
  qualityScore: qualityScoreSchema,
  improvementSuggestions: z.array(z.string())
});

export const analyzeQuestionRequestSchema = z.object({
  rawQuestion: rawQuestionSchema,
  apiKey: apiKeySchema,
  model: modelSchema
});

export const generateFollowupsRequestSchema = z.object({
  primaryType: questionTypeSchema
});

export const synthesizePromptRequestSchema = z.object({
  rawQuestion: rawQuestionSchema,
  apiKey: apiKeySchema,
  model: modelSchema,
  analysis: questionAnalysisSchema,
  directionSettings: z.array(directionSettingSchema).min(1).max(3),
  followupAnswers: z.array(followupAnswerSchema).length(5)
});

export type QuestionAnalysis = z.infer<typeof questionAnalysisSchema>;
export type QuestionTypeOption = z.infer<typeof questionTypeOptionSchema>;
export type DirectionSetting = z.infer<typeof directionSettingSchema>;
export type FollowupQuestion = z.infer<typeof followupQuestionSchema>;
export type FollowupAnswer = z.infer<typeof followupAnswerSchema>;
export type QualityScore = z.infer<typeof qualityScoreSchema>;
export type UltimatePromptResult = z.infer<typeof ultimatePromptResultSchema>;
export type AnalyzeQuestionRequest = z.infer<typeof analyzeQuestionRequestSchema>;
export type SynthesizePromptRequest = z.infer<typeof synthesizePromptRequestSchema>;
