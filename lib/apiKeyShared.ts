import { DEFAULT_PROVIDER, type ModelProviderId } from "./modelProviders";

export const API_KEY_STORAGE_KEY = "ultimate-question-builder:openai-api-key";
const API_KEY_STORAGE_PREFIX = "ultimate-question-builder:api-key:";
export const STORED_API_KEY_SENTINEL = "__ultimate_question_builder_stored_api_key__";

export const getApiKeyStorageKey = (provider: ModelProviderId = DEFAULT_PROVIDER) =>
  provider === "openai" ? API_KEY_STORAGE_KEY : `${API_KEY_STORAGE_PREFIX}${provider}`;

export const isSharedApiKeyPersistenceEnabled = () =>
  process.env.NEXT_PUBLIC_SHARED_API_KEY_PERSISTENCE === "true" || process.env.NODE_ENV !== "production";
