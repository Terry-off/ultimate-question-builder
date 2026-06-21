const followupQuestionJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    id: { type: "string" },
    purpose: { type: "string" },
    intent: { type: "string" },
    question: { type: "string" },
    choices: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 }
  },
  required: ["id", "purpose", "intent", "question", "choices"]
} as const;

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
    recommendedFollowupFocus: { type: "array", items: { type: "string" }, maxItems: 6 },
    recommendedTypeOptions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          type: { type: "string" },
          reason: { type: "string" }
        },
        required: ["type", "reason"]
      },
      minItems: 1,
      maxItems: 3
    },
    followupQuestions: {
      type: "array",
      items: followupQuestionJsonSchema,
      minItems: 6,
      maxItems: 6
    }
  },
  required: [
    "primaryType",
    "secondaryTypes",
    "confidence",
    "surfaceQuestion",
    "deeperIntent",
    "genericAnswerRisk",
    "missingDimensions",
    "recommendedFollowupFocus",
    "recommendedTypeOptions",
    "followupQuestions"
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
