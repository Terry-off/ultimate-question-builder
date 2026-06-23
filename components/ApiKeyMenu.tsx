"use client";

import { KeyRound } from "lucide-react";
import { useRef, useState } from "react";
import { OPENAI_MODEL_OPTIONS } from "@/lib/openaiModels";
import { MenuDismissLayer } from "./MenuDismissLayer";
import { useOutsideDismiss } from "./useOutsideDismiss";

type ApiKeyMenuProps = {
  apiKey: string;
  model: string;
  onApiKeyChange: (value: string) => void;
  onModelChange: (value: string) => void;
};

export function ApiKeyMenu({ apiKey, model, onApiKeyChange, onModelChange }: ApiKeyMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [draftKey, setDraftKey] = useState("");
  useOutsideDismiss(menuRef, open, () => setOpen(false));

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
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="topbar-button"
      >
        <KeyRound size={16} />
        {apiKey ? "API 키 설정됨" : "API 키"}
      </button>
      {open ? (
        <>
          <MenuDismissLayer onDismiss={() => setOpen(false)} />
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
              className="api-input api-key-input"
              placeholder={apiKey ? "API키는 사용자의 로컬에 독립 저장됩니다." : "sk-..."}
            />
            <label className="console-label mt-4" htmlFor="model-select">
              모델
            </label>
            <select
              id="model-select"
              aria-label="GPT 모델"
              value={model}
              onChange={(event) => onModelChange(event.target.value)}
              className="api-input"
            >
              {OPENAI_MODEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
        </>
      ) : null}
    </div>
  );
}
