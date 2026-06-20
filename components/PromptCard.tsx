import { CopyButton } from "./CopyButton";

export function PromptCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-semibold">{title}</h3>
        <CopyButton text={text} />
      </div>
      <pre className="max-h-[560px] overflow-auto whitespace-pre-wrap rounded-lg border border-line bg-white p-5 font-sans leading-7 text-ink">
        {text}
      </pre>
    </div>
  );
}
