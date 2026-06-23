import { STORED_API_KEY_SENTINEL, getApiKeyStorageKey, isSharedApiKeyPersistenceEnabled } from "./apiKeyShared";
import { DEFAULT_PROVIDER, type ModelProviderId } from "./modelProviders";
import { postJson } from "./postJson";

const hasStoredApiKeyFlag = (value: unknown): value is { hasApiKey: boolean } =>
  typeof value === "object" && value !== null && "hasApiKey" in value && typeof value.hasApiKey === "boolean";

export function readStoredApiKey(provider: ModelProviderId = DEFAULT_PROVIDER) {
  try {
    const storedApiKey = window.localStorage.getItem(getApiKeyStorageKey(provider))?.trim() ?? "";
    return storedApiKey === STORED_API_KEY_SENTINEL ? "" : storedApiKey;
  } catch (caught) {
    if (!(caught instanceof Error)) throw caught;
    return "";
  }
}

export function saveStoredApiKey(provider: ModelProviderId, value: string): void;
export function saveStoredApiKey(value: string): void;
export function saveStoredApiKey(providerOrValue: ModelProviderId | string, value?: string) {
  const provider = value !== undefined ? (providerOrValue as ModelProviderId) : DEFAULT_PROVIDER;
  const apiKey = value ?? providerOrValue;

  try {
    if (apiKey) {
      window.localStorage.setItem(getApiKeyStorageKey(provider), apiKey);
    } else {
      window.localStorage.removeItem(getApiKeyStorageKey(provider));
    }
  } catch (caught) {
    if (!(caught instanceof Error)) throw caught;
  }
}

export async function readServerApiKeyState(provider: ModelProviderId = DEFAULT_PROVIDER) {
  if (!isSharedApiKeyPersistenceEnabled()) return false;

  const response = await fetch(`/api/api-key?provider=${provider}`);
  if (!response.ok) return false;
  const data: unknown = await response.json();
  return hasStoredApiKeyFlag(data) ? data.hasApiKey : false;
}

export async function saveServerApiKey(provider: ModelProviderId, value: string): Promise<void>;
export async function saveServerApiKey(value: string): Promise<void>;
export async function saveServerApiKey(providerOrValue: ModelProviderId | string, value?: string) {
  if (!isSharedApiKeyPersistenceEnabled()) return;
  const provider = value !== undefined ? (providerOrValue as ModelProviderId) : DEFAULT_PROVIDER;
  const apiKey = value ?? providerOrValue;

  await fetch(`/api/api-key?provider=${provider}`, {
    method: apiKey ? "POST" : "DELETE",
    headers: { "Content-Type": "application/json" },
    body: apiKey ? JSON.stringify({ provider, apiKey }) : undefined
  });
}

export async function testApiKeyConnection(provider: ModelProviderId, model: string, apiKey: string) {
  await postJson("/api/test-api-key", { provider, model, apiKey });
}
