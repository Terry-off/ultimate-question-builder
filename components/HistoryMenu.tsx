"use client";

import { History, Trash2 } from "lucide-react";
import { useState } from "react";
import type { PromptHistoryEntry } from "@/lib/promptHistory";

type HistoryMenuProps = {
  readonly entries: readonly PromptHistoryEntry[];
  readonly activeId?: string;
  readonly onSelect: (entry: PromptHistoryEntry) => void;
  readonly onDelete: (id: string) => void;
};

const formatHistoryDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
};

export function HistoryMenu({ entries, activeId, onSelect, onDelete }: HistoryMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="history-menu">
      <button type="button" onClick={() => setOpen((value) => !value)} className="topbar-button">
        <History size={16} />
        히스토리
        {entries.length > 0 ? <span className="history-count">{entries.length}</span> : null}
      </button>
      {open ? (
        <div className="history-popover">
          <div className="history-popover-head">
            <strong>질문 히스토리</strong>
            <span>이 브라우저에만 저장돼요</span>
          </div>
          {entries.length > 0 ? (
            <div className="history-list">
              {entries.map((entry) => (
                <div key={entry.id} className={`history-item ${entry.id === activeId ? "history-item-active" : ""}`}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(entry);
                      setOpen(false);
                    }}
                    className="history-load"
                  >
                    <span className="history-title">{entry.title}</span>
                    <span className="history-meta">{formatHistoryDate(entry.updatedAt)}</span>
                  </button>
                  <button type="button" onClick={() => onDelete(entry.id)} className="history-delete" aria-label={`${entry.title} 삭제`}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="history-empty">아직 저장된 질문이 없어요.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
