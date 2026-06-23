import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { STORED_API_KEY_SENTINEL, isSharedApiKeyPersistenceEnabled } from "@/lib/apiKeyShared";
import { DEFAULT_PROVIDER, MODEL_PROVIDER_IDS, isModelProviderId, type ModelProviderId } from "@/lib/modelProviders";

type StoredApiKey = {
  apiKey?: string;
  keys?: Partial<Record<ModelProviderId, string>>;
  updatedAt: string;
};

let testStoreFilePath: string | undefined;

export function setApiKeyStoreFilePathForTests(filePath: string | undefined) {
  testStoreFilePath = filePath;
}

const getStoreFilePath = () =>
  testStoreFilePath ??
  path.join(/* turbopackIgnore: true */ process.cwd(), "data", "ultimate-question-builder", "openai-api-key.json");

const cleanApiKey = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const readProvider = (value: unknown): ModelProviderId => {
  const provider = typeof value === "string" ? value.trim() : "";
  return isModelProviderId(provider) ? provider : DEFAULT_PROVIDER;
};

const readStoredPayload = async (): Promise<StoredApiKey> => {
  try {
    const raw = await readFile(/* turbopackIgnore: true */ getStoreFilePath(), "utf8");
    return JSON.parse(raw) as StoredApiKey;
  } catch {
    return { keys: {}, updatedAt: new Date(0).toISOString() };
  }
};

export function isRealApiKey(value: unknown) {
  const apiKey = cleanApiKey(value);
  return Boolean(apiKey && apiKey !== STORED_API_KEY_SENTINEL);
}

export async function readPersistedApiKey(provider: ModelProviderId = DEFAULT_PROVIDER) {
  if (!isSharedApiKeyPersistenceEnabled()) return "";

  const parsed = await readStoredPayload();
  const providerKey = cleanApiKey(parsed.keys?.[provider]);
  if (providerKey) return providerKey;
  return provider === "openai" ? cleanApiKey(parsed.apiKey) : "";
}

export async function writePersistedApiKey(value: string, provider: ModelProviderId = DEFAULT_PROVIDER) {
  if (!isSharedApiKeyPersistenceEnabled()) return;

  const apiKey = cleanApiKey(value);
  if (!apiKey) return clearPersistedApiKey(provider);

  const filePath = getStoreFilePath();
  const current = await readStoredPayload();
  const keys = { ...current.keys, [provider]: apiKey };
  if (current.apiKey && !keys.openai) keys.openai = cleanApiKey(current.apiKey);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(
    /* turbopackIgnore: true */ filePath,
    JSON.stringify({ keys, updatedAt: new Date().toISOString() }, null, 2),
    "utf8"
  );
}

export async function clearPersistedApiKey(provider: ModelProviderId = DEFAULT_PROVIDER) {
  if (!isSharedApiKeyPersistenceEnabled()) return;

  const current = await readStoredPayload();
  const keys = { ...current.keys };
  if (current.apiKey && !keys.openai) keys.openai = cleanApiKey(current.apiKey);
  delete keys[provider];
  const hasRemainingKey = MODEL_PROVIDER_IDS.some((item) => Boolean(cleanApiKey(keys[item])));

  if (!hasRemainingKey) {
    await rm(/* turbopackIgnore: true */ getStoreFilePath(), { force: true });
    return;
  }

  const filePath = getStoreFilePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(
    /* turbopackIgnore: true */ filePath,
    JSON.stringify({ keys, updatedAt: new Date().toISOString() }, null, 2),
    "utf8"
  );
}

export async function resolveStoredApiKey<T extends Record<string, unknown>>(body: T): Promise<T> {
  const provider = readProvider(body.provider);
  if (isRealApiKey(body.apiKey)) {
    const apiKey = cleanApiKey(body.apiKey);
    await writePersistedApiKey(apiKey, provider);
    return { ...body, provider, apiKey };
  }

  const persistedApiKey = await readPersistedApiKey(provider);
  if (!persistedApiKey) return { ...body, provider };

  return { ...body, provider, apiKey: persistedApiKey };
}
