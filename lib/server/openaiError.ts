type ServiceError = {
  error: string;
  status: number;
};

type ProviderName = "openai" | "anthropic" | "google";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readStatus = (error: Error) => {
  const record = error as Error & Record<string, unknown>;
  const status = record.status ?? record.statusCode;
  return typeof status === "number" ? status : undefined;
};

const normalizeStatus = (status: number) => (status >= 400 && status <= 599 ? status : 502);

const providerLabel: Record<ProviderName, string> = {
  openai: "OpenAI",
  anthropic: "Claude",
  google: "Gemini"
};

const modelFamilyLabel: Record<ProviderName, string> = {
  openai: "GPT",
  anthropic: "Claude",
  google: "Gemini"
};

const messageForStatus = (status: number, provider: ProviderName) => {
  const apiLabel = providerLabel[provider];
  const modelLabel = modelFamilyLabel[provider];

  if (status === 401) return `${apiLabel} API 키가 맞는지 확인해주세요.`;
  if (status === 403) return `${apiLabel} API 키 권한을 확인해주세요.`;
  if (status === 404) return `선택한 ${modelLabel} 모델을 사용할 수 없어요. 모델을 바꿔 다시 시도해주세요.`;
  if (status === 429) return `${apiLabel} API 사용량 제한에 걸렸어요. 잠시 뒤 다시 시도해주세요.`;
  if (status >= 500) return `${apiLabel} 응답이 불안정해요. 잠시 뒤 다시 시도해주세요.`;
  return `${apiLabel} 요청을 처리하지 못했어요. API 키와 선택한 모델을 확인해주세요.`;
};

export function getModelRequestError(caught: unknown, provider: ProviderName = "openai"): ServiceError | null {
  if (!(caught instanceof Error)) return null;

  const status = readStatus(caught);
  if (typeof status === "number") {
    const normalizedStatus = normalizeStatus(status);
    return {
      status: normalizedStatus,
      error: messageForStatus(normalizedStatus, provider)
    };
  }

  if (!isRecord(caught)) return null;

  if (caught.name === "APIConnectionError") {
    return {
      status: 502,
      error: `${providerLabel[provider]} 연결이 불안정해요. 잠시 뒤 다시 시도해주세요.`
    };
  }

  return null;
}

export function getOpenAIRequestError(caught: unknown): ServiceError | null {
  return getModelRequestError(caught, "openai");
}
