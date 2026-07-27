import * as Haptics from "expo-haptics";
import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";

import { bundledCatalog } from "@/data/catalog";
import type { CatalogRacket } from "@/types/catalog";
import { storage } from "@/utils/storage";

type AppStateValue = {
  catalog: CatalogRacket[];
  savedIds: string[];
  compareIds: string[];
  isRefreshing: boolean;
  refreshCatalog: () => Promise<void>;
  toggleSaved: (id: string) => void;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
};

const AppStateContext = createContext<AppStateValue | null>(null);
const SAVED_KEY = "padelcompare:saved:v1";
const COMPARE_KEY = "padelcompare:compare:v1";

function readIds(key: string) {
  try {
    const value = storage.getItem(key);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function persist(key: string, value: string[]) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // The in-memory state remains usable if device storage is unavailable.
  }
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [catalog, setCatalog] = useState<CatalogRacket[]>(bundledCatalog);
  const [savedIds, setSavedIds] = useState<string[]>(() => readIds(SAVED_KEY));
  const [compareIds, setCompareIds] = useState<string[]>(() => readIds(COMPARE_KEY));
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => persist(SAVED_KEY, savedIds), [savedIds]);
  useEffect(() => persist(COMPARE_KEY, compareIds), [compareIds]);

  const refreshCatalog = useCallback(async () => {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");
    if (!baseUrl || !baseUrl.startsWith("https://")) return;

    setIsRefreshing(true);
    try {
      const response = await fetch(`${baseUrl}/api/catalog/rackets`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = (await response.json()) as { rackets?: CatalogRacket[] };
      if (Array.isArray(payload.rackets) && payload.rackets.length > 0) {
        setCatalog(payload.rackets);
      }
    } catch {
      // Bundled release data remains the reliable offline fallback.
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const toggleSaved = useCallback((id: string) => {
    setSavedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
    void Haptics.selectionAsync();
  }, []);

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 4) return [...current.slice(1), id];
      return [...current, id];
    });
    void Haptics.selectionAsync();
  }, []);

  const clearCompare = useCallback(() => setCompareIds([]), []);

  const value = useMemo(
    () => ({
      catalog,
      savedIds,
      compareIds,
      isRefreshing,
      refreshCatalog,
      toggleSaved,
      toggleCompare,
      clearCompare
    }),
    [
      catalog,
      savedIds,
      compareIds,
      isRefreshing,
      refreshCatalog,
      toggleSaved,
      toggleCompare,
      clearCompare
    ]
  );

  return <AppStateContext value={value}>{children}</AppStateContext>;
}

export function useAppState() {
  const value = React.use(AppStateContext);
  if (!value) throw new Error("useAppState must be used inside AppStateProvider");
  return value;
}
