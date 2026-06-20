export const questionAnalysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    primaryType: { type: "string" },
    secondaryTypes: { type: "array", items: { type: "string" }, maxItems: 2 },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    surfaceQuestion: { type: "string" },
    deeperIntent: { type: "string" },
    genericAnswerRisk: { type: "string" },
    missingDimensions: { type: "array", items: { type: "string" }, maxItems: 8 },
    recommendedFollowupFocus: { type: "array", items: { type: "string" }, maxItems: 5 }
  },
  required: [
    "primaryType",
    "secondaryTypes",
    "confidence",
    "surfaceQuestion",
    "deeperIntent",
    "genericAnswerRisk",
    "missingDimensions",
    "recommendedFollowupFocus"
  ]
} as const;

export const ultimatePromptResultJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    shortVersion: { type: "string" },
    deepVersion: { type: "string" },
    expertVersion: { type: "string" },
    whyThisPromptIsStrong: { type: "array", items: { type: "string" }, minItems: 1 },
    improvementSuggestions: { type: "array", items: { type: "string" } }
  },
  required: ["shortVersion", "deepVersion", "expertVersion", "whyThisPromptIsStrong", "improvementSuggestions"]
} as const;
