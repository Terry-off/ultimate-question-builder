import { CopyButton } from "./CopyButton";

export function PromptCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="prompt-panel">
      <div className="prompt-panel-header">
        <h3>{title}</h3>
        <CopyButton text={text} />
      </div>
      <pre className="prompt-output">
        {text}
      </pre>
    </div>
  );
}
