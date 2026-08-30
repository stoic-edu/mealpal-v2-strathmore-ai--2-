import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import type { FoodItem, Portion, PlateLine } from "@/lib/mock-data";
import { getServingsFor } from "@/lib/mock-data";

const STORAGE_KEY = "meal_buddy_plate";

interface PlateContextValue {
  lines: PlateLine[];
  cafeteria: string | null;
  count: number;
  total: number;
  /** Returns false (and does nothing) if the item belongs to a different cafeteria
   *  than what's already on the plate — caller should prompt the user to clear first. */
  addItem: (food: FoodItem, portion: Portion | null, quantity?: number) => boolean;
  removeLine: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearPlate: () => void;
}

const PlateContext = createContext<PlateContextValue | null>(null);

export function PlateProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<PlateLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const cafeteria = lines[0]?.food.cafeteria ?? null;

  const addItem = useCallback(
    (food: FoodItem, portion: Portion | null, quantity = 1) => {
      let added = true;
      setLines((prev) => {
        if (prev.length > 0 && prev[0].food.cafeteria !== food.cafeteria) {
          added = false;
          return prev;
        }
        const existingIdx = prev.findIndex((l) => l.food.id === food.id && l.portion === portion);
        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = { ...next[existingIdx], quantity: next[existingIdx].quantity + quantity };
          return next;
        }
        return [
          ...prev,
          { lineId: `pl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, food, portion, quantity },
        ];
      });
      return added;
    },
    []
  );

  const removeLine = useCallback((lineId: string) => {
    setLines((prev) => prev.filter((l) => l.lineId !== lineId));
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.lineId !== lineId)
        : prev.map((l) => (l.lineId === lineId ? { ...l, quantity } : l))
    );
  }, []);

  const clearPlate = useCallback(() => setLines([]), []);

  const total = useMemo(
    () => lines.reduce((sum, l) => sum + getServingsFor(l.food, l.portion).price * l.quantity, 0),
    [lines]
  );
  const count = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);

  return (
    <PlateContext.Provider value={{ lines, cafeteria, count, total, addItem, removeLine, updateQuantity, clearPlate }}>
      {children}
    </PlateContext.Provider>
  );
}

export function usePlate() {
  const ctx = useContext(PlateContext);
  if (!ctx) throw new Error("usePlate must be used within PlateProvider");
  return ctx;
}
