import { describe, expect, it } from "vitest";
import { DEFAULT_MODEL } from "@/lib/types";
import { MODEL_PROVIDER_STORAGE_KEY, MODEL_STORAGE_KEY, readStoredModel, readStoredProvider, saveStoredModel, saveStoredProvider } from "@/lib/modelPreference";

describe("model preference storage", () => {
  it("saves and reads a known GPT model", () => {
    saveStoredModel("gpt-5.5-pro");

    expect(localStorage.getItem(MODEL_STORAGE_KEY)).toBe("gpt-5.5-pro");
    expect(readStoredModel()).toBe("gpt-5.5-pro");
  });

  it("falls back to the default model for unknown saved values", () => {
    localStorage.setItem(MODEL_STORAGE_KEY, "unknown-model");

    expect(readStoredModel()).toBe(DEFAULT_MODEL);
  });

  it("saves provider and provider-specific model separately", () => {
    saveStoredProvider("anthropic");
    saveStoredModel("anthropic", "claude-opus-4-8");

    expect(localStorage.getItem(MODEL_PROVIDER_STORAGE_KEY)).toBe("anthropic");
    expect(readStoredProvider()).toBe("anthropic");
    expect(readStoredModel("anthropic")).toBe("claude-opus-4-8");
    expect(readStoredModel("openai")).toBe(DEFAULT_MODEL);
  });
});
