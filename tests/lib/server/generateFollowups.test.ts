import { describe, expect, it } from "vitest";
import { generateFollowups } from "@/lib/server/generateFollowups";

describe("generateFollowups service", () => {
  it("returns six strategy business questions", async () => {
    const result = await generateFollowups({ primaryType: "strategy_business" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.followupQuestions).toHaveLength(6);
      expect(result.data.followupQuestions[0].purpose).toBe("goal");
    }
  });

  it("rejects unknown primary types", async () => {
    const result = await generateFollowups({ primaryType: "unknown" });

    expect(result.ok).toBe(false);
  });
});
