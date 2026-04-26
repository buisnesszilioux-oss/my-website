import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SiteContentMap } from "@/hooks/useSiteContent";
import {
  DEFAULT_BOLTS, DEFAULT_NUTS, DEFAULT_DIMS,
  type BoltGrade, type NutGrade, type DimStandard,
} from "@/hooks/useEditableTables";
import { Plus, Trash2, RotateCcw, Save } from "lucide-react";

type TableSpec<T> = {
  key: string;
  rowLabel: string;
  cols: { field: keyof T; label: string; width?: string }[];
  empty: T;
  defaults: T[];
};

const boltsSpec: TableSpec<BoltGrade> = {
  key: "grade.bolts",
  rowLabel: "Bolt / Stud Grade",
  cols: [
    { field: "grade", label: "Grade" },
    { field: "material", label: "Material" },
    { field: "spec", label: "Specification" },
    { field: "tensile", label: "Tensile" },
    { field: "yield", label: "Yield" },
    { field: "hardness", label: "Hardness" },
    { field: "use", label: "Application" },
  ],
  empty: { grade: "", material: "", spec: "", tensile: "", yield: "", hardness: "", use: "" },
  defaults: DEFAULT_BOLTS,
};

const nutsSpec: TableSpec<NutGrade> = {
  key: "grade.nuts",
  rowLabel: "Nut Grade",
  cols: [
    { field: "grade", label: "Grade" },
    { field: "material", label: "Material" },
    { field: "spec", label: "Specification" },
    { field: "hardness", label: "Hardness" },
    { field: "proofLoad", label: "Proof Load" },
    { field: "use", label: "Application" },
  ],
  empty: { grade: "", material: "", spec: "", hardness: "", proofLoad: "", use: "" },
  defaults: DEFAULT_NUTS,
};

const dimsSpec: TableSpec<DimStandard> = {
  key: "grade.dims",
  rowLabel: "Dimensional Standard",
  cols: [
    { field: "product", label: "Product" },
    { field: "din", label: "DIN" },
    { field: "asme", label: "ASME" },
    { field: "iso", label: "ISO" },
    { field: "uni", label: "UNI" },
    { field: "bs", label: "BS" },
  ],
  empty: { product: "", din: "", asme: "", iso: "", uni: "", bs: "" },
  defaults: DEFAULT_DIMS,
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
        <div className="text-sm text-muted-foreground">{rows.length} {spec.rowLabel.toLowerCase()}{rows.length === 1 ? "" : "s"}</div>
        <div className="flex flex-wrap gap-2">
          <button onClick={addRow} data-testid="button-add-row"
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition">
            <Plus className="w-4 h-4" /> Add Row
          </button>
          <button onClick={reset} data-testid="button-reset"
            className="inline-flex items-center gap-1.5 border border-border bg-background px-3 py-2 rounded-md text-sm font-semibold hover:bg-secondary/40 transition">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button
            onClick={() => save.mutate(rows)}
            disabled={save.isPending}
            data-testid="button-save"
            className="inline-flex items-center gap-1.5 bg-foreground text-background px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
          >
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

export default function AdminGradeChart() {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold">Grade Chart</h1>
        <p className="text-sm text-muted-foreground mt-1">Edit the bolt, nut, and dimensional reference tables shown on the public site.</p>
      </div>

      <Tabs defaultValue="bolts">
        <TabsList className="mb-4">
          <TabsTrigger value="bolts" data-testid="tab-bolts">Bolt &amp; Stud Grades</TabsTrigger>
          <TabsTrigger value="nuts" data-testid="tab-nuts">Nut Grades</TabsTrigger>
          <TabsTrigger value="dims" data-testid="tab-dims">Dimensional Standards</TabsTrigger>
        </TabsList>
        <TabsContent value="bolts"><TableEditor spec={boltsSpec} /></TabsContent>
        <TabsContent value="nuts"><TableEditor spec={nutsSpec} /></TabsContent>
        <TabsContent value="dims"><TableEditor spec={dimsSpec} /></TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
