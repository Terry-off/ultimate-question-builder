const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

export async function postJson(url: string, body: unknown): Promise<unknown> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data: unknown = await response.json();

  if (!response.ok) {
    const message = isRecord(data) && typeof data.error === "string" ? data.error : "요청에 실패했습니다.";
    throw new Error(message);
  }

  return data;
}
