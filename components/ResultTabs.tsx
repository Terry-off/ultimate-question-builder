"use client";

import { useState } from "react";
import type { UltimatePromptResult } from "@/lib/types";
import { PromptCard } from "./PromptCard";
import { QualityScoreCard } from "./QualityScoreCard";

const tabs = [
  { id: "shortVersion", label: "짧은 버전" },
  { id: "deepVersion", label: "깊은 분석 버전" },
  { id: "expertVersion", label: "전문가 버전" }
] as const;

type TabId = (typeof tabs)[number]["id"];

export function ResultTabs({ result }: { result: UltimatePromptResult }) {
  const [active, setActive] = useState<TabId>("deepVersion");
  const activeTab = tabs.find((tab) => tab.id === active) ?? tabs[1];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-accent">Step 4</p>
        <h2 className="mt-2 text-3xl font-semibold text-ink">최종 궁극 질문</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`rounded-md border px-4 py-2 text-sm font-semibold ${
              active === tab.id ? "border-accent bg-accent text-white" : "border-line bg-white text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <PromptCard title={activeTab.label} text={result[active]} />
      <QualityScoreCard result={result} />
    </section>
  );
}
