import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const KEYS = ["theme.primary", "theme.gold", "theme.charcoal", "theme.background", "theme.foreground"] as const;

export function useApplyTheme() {
  const { data } = useQuery<Record<string, string>>({
    queryKey: ["/api/site-content"],
    queryFn: () => api("/api/site-content"),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!data) return;
    const root = document.documentElement;
    for (const k of KEYS) {
      const v = (data[k] || "").trim();
      if (!v) continue;
      const cssName = k.replace("theme.", "--");
      root.style.setProperty(cssName, v);
      if (k === "theme.gold") root.style.setProperty("--gold", v);
    }
  }, [data]);
}
