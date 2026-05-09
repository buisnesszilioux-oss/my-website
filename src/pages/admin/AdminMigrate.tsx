import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Database, Loader2, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

import productsSeed from "@/data/firestore-seed/products.json";
import industriesSeed from "@/data/firestore-seed/industries.json";
import standardsSeed from "@/data/firestore-seed/standards.json";
import mediaSeed from "@/data/firestore-seed/media.json";
import siteContentSeed from "@/data/firestore-seed/siteContent.json";
import pageSectionsSeed from "@/data/firestore-seed/pageSections.json";
import floatingImagesSeed from "@/data/firestore-seed/floatingImages.json";
import customersSeed from "@/data/firestore-seed/customers.json";
import ledgerEntriesSeed from "@/data/firestore-seed/ledgerEntries.json";

type Step = { key: string; label: string; apiPath: string; data: any[]; idField?: string };
type Status = "idle" | "running" | "done" | "error";

const STEPS: Step[] = [
  { key: "siteContent",    label: "Site Content",             apiPath: "/api/admin/site-content",    data: siteContentSeed as any[],   idField: "key"  },
  { key: "products",       label: "Products",                 apiPath: "/api/admin/products",        data: productsSeed as any[],      idField: "slug" },
  { key: "industries",     label: "Industries",               apiPath: "/api/admin/industries",      data: industriesSeed as any[],    idField: "slug" },
  { key: "standards",      label: "Standards",                apiPath: "/api/admin/standards",       data: standardsSeed as any[],     idField: "slug" },
  { key: "media",          label: "Media",                    apiPath: "/api/admin/media",           data: mediaSeed as any[] },
  { key: "pageSections",   label: "Custom Sections",          apiPath: "/api/admin/page-sections",   data: pageSectionsSeed as any[] },
  { key: "floatingImages", label: "Floating Images",          apiPath: "/api/admin/floating-images", data: floatingImagesSeed as any[] },
  { key: "customers",      label: "Ledger Customers",         apiPath: "/api/admin/customers",       data: customersSeed as any[] },
  { key: "ledgerEntries",  label: "Ledger Entries",           apiPath: "/api/admin/ledger",          data: ledgerEntriesSeed as any[] },
];

const AdminMigrate = () => {
  const { toast } = useToast();
  const [statuses, setStatuses] = useState<Record<string, { status: Status; count?: number; error?: string }>>(
    () => Object.fromEntries(STEPS.map((s) => [s.key, { status: "idle" as Status }])),
  );
  const [running, setRunning] = useState(false);

  const setStatus = (key: string, patch: Partial<{ status: Status; count: number; error: string }>) =>
    setStatuses((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  const runStep = async (step: Step) => {
    setStatus(step.key, { status: "running" });
    try {
      let count = 0;
      if (step.key === "siteContent") {
        const entries = (step.data as any[]).map((d) => ({ key: d.key, value: d.value ?? "" }));
        await api(step.apiPath, { method: "POST", body: JSON.stringify({ entries }) });
        count = entries.length;
      } else {
        for (const item of step.data) {
          try {
            await api(step.apiPath, { method: "POST", body: JSON.stringify(item) });
            count++;
          } catch { /* skip duplicates */ }
        }
      }
      setStatus(step.key, { status: "done", count });
      return count;
    } catch (e: any) {
      setStatus(step.key, { status: "error", error: e?.message || "Failed" });
      throw e;
    }
  };

  const runAll = async () => {
    setRunning(true);
    let total = 0;
    let failed = 0;
    for (const step of STEPS) {
      try { total += await runStep(step); } catch { failed++; }
    }
    setRunning(false);
    toast({
      title: failed === 0 ? "Migration complete" : `Migration finished with ${failed} error(s)`,
      description: `Imported ${total} records into MongoDB.`,
      variant: failed === 0 ? "default" : "destructive",
    });
  };

  return (
    <AdminLayout>
      <Helmet><title>Migrate Data — Admin</title></Helmet>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-primary/80 mb-1">One-time migration</p>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Seed Data → MongoDB</h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-2xl">
          This pushes the bundled snapshot into your MongoDB database. Safe to run multiple times.
        </p>
      </div>

      <button
        onClick={runAll}
        disabled={running}
        data-testid="button-run-migration"
        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-gradient-gold text-charcoal font-bold hover:opacity-90 transition disabled:opacity-60"
      >
        {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
        {running ? "Migrating…" : "Run full migration"}
      </button>

      <div className="mt-8 space-y-2">
        {STEPS.map((step) => {
          const s = statuses[step.key];
          return (
            <div key={step.key} data-testid={`row-step-${step.key}`} className="flex items-center justify-between rounded-lg border border-border bg-card/60 px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <StatusIcon status={s.status} />
                <div className="min-w-0">
                  <p className="font-medium truncate">{step.label}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {step.data.length} record(s) <ArrowRight className="inline w-3 h-3 mx-1" /> MongoDB
                  </p>
                  {s.status === "done" && <p className="text-[11px] text-emerald-400 mt-0.5">Imported {s.count} record(s)</p>}
                  {s.status === "error" && <p className="text-[11px] text-red-400 mt-0.5">{s.error}</p>}
                </div>
              </div>
              <button
                onClick={() => runStep(step).catch(() => undefined)}
                disabled={running}
                data-testid={`button-run-${step.key}`}
                className="text-xs px-3 py-1.5 rounded-md border border-primary/40 text-primary hover:bg-primary/10 transition disabled:opacity-50"
              >
                Run
              </button>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
};

const StatusIcon = ({ status }: { status: Status }) => {
  if (status === "running") return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
  if (status === "done") return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
  if (status === "error") return <AlertTriangle className="w-4 h-4 text-red-400" />;
  return <Database className="w-4 h-4 text-muted-foreground" />;
};

export default AdminMigrate;
