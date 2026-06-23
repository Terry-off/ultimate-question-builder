"use client";

import { useEffect, type RefObject } from "react";

export function useOutsideDismiss(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
  onDismiss: () => void
) {
  useEffect(() => {
    if (!active) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      const container = containerRef.current;
      if (!(target instanceof Node) || !container || container.contains(target)) return;
      onDismiss();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [active, containerRef, onDismiss]);
}
