"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
      }}
      className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-medium"
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? "복사됨" : "복사"}
    </button>
  );
}
