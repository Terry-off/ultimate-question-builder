import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { STORED_API_KEY_SENTINEL, isSharedApiKeyPersistenceEnabled } from "@/lib/apiKeyShared";

type StoredApiKey = {
  apiKey: string;
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

export function isRealApiKey(value: unknown) {
  const apiKey = cleanApiKey(value);
  return Boolean(apiKey && apiKey !== STORED_API_KEY_SENTINEL);
}

export async function readPersistedApiKey() {
  if (!isSharedApiKeyPersistenceEnabled()) return "";

  try {
    const raw = await readFile(/* turbopackIgnore: true */ getStoreFilePath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<StoredApiKey>;
    return cleanApiKey(parsed.apiKey);
  } catch {
    return "";
  }
}

export async function writePersistedApiKey(value: string) {
  if (!isSharedApiKeyPersistenceEnabled()) return;

  const apiKey = cleanApiKey(value);
  if (!apiKey) return clearPersistedApiKey();

  const filePath = getStoreFilePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(/* turbopackIgnore: true */ filePath, JSON.stringify({ apiKey, updatedAt: new Date().toISOString() }, null, 2), "utf8");
}

export async function clearPersistedApiKey() {
  if (!isSharedApiKeyPersistenceEnabled()) return;

  await rm(/* turbopackIgnore: true */ getStoreFilePath(), { force: true });
}

export async function resolveStoredApiKey<T extends Record<string, unknown>>(body: T): Promise<T> {
  if (isRealApiKey(body.apiKey)) {
    const apiKey = cleanApiKey(body.apiKey);
    await writePersistedApiKey(apiKey);
    return { ...body, apiKey };
  }

  const persistedApiKey = await readPersistedApiKey();
  if (!persistedApiKey) return body;

  return { ...body, apiKey: persistedApiKey };
}
