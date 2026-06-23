"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type MenuDismissLayerProps = {
  readonly onDismiss: () => void;
};

export function MenuDismissLayer({ onDismiss }: MenuDismissLayerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <button
      type="button"
      aria-label="메뉴 닫기"
      tabIndex={-1}
      onClick={onDismiss}
      className="menu-dismiss-layer"
    />,
    document.body
  );
}
