"use client";

import { KeyRound } from "lucide-react";
import { useRef, useState } from "react";
import {
  MODEL_PROVIDER_IDS,
  MODEL_PROVIDER_LABELS,
  PROVIDER_API_KEY_LABELS,
  PROVIDER_API_KEY_PLACEHOLDERS,
  getModelOptions,
  type ModelProviderId
} from "@/lib/modelProviders";
import { MenuDismissLayer } from "./MenuDismissLayer";
import { useOutsideDismiss } from "./useOutsideDismiss";

type ApiKeyMenuProps = {
  apiKey: string;
  provider: ModelProviderId;
  model: string;
  onProviderChange: (value: ModelProviderId) => void;
  onApiKeyChange: (value: string) => void;
  onModelChange: (value: string) => void;
};

export function ApiKeyMenu({ apiKey, provider, model, onProviderChange, onApiKeyChange, onModelChange }: ApiKeyMenuProps) {
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

  const changeProvider = (nextProvider: ModelProviderId) => {
    setDraftKey("");
    onProviderChange(nextProvider);
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
            <span className="console-label">모델 종류</span>
            <div className="provider-segment" role="group" aria-label="모델 종류">
              {MODEL_PROVIDER_IDS.map((providerId) => (
                <button
                  key={providerId}
                  type="button"
                  onClick={() => changeProvider(providerId)}
                  className={`provider-option ${provider === providerId ? "provider-option-active" : ""}`}
                >
                  {MODEL_PROVIDER_LABELS[providerId]}
                </button>
              ))}
            </div>
            <label className="console-label" htmlFor="api-key-input">
              {PROVIDER_API_KEY_LABELS[provider]}
            </label>
            <input
              id="api-key-input"
              aria-label={PROVIDER_API_KEY_LABELS[provider]}
              type="password"
              value={draftKey}
              onChange={(event) => setDraftKey(event.target.value)}
              className="api-input api-key-input"
              placeholder={apiKey ? "API키는 사용자의 로컬에 독립 저장됩니다." : PROVIDER_API_KEY_PLACEHOLDERS[provider]}
            />
            <label className="console-label mt-4" htmlFor="model-select">
              모델
            </label>
            <select
              id="model-select"
              aria-label={`${MODEL_PROVIDER_LABELS[provider]} 모델`}
              value={model}
              onChange={(event) => onModelChange(event.target.value)}
              className="api-input"
            >
              {getModelOptions(provider).map((option) => (
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
