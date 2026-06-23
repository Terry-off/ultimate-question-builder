import {
  DEFAULT_PROVIDER,
  getDefaultModelForProvider,
  isKnownProviderModel,
  isModelProviderId,
  type ModelProviderId
} from "./modelProviders";

export const MODEL_PROVIDER_STORAGE_KEY = "ultimate-question-builder:model-provider";
export const MODEL_STORAGE_KEY = "ultimate-question-builder:gpt-model";
const MODEL_STORAGE_PREFIX = "ultimate-question-builder:model:";

const getProviderModelStorageKey = (provider: ModelProviderId) =>
  provider === "openai" ? MODEL_STORAGE_KEY : `${MODEL_STORAGE_PREFIX}${provider}`;

export function readStoredProvider() {
  try {
    const storedProvider = window.localStorage.getItem(MODEL_PROVIDER_STORAGE_KEY)?.trim() ?? "";
    return isModelProviderId(storedProvider) ? storedProvider : DEFAULT_PROVIDER;
  } catch (caught) {
    if (!(caught instanceof Error)) throw caught;
    return DEFAULT_PROVIDER;
  }
}

export function saveStoredProvider(value: ModelProviderId) {
  try {
    window.localStorage.setItem(MODEL_PROVIDER_STORAGE_KEY, value);
  } catch (caught) {
    if (!(caught instanceof Error)) throw caught;
  }
}

export function readStoredModel(provider: ModelProviderId = DEFAULT_PROVIDER) {
  try {
    const storedModel = window.localStorage.getItem(getProviderModelStorageKey(provider))?.trim() ?? "";
    return isKnownProviderModel(provider, storedModel) ? storedModel : getDefaultModelForProvider(provider);
  } catch (caught) {
    if (!(caught instanceof Error)) throw caught;
    return getDefaultModelForProvider(provider);
  }
}

export function saveStoredModel(provider: ModelProviderId, value: string): void;
export function saveStoredModel(value: string): void;
export function saveStoredModel(providerOrValue: ModelProviderId | string, value?: string) {
  const provider = value ? (providerOrValue as ModelProviderId) : DEFAULT_PROVIDER;
  const model = value ?? providerOrValue;

  try {
    if (isKnownProviderModel(provider, model)) {
      window.localStorage.setItem(getProviderModelStorageKey(provider), model);
    }
  } catch (caught) {
    if (!(caught instanceof Error)) throw caught;
  }
}
