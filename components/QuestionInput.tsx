"use client";

export type QuestionInputProps = {
  rawQuestion: string;
  disabled: boolean;
  error?: string;
  loading?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function QuestionInput({ rawQuestion, disabled, error, loading = false, onChange, onSubmit }: QuestionInputProps) {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-accent">Step 1</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-normal text-ink">AI에게 묻고 싶은 질문을 입력하세요</h1>
        <p className="mt-3 max-w-2xl text-base text-gray-600">
          평범한 질문을 AI의 최대 사고 능력을 끌어내는 궁극 질문으로 바꿔드립니다.
        </p>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="raw-question">
          AI에게 묻고 싶은 질문
        </label>
        <textarea
          id="raw-question"
          value={rawQuestion}
          onChange={(event) => onChange(event.target.value)}
          rows={8}
          className="w-full resize-y rounded-lg border border-line bg-white p-4 leading-7 outline-none focus:border-accent"
          placeholder={"예: 이 사업 아이디어 괜찮을까?\n예: AI 시대에 어떤 직업이 유리할까?\n예: 내 콘텐츠가 왜 반응이 없을까?\n예: 이런 앱을 어떻게 만들 수 있을까?"}
        />
      </div>
      {disabled ? <p className="text-sm text-gray-600">API 키를 먼저 입력하면 분석을 시작할 수 있습니다.</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="button"
        disabled={loading}
        onClick={onSubmit}
        className="rounded-md bg-accent px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "분석 중..." : "질문 분석하기"}
      </button>
    </section>
  );
}
