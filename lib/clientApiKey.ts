import { API_KEY_STORAGE_KEY, STORED_API_KEY_SENTINEL, isSharedApiKeyPersistenceEnabled } from "./apiKeyShared";

const hasStoredApiKeyFlag = (value: unknown): value is { hasApiKey: boolean } =>
  typeof value === "object" && value !== null && "hasApiKey" in value && typeof value.hasApiKey === "boolean";

export function readStoredApiKey() {
  try {
    const storedApiKey = window.localStorage.getItem(API_KEY_STORAGE_KEY)?.trim() ?? "";
    return storedApiKey === STORED_API_KEY_SENTINEL ? "" : storedApiKey;
  } catch (caught) {
    if (!(caught instanceof Error)) throw caught;
    return "";
  }
}

export function saveStoredApiKey(value: string) {
  try {
    if (value) {
      window.localStorage.setItem(API_KEY_STORAGE_KEY, value);
    } else {
      window.localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  } catch (caught) {
    if (!(caught instanceof Error)) throw caught;
  }
}

export async function readServerApiKeyState() {
  if (!isSharedApiKeyPersistenceEnabled()) return false;

  const response = await fetch("/api/api-key");
  if (!response.ok) return false;
  const data: unknown = await response.json();
  return hasStoredApiKeyFlag(data) ? data.hasApiKey : false;
}

export async function saveServerApiKey(value: string) {
  if (!isSharedApiKeyPersistenceEnabled()) return;

  await fetch("/api/api-key", {
    method: value ? "POST" : "DELETE",
    headers: { "Content-Type": "application/json" },
    body: value ? JSON.stringify({ apiKey: value }) : undefined
  });
}
