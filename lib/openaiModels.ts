import { DEFAULT_MODEL } from "./types";

export const OPENAI_MODEL_OPTIONS = [
  { value: DEFAULT_MODEL, label: "GPT-5.5" },
  { value: "gpt-5.5-pro", label: "GPT-5.5 Pro" },
  { value: "gpt-5.4", label: "GPT-5.4" },
  { value: "gpt-5.1", label: "GPT-5.1" },
  { value: "gpt-4.1", label: "GPT-4.1" }
] as const;
