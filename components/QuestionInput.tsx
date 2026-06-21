"use client";

export type QuestionInputProps = {
  rawQuestion: string;
  error?: string;
  loading?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function QuestionInput({ rawQuestion, error, loading = false, onChange, onSubmit }: QuestionInputProps) {
  return (
    <section className="question-console">
      <div className="console-input-wrap">
        <label className="sr-only" htmlFor="raw-question">
          AI에게 묻고 싶은 질문
        </label>
        <textarea
          id="raw-question"
          value={rawQuestion}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="console-textarea"
          placeholder="무엇을 묻고 싶나요?"
        />
      </div>
      {error ? <p className="console-error">{error}</p> : null}
      <button
        type="button"
        disabled={loading}
        onClick={onSubmit}
        className="primary-action"
      >
        {loading ? "분석 중..." : "시작"}
      </button>
    </section>
  );
}
