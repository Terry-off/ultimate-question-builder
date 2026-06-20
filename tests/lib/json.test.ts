import { describe, expect, it } from "vitest";
import { extractOutputText, parseJsonObject } from "@/lib/json";

describe("json helpers", () => {
  it("parses a JSON object string", () => {
    expect(parseJsonObject('{"ok":true}')).toEqual({ ok: true });
  });

  it("rejects JSON arrays", () => {
    expect(() => parseJsonObject("[1,2,3]")).toThrow("Expected a JSON object");
  });

  it("extracts output_text from an OpenAI-like response", () => {
    expect(extractOutputText({ output_text: '{"ok":true}' })).toBe('{"ok":true}');
  });

  it("extracts text from nested response output content", () => {
    const response = {
      output: [
        {
          content: [
            { type: "output_text", text: '{"nested":true}' }
          ]
        }
      ]
    };

    expect(extractOutputText(response)).toBe('{"nested":true}');
  });
});
