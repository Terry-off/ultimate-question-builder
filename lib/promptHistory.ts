import { z } from "zod";
import { directionSettingSchema, followupAnswerSchema, questionAnalysisSchema, ultimatePromptResultSchema } from "./types";
import type { DirectionSetting, FollowupAnswer, QuestionAnalysis, UltimatePromptResult } from "./types";

export const PROMPT_HISTORY_STORAGE_KEY = "ultimate-question-builder:prompt-history";
const MAX_HISTORY_ITEMS = 20;

export const promptHistorySnapshotSchema = z.object({
  analysis: questionAnalysisSchema,
  directionSettings: z.array(directionSettingSchema).min(1).max(3),
  followupAnswers: z.array(followupAnswerSchema).length(6)
});

export const promptHistoryEntrySchema = promptHistorySnapshotSchema.extend({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  rawQuestion: z.string().trim().min(1),
  result: ultimatePromptResultSchema,
  createdAt: z.string().trim().min(1),
  updatedAt: z.string().trim().min(1)
});

const promptHistoryListSchema = z.array(promptHistoryEntrySchema).max(MAX_HISTORY_ITEMS);

export type PromptHistorySnapshot = z.infer<typeof promptHistorySnapshotSchema>;
export type PromptHistoryEntry = z.infer<typeof promptHistoryEntrySchema>;

type CreatePromptHistoryEntryInput = {
  readonly existingId?: string;
  readonly rawQuestion: string;
  readonly analysis: QuestionAnalysis;
  readonly directionSettings: readonly DirectionSetting[];
  readonly followupAnswers: readonly FollowupAnswer[];
  readonly result: UltimatePromptResult;
  readonly previousEntry?: PromptHistoryEntry;
};

const createHistoryId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const createTitle = (rawQuestion: string) => {
  const compactQuestion = rawQuestion.trim().replace(/\s+/g, " ");
  return compactQuestion.length > 42 ? `${compactQuestion.slice(0, 42)}...` : compactQuestion;
};

export function readPromptHistory(storage: Storage): PromptHistoryEntry[] {
  const rawHistory = storage.getItem(PROMPT_HISTORY_STORAGE_KEY);
  if (!rawHistory) return [];

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawHistory);
  } catch (caught) {
    if (caught instanceof SyntaxError) return [];
    throw caught;
  }
  const parsedHistory = promptHistoryListSchema.safeParse(parsedJson);
  return parsedHistory.success ? parsedHistory.data : [];
}

export function writePromptHistory(storage: Storage, entries: readonly PromptHistoryEntry[]) {
  storage.setItem(PROMPT_HISTORY_STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY_ITEMS)));
}

export function createPromptHistoryEntry(input: CreatePromptHistoryEntryInput): PromptHistoryEntry {
  const now = new Date().toISOString();
  return {
    id: input.existingId ?? createHistoryId(),
    title: createTitle(input.rawQuestion),
    rawQuestion: input.rawQuestion,
    analysis: input.analysis,
    directionSettings: [...input.directionSettings],
    followupAnswers: [...input.followupAnswers],
    result: input.result,
    createdAt: input.previousEntry?.createdAt ?? now,
    updatedAt: now
  };
}

export function upsertPromptHistory(entries: readonly PromptHistoryEntry[], entry: PromptHistoryEntry) {
  return [entry, ...entries.filter((item) => item.id !== entry.id)].slice(0, MAX_HISTORY_ITEMS);
}

export function removePromptHistoryEntry(entries: readonly PromptHistoryEntry[], id: string) {
  return entries.filter((item) => item.id !== id);
}
