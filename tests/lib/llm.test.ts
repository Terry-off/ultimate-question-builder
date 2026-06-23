import { z } from "zod";
import { describe, expect, it, vi } from "vitest";
import { requestStructuredOutput } from "@/lib/llm";

describe("OpenAI structured output wrapper", () => {
  it("sends a Responses API request with text.format JSON schema", async () => {
    const create = vi.fn().mockResolvedValue({ output_text: '{"ok":true}' });
    const clientFactory = () => ({ responses: { create } });

    const result = await requestStructuredOutput({
      apiKey: "sk-test",
      model: "gpt-5.5",
      prompt: "Return JSON",
      schemaName: "test_schema",
      jsonSchema: {
        type: "object",
        additionalProperties: false,
        properties: { ok: { type: "boolean" } },
        required: ["ok"]
      },
      schema: z.object({ ok: z.boolean() }),
      clientFactory
    });

    expect(result).toEqual({ ok: true });
    expect(create).toHaveBeenCalledWith({
      model: "gpt-5.5",
      input: "Return JSON",
      reasoning: { effort: "medium" },
      text: {
        format: {
          type: "json_schema",
          name: "test_schema",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: { ok: { type: "boolean" } },
            required: ["ok"]
          }
        }
      }
    });
  });

  it("throws when structured output fails Zod validation", async () => {
    const clientFactory = () => ({
      responses: {
        create: vi.fn().mockResolvedValue({ output_text: '{"ok":"wrong"}' })
      }
    });

    await expect(
      requestStructuredOutput({
        apiKey: "sk-test",
        model: "gpt-5.5",
        prompt: "Return JSON",
        schemaName: "test_schema",
        jsonSchema: {
          type: "object",
          additionalProperties: false,
          properties: { ok: { type: "boolean" } },
          required: ["ok"]
        },
        schema: z.object({ ok: z.boolean() }),
        clientFactory
      })
    ).rejects.toThrow();
  });

  it("sends Claude requests with JSON schema output config", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      content: [{ type: "text", text: "{\"ok\":true}" }]
    }), { status: 200 }));

    const result = await requestStructuredOutput({
      apiKey: "sk-ant-test",
      provider: "anthropic",
      model: "claude-fable-5",
      prompt: "Return JSON",
      schemaName: "test_schema",
      jsonSchema: {
        type: "object",
        additionalProperties: false,
        properties: { ok: { type: "boolean" } },
        required: ["ok"]
      },
      schema: z.object({ ok: z.boolean() }),
      fetcher
    });

    expect(result).toEqual({ ok: true });
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.anthropic.com/v1/messages",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-api-key": "sk-ant-test" }),
        body: expect.stringContaining("claude-fable-5")
      })
    );
  });

  it("sends Gemini requests with response schema", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: "{\"ok\":true}" }] } }]
    }), { status: 200 }));

    const result = await requestStructuredOutput({
      apiKey: "AIza-test",
      provider: "google",
      model: "gemini-3.5-flash",
      prompt: "Return JSON",
      schemaName: "test_schema",
      jsonSchema: {
        type: "object",
        additionalProperties: false,
        properties: { ok: { type: "boolean" } },
        required: ["ok"]
      },
      schema: z.object({ ok: z.boolean() }),
      fetcher
    });

    expect(result).toEqual({ ok: true });
    expect(fetcher).toHaveBeenCalledWith(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-goog-api-key": "AIza-test" }),
        body: expect.stringContaining("responseSchema")
      })
    );
  });
});
