"use client";

import { KeyRound } from "lucide-react";
import { useState } from "react";

type ApiKeyMenuProps = {
  apiKey: string;
  model: string;
  onApiKeyChange: (value: string) => void;
  onModelChange: (value: string) => void;
};

export function ApiKeyMenu({ apiKey, model, onApiKeyChange, onModelChange }: ApiKeyMenuProps) {
  const [open, setOpen] = useState(false);
  const [draftKey, setDraftKey] = useState("");

  const applyKey = () => {
    const nextKey = draftKey.trim();
    if (nextKey) {
      onApiKeyChange(nextKey);
    }
    setDraftKey("");
    setOpen(false);
  };

  const clearKey = () => {
    onApiKeyChange("");
    setDraftKey("");
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="topbar-button"
      >
        <KeyRound size={16} />
        {apiKey ? "API 키 설정됨" : "API 키"}
      </button>
      {open ? (
        <div className="api-popover">
          <label className="console-label" htmlFor="api-key-input">
            OpenAI API 키
          </label>
          <input
            id="api-key-input"
            aria-label="OpenAI API 키"
            type="password"
            value={draftKey}
            onChange={(event) => setDraftKey(event.target.value)}
            className="api-input"
            placeholder={apiKey ? "새 키를 입력하면 바뀝니다" : "sk-..."}
          />
          <label className="console-label mt-4" htmlFor="model-input">
            모델
          </label>
          <input
            id="model-input"
            value={model}
            onChange={(event) => onModelChange(event.target.value)}
            className="api-input"
          />
          <button
            type="button"
            onClick={applyKey}
            className="primary-action w-full"
          >
            적용
          </button>
          {apiKey ? (
            <button
              type="button"
              onClick={clearKey}
              className="ghost-action ghost-action-dark mt-2 w-full"
            >
              저장된 키 삭제
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
