import { CopyButton } from "./CopyButton";

type PromptCardProps = {
  readonly title: string;
  readonly text: string;
  readonly editable?: boolean;
  readonly onTextChange?: (value: string) => void;
};

export function PromptCard({ title, text, editable = false, onTextChange }: PromptCardProps) {
  return (
    <div className={`prompt-panel ${editable ? "prompt-panel-editing" : ""}`}>
      <div className="prompt-panel-header">
        <h3>{title}</h3>
        <CopyButton text={text} />
      </div>
      {editable ? (
        <textarea
          aria-label={`${title} 본문 수정`}
          value={text}
          onChange={(event) => onTextChange?.(event.target.value)}
          className="prompt-output prompt-editor"
        />
      ) : (
        <pre className="prompt-output">
          {text}
        </pre>
      )}
    </div>
  );
}
