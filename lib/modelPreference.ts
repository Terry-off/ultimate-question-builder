import { OPENAI_MODEL_OPTIONS } from "./openaiModels";
import { DEFAULT_MODEL } from "./types";

export const MODEL_STORAGE_KEY = "ultimate-question-builder:gpt-model";

const isKnownModel = (value: string) => OPENAI_MODEL_OPTIONS.some((option) => option.value === value);

export function readStoredModel() {
  try {
    const storedModel = window.localStorage.getItem(MODEL_STORAGE_KEY)?.trim() ?? "";
    return isKnownModel(storedModel) ? storedModel : DEFAULT_MODEL;
  } catch (caught) {
    if (!(caught instanceof Error)) throw caught;
    return DEFAULT_MODEL;
  }
}

export function saveStoredModel(value: string) {
  try {
    if (isKnownModel(value)) {
      window.localStorage.setItem(MODEL_STORAGE_KEY, value);
    }
  } catch (caught) {
    if (!(caught instanceof Error)) throw caught;
  }
}
