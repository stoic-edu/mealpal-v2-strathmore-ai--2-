import { useEffect, RefObject } from "react";

/**
 * Closes a floating element (dropdown, popover, panel) when the user
 * clicks or taps anywhere outside of it.
 */
export function useClickOutside(ref: RefObject<HTMLElement | null>, onOutside: () => void, active: boolean = true) {
  useEffect(() => {
    if (!active) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutside();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [ref, onOutside, active]);
}
