import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { STORED_API_KEY_SENTINEL } from "@/lib/apiKeyShared";
import {
  clearPersistedApiKey,
  readPersistedApiKey,
  resolveStoredApiKey,
  setApiKeyStoreFilePathForTests,
  writePersistedApiKey
} from "@/lib/server/apiKeyStore";

describe("apiKeyStore", () => {
  let tempDir = "";

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(tmpdir(), "ultimate-question-builder-"));
    setApiKeyStoreFilePathForTests(path.join(tempDir, "api-key.json"));
  });

  afterEach(async () => {
    setApiKeyStoreFilePathForTests(undefined);
    await rm(tempDir, { recursive: true, force: true });
  });

  it("writes, reads, and clears a persisted API key", async () => {
    await writePersistedApiKey(" sk-test ");

    expect(await readPersistedApiKey()).toBe("sk-test");

    await clearPersistedApiKey();
    expect(await readPersistedApiKey()).toBe("");
  });

  it("resolves sentinel or empty API key values from local persistence", async () => {
    await writePersistedApiKey("sk-stored");

    await expect(resolveStoredApiKey({ apiKey: STORED_API_KEY_SENTINEL, rawQuestion: "질문" })).resolves.toMatchObject({
      apiKey: "sk-stored"
    });
    await expect(resolveStoredApiKey({ rawQuestion: "질문" })).resolves.toMatchObject({
      apiKey: "sk-stored"
    });
  });

  it("keeps a newly provided real API key and refreshes persistence", async () => {
    await writePersistedApiKey("sk-old");

    await expect(resolveStoredApiKey({ apiKey: " sk-new " })).resolves.toMatchObject({ apiKey: "sk-new" });
    expect(await readPersistedApiKey()).toBe("sk-new");
  });
});
