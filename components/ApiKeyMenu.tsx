"use client";

import { KeyRound } from "lucide-react";
import { useRef, useState } from "react";
import {
  MODEL_PROVIDER_IDS,
  MODEL_PROVIDER_LABELS,
  PROVIDER_API_KEY_LABELS,
  PROVIDER_API_KEY_PLACEHOLDERS,
  getModelLabel,
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
  onApiKeyTest: (value: string) => Promise<void>;
  onModelChange: (value: string) => void;
};

type ApiKeyTestState = "idle" | "testing" | "success" | "error";

export function ApiKeyMenu({
  apiKey,
  provider,
  model,
  onProviderChange,
  onApiKeyChange,
  onApiKeyTest,
  onModelChange
}: ApiKeyMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [draftKey, setDraftKey] = useState("");
  const [testedKey, setTestedKey] = useState("");
  const [testState, setTestState] = useState<ApiKeyTestState>("idle");
  const [testMessage, setTestMessage] = useState<string | undefined>();
  useOutsideDismiss(menuRef, open, () => setOpen(false));
  const isConfigured = Boolean(apiKey);
  const statusLabel = isConfigured ? `${getModelLabel(provider, model)} 작동중` : "API등록";
  const trimmedDraftKey = draftKey.trim();

  const resetTestState = () => {
    setTestedKey("");
    setTestState("idle");
    setTestMessage(undefined);
  };

  const updateDraftKey = (value: string) => {
    setDraftKey(value);
    resetTestState();
  };

  const applyKey = () => {
    const nextKey = draftKey.trim();
    if (nextKey) {
      if (testState !== "success" || testedKey !== nextKey) {
        setTestState("error");
        setTestMessage("먼저 TEST로 API 키가 작동하는지 확인해주세요.");
        return;
      }
      onApiKeyChange(nextKey);
    }
    setDraftKey("");
    resetTestState();
    setOpen(false);
  };

  const clearKey = () => {
    onApiKeyChange("");
    setDraftKey("");
    resetTestState();
    setOpen(false);
  };

  const changeProvider = (nextProvider: ModelProviderId) => {
    setDraftKey("");
    resetTestState();
    onProviderChange(nextProvider);
  };

  const changeModel = (nextModel: string) => {
    resetTestState();
    onModelChange(nextModel);
  };

  const testKey = async () => {
    const nextKey = draftKey.trim();
    if (!nextKey) {
      setTestState("error");
      setTestMessage("API 키를 먼저 입력해주세요.");
      return;
    }

    setTestState("testing");
    setTestMessage("API가 실제로 응답하는지 확인하고 있어요.");
    try {
      await onApiKeyTest(nextKey);
      setTestedKey(nextKey);
      setDraftKey("");
      setTestState("success");
      setTestMessage("API가 정상 작동해요. 바로 사용할 수 있어요.");
    } catch (caught) {
      setTestedKey("");
      setTestState("error");
      setTestMessage(caught instanceof Error ? caught.message : "API 키를 확인하지 못했어요.");
    }
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`topbar-button api-status-button ${isConfigured ? "api-status-button-active" : ""}`}
      >
        <KeyRound size={16} />
        <span>{statusLabel}</span>
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
            <div className="api-key-test-row">
              <input
                id="api-key-input"
                aria-label={PROVIDER_API_KEY_LABELS[provider]}
                type="password"
                value={draftKey}
                onChange={(event) => updateDraftKey(event.target.value)}
                className="api-input api-key-input"
                placeholder={apiKey ? "API키는 사용자의 로컬에만 저장됩니다." : PROVIDER_API_KEY_PLACEHOLDERS[provider]}
              />
              <button
                type="button"
                onClick={() => void testKey()}
                disabled={!trimmedDraftKey || testState === "testing"}
                className={`api-test-button ${testState === "success" ? "api-test-button-success" : ""}`}
              >
                {testState === "testing" ? "확인중" : "TEST"}
              </button>
            </div>
            {testMessage ? (
              <p className={`api-test-message api-test-message-${testState}`} role={testState === "error" ? "alert" : "status"}>
                {testMessage}
              </p>
            ) : null}
            <label className="console-label mt-4" htmlFor="model-select">
              모델
            </label>
            <select
              id="model-select"
              aria-label={`${MODEL_PROVIDER_LABELS[provider]} 모델`}
              value={model}
              onChange={(event) => changeModel(event.target.value)}
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
