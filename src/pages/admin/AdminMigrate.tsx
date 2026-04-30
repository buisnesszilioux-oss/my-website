import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Database, Loader2, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { importBatchToCollection } from "@/lib/firestoreApi";
import { useToast } from "@/hooks/use-toast";

// Bundled snapshot of the legacy Postgres data (exported via
// `scripts/export-pg-to-json.ts`). The migration runs entirely in the browser
// using the Firebase client SDK, so all you need is to be signed in as admin
// and have Firestore + the security rules configured.
import productsSeed from "@/data/firestore-seed/products.json";
import industriesSeed from "@/data/firestore-seed/industries.json";
import standardsSeed from "@/data/firestore-seed/standards.json";
import mediaSeed from "@/data/firestore-seed/media.json";
import siteContentSeed from "@/data/firestore-seed/siteContent.json";
import pageSectionsSeed from "@/data/firestore-seed/pageSections.json";
import floatingImagesSeed from "@/data/firestore-seed/floatingImages.json";
import customersSeed from "@/data/firestore-seed/customers.json";
import ledgerEntriesSeed from "@/data/firestore-seed/ledgerEntries.json";

type Step = {
  key: string;
  label: string;
  collection: string;
  data: any[];
  idField?: string;
};

const STEPS: Step[] = [
  { key: "siteContent",    label: "Site Content (home page text)",    collection: "siteContent",    data: siteContentSeed as any[],   idField: "key"  },
  { key: "pageSections",   label: "Custom Homepage Sections",         collection: "pageSections",   data: pageSectionsSeed as any[] },
  { key: "floatingImages", label: "Floating Hero Images",             collection: "floatingImages", data: floatingImagesSeed as any[] },
  { key: "products",       label: "Products",                          collection: "products",       data: productsSeed as any[],     idField: "slug" },
  { key: "industries",     label: "Industries",                        collection: "industries",     data: industriesSeed as any[],   idField: "slug" },
  { key: "standards",      label: "Standards",                         collection: "standards",      data: standardsSeed as any[],    idField: "slug" },
  { key: "media",          label: "Media (gallery / hero / banners)",  collection: "media",          data: mediaSeed as any[] },
  { key: "customers",      label: "Ledger Customers",                  collection: "customers",      data: customersSeed as any[] },
  { key: "ledgerEntries",  label: "Ledger Entries",                    collection: "ledgerEntries",  data: ledgerEntriesSeed as any[] },
];

type Status = "idle" | "running" | "done" | "error";

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
      const items = step.data || [];
      const count = await importBatchToCollection(step.collection, items, { idField: step.idField });
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
      try {
        const c = await runStep(step);
        total += c;
      } catch {
        failed++;
      }
    }
    setRunning(false);
    toast({
      title: failed === 0 ? "Migration complete" : `Migration finished with ${failed} error(s)`,
      description: failed === 0 ? `Imported ${total} records into Firestore.` : "Check the per-step errors below.",
      variant: failed === 0 ? "default" : "destructive",
    });
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Migrate to Firestore — Admin</title>
      </Helmet>

      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-primary/80 mb-1">One-time migration</p>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Seed → Firestore</h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-2xl">
          This pushes the bundled snapshot (exported from the old Postgres backend) into your
          Firestore project. Document IDs are preserved (e.g. <code>products/m12-hex-bolt</code>)
          so URLs and internal references keep working. Safe to run multiple times — existing
          docs are merged.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-100 px-4 py-3 mb-6 text-sm flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>
          <b>Before you run this:</b> open the Firestore console and apply security rules that
          allow the admin email to write to all collections, otherwise every step will fail with
          "Missing or insufficient permissions". See <code>FIREBASE_SETUP.md</code>.
        </div>
      </div>

      <button
        onClick={runAll}
        disabled={running}
        data-testid="button-run-migration"
        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-gradient-gold text-charcoal font-bold shadow-gold hover:opacity-90 transition disabled:opacity-60"
      >
        {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
        {running ? "Migrating…" : "Run full migration"}
      </button>

      <div className="mt-8 space-y-2">
        {STEPS.map((step) => {
          const s = statuses[step.key];
          return (
            <div
              key={step.key}
              data-testid={`row-step-${step.key}`}
              className="flex items-center justify-between rounded-lg border border-border bg-card/60 px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <StatusIcon status={s.status} />
                <div className="min-w-0">
                  <p className="font-medium truncate">{step.label}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {step.data.length} record(s) <ArrowRight className="inline w-3 h-3 mx-1" />{" "}
                    Firestore <code>{step.collection}</code>
                  </p>
                  {s.status === "done" && (
                    <p className="text-[11px] text-emerald-400 mt-0.5">Imported {s.count} record(s)</p>
                  )}
                  {s.status === "error" && (
                    <p className="text-[11px] text-red-400 mt-0.5">{s.error}</p>
                  )}
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
