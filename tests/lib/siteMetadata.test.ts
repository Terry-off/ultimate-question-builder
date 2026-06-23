import { describe, expect, it } from "vitest";
import { siteMetadata } from "@/lib/siteMetadata";

describe("site metadata", () => {
  it("exposes Kakao-friendly Open Graph metadata", () => {
    expect(siteMetadata.url).toMatch(/^https:\/\//);
    expect(siteMetadata.name).toBe("RealQuestion");
    expect(siteMetadata.title).toContain("RealQuestion");
    expect(siteMetadata.description.length).toBeGreaterThan(40);
    expect(siteMetadata.openGraphImage.path).toBe("/opengraph-image");
    expect(siteMetadata.openGraphImage.width).toBe(1200);
    expect(siteMetadata.openGraphImage.height).toBe(630);
    expect(siteMetadata.openGraphImage.alt).toContain("궁극의 질문");
  });
});
