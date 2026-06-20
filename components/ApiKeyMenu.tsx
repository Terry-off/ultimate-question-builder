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

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm"
      >
        <KeyRound size={16} />
        {apiKey ? "API 키 설정됨" : "API 키"}
      </button>
      {open ? (
        <div className="absolute right-0 z-10 mt-2 w-80 rounded-lg border border-line bg-white p-4 shadow-xl">
          <label className="block text-sm font-medium" htmlFor="api-key-input">
            OpenAI API 키
          </label>
          <input
            id="api-key-input"
            aria-label="OpenAI API 키"
            type="password"
            value={draftKey}
            onChange={(event) => setDraftKey(event.target.value)}
            className="mt-2 w-full rounded-md border border-line px-3 py-2"
            placeholder="sk-..."
          />
          <label className="mt-4 block text-sm font-medium" htmlFor="model-input">
            모델
          </label>
          <input
            id="model-input"
            value={model}
            onChange={(event) => onModelChange(event.target.value)}
            className="mt-2 w-full rounded-md border border-line px-3 py-2"
          />
          <p className="mt-3 text-xs text-gray-500">키는 현재 탭 메모리에만 유지되며 새로고침하면 사라집니다.</p>
          <button
            type="button"
            onClick={() => {
              onApiKeyChange(draftKey.trim());
              setDraftKey("");
              setOpen(false);
            }}
            className="mt-4 w-full rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white"
          >
            적용
          </button>
        </div>
      ) : null}
    </div>
  );
}
