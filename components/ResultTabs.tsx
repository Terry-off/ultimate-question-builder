"use client";

import { useState } from "react";
import type { UltimatePromptResult } from "@/lib/types";
import { PromptCard } from "./PromptCard";

const tabs = [
  { id: "shortVersion", label: "짧게" },
  { id: "deepVersion", label: "깊게" },
  { id: "expertVersion", label: "전문가" }
] as const;

type TabId = (typeof tabs)[number]["id"];

export function ResultTabs({ result }: { result: UltimatePromptResult }) {
  const [active, setActive] = useState<TabId>("deepVersion");
  const activeTab = tabs.find((tab) => tab.id === active) ?? tabs[1];

  return (
    <section className="result-content">
      <div>
        <h2>최종 질문</h2>
      </div>
      <div className="result-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`result-tab ${active === tab.id ? "result-tab-active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <PromptCard title={activeTab.label} text={result[active]} />
    </section>
  );
}
