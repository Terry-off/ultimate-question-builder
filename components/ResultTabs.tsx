"use client";

import { useEffect, useState } from "react";
import type { PromptVersionId, UltimatePromptResult } from "@/lib/types";
import { PromptCard } from "./PromptCard";

const tabs = [
  { id: "shortVersion", label: "짧게 물어보기" },
  { id: "deepVersion", label: "깊게 물어보기" },
  { id: "expertVersion", label: "전문가로 물어보기" }
] as const;

export type EditablePromptMap = Record<PromptVersionId, string>;

export function createEditablePromptMap(result: UltimatePromptResult): EditablePromptMap {
  return {
    shortVersion: result.shortVersion,
    deepVersion: result.deepVersion,
    expertVersion: result.expertVersion
  };
}

type ResultTabsProps = {
  readonly result: UltimatePromptResult;
  readonly editable?: boolean;
  readonly activeVersion?: PromptVersionId;
  readonly editedPrompts?: EditablePromptMap;
  readonly onActiveVersionChange?: (version: PromptVersionId) => void;
  readonly onPromptChange?: (version: PromptVersionId, value: string) => void;
};

export function ResultTabs({
  result,
  editable = false,
  activeVersion,
  editedPrompts,
  onActiveVersionChange,
  onPromptChange
}: ResultTabsProps) {
  const [localActive, setLocalActive] = useState<PromptVersionId>("deepVersion");
  const [localPrompts, setLocalPrompts] = useState<EditablePromptMap>(() => createEditablePromptMap(result));
  const active = activeVersion ?? localActive;
  const prompts = editedPrompts ?? localPrompts;
  const activeTab = tabs.find((tab) => tab.id === active) ?? tabs[1];
  const activeText = prompts[active];

  useEffect(() => {
    setLocalPrompts(createEditablePromptMap(result));
  }, [result]);

  const changeActiveVersion = (version: PromptVersionId) => {
    if (onActiveVersionChange) {
      onActiveVersionChange(version);
      return;
    }

    setLocalActive(version);
  };

  const changePrompt = (version: PromptVersionId, value: string) => {
    if (onPromptChange) {
      onPromptChange(version, value);
      return;
    }

    setLocalPrompts((current) => ({ ...current, [version]: value }));
  };

  return (
    <section className="result-content">
      <div>
        <h2>AI에게 물어보는 궁극의 질문입니다.</h2>
      </div>
      <div className="result-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => changeActiveVersion(tab.id)}
            className={`result-tab ${active === tab.id ? "result-tab-active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <PromptCard
        title={activeTab.label}
        text={activeText}
        copyResetKey={active}
        editable={editable}
        onTextChange={(value) => changePrompt(active, value)}
      />
    </section>
  );
}
