import { getFollowupQuestions } from "../followupTemplates";
import { generateFollowupsRequestSchema } from "../types";

type ServiceResult<T> = { ok: true; data: T } | { ok: false; error: string; status: number };

export async function generateFollowups(input: unknown): Promise<ServiceResult<{ followupQuestions: ReturnType<typeof getFollowupQuestions> }>> {
  const parsed = generateFollowupsRequestSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: "질문 유형을 확인해주세요.", status: 400 };
  }

  return { ok: true, data: { followupQuestions: getFollowupQuestions(parsed.data.primaryType) } };
}
