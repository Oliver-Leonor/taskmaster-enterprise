/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";

type HotkeyHandler = (e: KeyboardEvent) => void;

export function useHotkeys(map: Record<string, HotkeyHandler>, enabled = true) {
  React.useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      // ignore typing in inputs/textareas
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName?.toLowerCase();
      const isTyping =
        tag === "input" || tag === "textarea" || (el as any)?.isContentEditable;

      const key = e.key.toLowerCase();

      if (key === "/" && !isTyping) {
        e.preventDefault();
      }

      const handler = map[key];
      if (handler) handler(e);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [map, enabled]);
}
