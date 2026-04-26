import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SiteContentMap } from "@/hooks/useSiteContent";
import {
  DEFAULT_CHEMICAL, DEFAULT_MECH_METRIC, DEFAULT_MECH_IMPERIAL,
  type ChemRow, type MechRow,
} from "@/hooks/useEditableTables";
import { Plus, Trash2, RotateCcw, Save } from "lucide-react";

type TableSpec<T> = {
  key: string;
  rowLabel: string;
  cols: { field: keyof T; label: string }[];
  empty: T;
  defaults: T[];
};

const chemSpec: TableSpec<ChemRow> = {
  key: "specs.chemical",
  rowLabel: "Element",
  cols: [
    { field: "element", label: "Element" },
    { field: "range", label: "Range" },
    { field: "variation", label: "Product Variation" },
  ],
  empty: { element: "", range: "", variation: "" },
  defaults: DEFAULT_CHEMICAL,
};

const mechMetricSpec: TableSpec<MechRow> = {
  key: "specs.mechMetric",
  rowLabel: "Diameter Class",
  cols: [
    { field: "diameter", label: "Diameter" },
    { field: "minTemp", label: "Min Temp °F" },
    { field: "tensile", label: "Tensile (MPa)" },
    { field: "yield", label: "Yield (MPa)" },
    { field: "elong", label: "Elong. %" },
    { field: "redArea", label: "Red. Area %" },
    { field: "hardness", label: "Hardness" },
  ],
  empty: { diameter: "", minTemp: "", tensile: "", yield: "", elong: "", redArea: "", hardness: "" },
  defaults: DEFAULT_MECH_METRIC,
};

const mechImpSpec: TableSpec<MechRow> = {
  key: "specs.mechImperial",
  rowLabel: "Diameter Class",
  cols: [
    { field: "diameter", label: "Diameter" },
    { field: "minTemp", label: "Min Temp °F" },
    { field: "tensile", label: "Tensile (ksi)" },
    { field: "yield", label: "Yield (ksi)" },
    { field: "elong", label: "Elong. %" },
    { field: "redArea", label: "Red. Area %" },
    { field: "hardness", label: "Hardness" },
  ],
  empty: { diameter: "", minTemp: "", tensile: "", yield: "", elong: "", redArea: "", hardness: "" },
  defaults: DEFAULT_MECH_IMPERIAL,
};

function TableEditor<T extends Record<string, string>>({ spec }: { spec: TableSpec<T> }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data } = useQuery<SiteContentMap>({ queryKey: ["/api/site-content"], queryFn: () => api("/api/site-content") });
  const raw = data?.[spec.key] || "";
  const [rows, setRows] = useState<T[]>([]);

  useEffect(() => {
    if (raw && raw.trim()) {
      try {
        const v = JSON.parse(raw);
        if (Array.isArray(v)) { setRows(v as T[]); return; }
      } catch { /* fall through */ }
    }
    setRows(spec.defaults as T[]);
  }, [raw, spec.defaults]);

  const save = useMutation({
    mutationFn: (next: T[]) =>
      api("/api/admin/site-content", {
        method: "POST",
        body: JSON.stringify({ entries: [{ key: spec.key, value: JSON.stringify(next) }] }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/site-content"] });
      toast({ title: "Saved" });
    },
    onError: (e: any) => toast({ title: "Save failed", description: e.message, variant: "destructive" }),
  });

  const update = (i: number, field: keyof T, value: string) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  const addRow = () => setRows((rs) => [...rs, { ...spec.empty }]);
  const removeRow = (i: number) => {
    if (!confirm("Delete this row?")) return;
    setRows((rs) => rs.filter((_, idx) => idx !== i));
  };
  const moveRow = (i: number, dir: -1 | 1) => {
    setRows((rs) => {
      const next = [...rs];
      const j = i + dir;
      if (j < 0 || j >= next.length) return rs;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };
  const reset = () => {
    if (!confirm("Reset this table to factory defaults? Unsaved edits will be lost.")) return;
    setRows(spec.defaults as T[]);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="text-sm text-muted-foreground">{rows.length} row{rows.length === 1 ? "" : "s"}</div>
        <div className="flex flex-wrap gap-2">
          <button onClick={addRow} data-testid="button-add-row"
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition">
            <Plus className="w-4 h-4" /> Add Row
          </button>
          <button onClick={reset} data-testid="button-reset"
            className="inline-flex items-center gap-1.5 border border-border bg-background px-3 py-2 rounded-md text-sm font-semibold hover:bg-secondary/40 transition">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button onClick={() => save.mutate(rows)} disabled={save.isPending} data-testid="button-save"
            className="inline-flex items-center gap-1.5 bg-foreground text-background px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition">
            <Save className="w-4 h-4" /> {save.isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-elegant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/50">
                <th className="text-left px-3 py-2 font-semibold text-foreground w-10">#</th>
                {spec.cols.map((c) => (
                  <th key={String(c.field)} className="text-left px-3 py-2 font-semibold text-foreground">{c.label}</th>
                ))}
                <th className="px-3 py-2 w-32"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-secondary/20">
                  <td className="px-3 py-2 text-muted-foreground align-top pt-3">{i + 1}</td>
                  {spec.cols.map((c) => (
                    <td key={String(c.field)} className="px-2 py-1.5 align-top">
                      <input
                        value={(row[c.field] as string) || ""}
                        onChange={(e) => update(i, c.field, e.target.value)}
                        data-testid={`input-${spec.key}-${i}-${String(c.field)}`}
                        className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary"
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1.5 align-top">
                    <div className="flex items-center gap-1">
                      <button onClick={() => moveRow(i, -1)} title="Move up" disabled={i === 0}
                        className="px-1.5 py-1 text-xs border border-border rounded hover:bg-secondary/50 disabled:opacity-30">↑</button>
                      <button onClick={() => moveRow(i, 1)} title="Move down" disabled={i === rows.length - 1}
                        className="px-1.5 py-1 text-xs border border-border rounded hover:bg-secondary/50 disabled:opacity-30">↓</button>
                      <button onClick={() => removeRow(i)} title="Delete" data-testid={`button-delete-${spec.key}-${i}`}
                        className="px-1.5 py-1 text-xs border border-destructive/40 text-destructive rounded hover:bg-destructive/10">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={spec.cols.length + 2} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No rows yet. Click "Add Row" to start.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminSpecifications() {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold">Specifications</h1>
        <p className="text-sm text-muted-foreground mt-1">Edit the chemical composition and mechanical property tables shown on the Specifications page.</p>
      </div>

      <Tabs defaultValue="chemical">
        <TabsList className="mb-4">
          <TabsTrigger value="chemical" data-testid="tab-chemical">Chemical Composition</TabsTrigger>
          <TabsTrigger value="metric" data-testid="tab-metric">Mechanical — Metric</TabsTrigger>
          <TabsTrigger value="imperial" data-testid="tab-imperial">Mechanical — Imperial</TabsTrigger>
        </TabsList>
        <TabsContent value="chemical"><TableEditor spec={chemSpec} /></TabsContent>
        <TabsContent value="metric"><TableEditor spec={mechMetricSpec} /></TabsContent>
        <TabsContent value="imperial"><TableEditor spec={mechImpSpec} /></TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
