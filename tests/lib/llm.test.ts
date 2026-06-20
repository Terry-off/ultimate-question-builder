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
});
