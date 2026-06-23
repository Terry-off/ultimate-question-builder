import { describe, expect, it, vi } from "vitest";
import { testApiKey } from "@/lib/server/testApiKey";

describe("testApiKey service", () => {
  it("checks the selected provider and model with a tiny structured request", async () => {
    const requester = vi.fn().mockResolvedValue({ ok: true });

    const result = await testApiKey(
      {
        apiKey: " sk-test ",
        provider: "openai",
        model: "gpt-5.5"
      },
      requester
    );

    expect(result).toEqual({ ok: true, data: { ok: true } });
    expect(requester).toHaveBeenCalledWith(expect.objectContaining({
      apiKey: "sk-test",
      provider: "openai",
      model: "gpt-5.5",
      schemaName: "api_key_test"
    }));
  });

  it("rejects empty API keys before calling the model", async () => {
    const requester = vi.fn();

    const result = await testApiKey({
      apiKey: "",
      provider: "openai",
      model: "gpt-5.5"
    }, requester);

    expect(result.ok).toBe(false);
    expect(requester).not.toHaveBeenCalled();
  });

  it("returns provider-specific API errors", async () => {
    const requester = vi.fn().mockRejectedValue(Object.assign(new Error("invalid key"), { status: 401 }));

    const result = await testApiKey({
      apiKey: "sk-ant-test",
      provider: "anthropic",
      model: "claude-fable-5"
    }, requester);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(401);
      expect(result.error).toContain("Claude API 키");
    }
  });
});
