export const MODEL_PROVIDER_IDS = ["openai", "anthropic", "google"] as const;

export type ModelProviderId = (typeof MODEL_PROVIDER_IDS)[number];

export type ModelOption = {
  readonly value: string;
  readonly label: string;
};

export const DEFAULT_PROVIDER: ModelProviderId = "openai";
export const DEFAULT_MODEL_BY_PROVIDER: Record<ModelProviderId, string> = {
  openai: "gpt-5.5",
  anthropic: "claude-fable-5",
  google: "gemini-3.5-flash"
};

export const MODEL_PROVIDER_LABELS: Record<ModelProviderId, string> = {
  openai: "GPT",
  anthropic: "CLAUDE",
  google: "GEMINI"
};

export const PROVIDER_API_KEY_LABELS: Record<ModelProviderId, string> = {
  openai: "OpenAI API 키",
  anthropic: "Claude API 키",
  google: "Gemini API 키"
};

export const PROVIDER_API_KEY_PLACEHOLDERS: Record<ModelProviderId, string> = {
  openai: "sk-...",
  anthropic: "sk-ant-...",
  google: "AIza..."
};

export const MODEL_OPTIONS_BY_PROVIDER: Record<ModelProviderId, readonly ModelOption[]> = {
  openai: [
    { value: "gpt-5.5", label: "GPT-5.5" },
    { value: "gpt-5.5-pro", label: "GPT-5.5 Pro" },
    { value: "gpt-5.4", label: "GPT-5.4" },
    { value: "gpt-5.1", label: "GPT-5.1" },
    { value: "gpt-4.1", label: "GPT-4.1" }
  ],
  anthropic: [
    { value: "claude-fable-5", label: "Claude Fable 5" },
    { value: "claude-opus-4-8", label: "Claude Opus 4.8" },
    { value: "claude-opus-4-7", label: "Claude Opus 4.7" },
    { value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
    { value: "claude-haiku-4-5", label: "Claude Haiku 4.5" }
  ],
  google: [
    { value: "gemini-3.5-flash", label: "Gemini 3.5 Flash" },
    { value: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro Preview" },
    { value: "gemini-3-flash-preview", label: "Gemini 3 Flash Preview" },
    { value: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash-Lite" },
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" }
  ]
};

export const isModelProviderId = (value: string): value is ModelProviderId =>
  MODEL_PROVIDER_IDS.includes(value as ModelProviderId);

export const getModelOptions = (provider: ModelProviderId) => MODEL_OPTIONS_BY_PROVIDER[provider];

export const isKnownProviderModel = (provider: ModelProviderId, model: string) =>
  getModelOptions(provider).some((option) => option.value === model);

export const getDefaultModelForProvider = (provider: ModelProviderId) => DEFAULT_MODEL_BY_PROVIDER[provider];

export const getProviderLabel = (provider: ModelProviderId = DEFAULT_PROVIDER) => MODEL_PROVIDER_LABELS[provider];

export const getModelLabel = (provider: ModelProviderId = DEFAULT_PROVIDER, model = getDefaultModelForProvider(provider)) =>
  getModelOptions(provider).find((option) => option.value === model)?.label ?? model;
