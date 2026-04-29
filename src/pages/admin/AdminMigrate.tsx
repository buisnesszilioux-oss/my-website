import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Database, Loader2, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { importBatchToCollection } from "@/lib/firestoreApi";
import { useToast } from "@/hooks/use-toast";

type Step = {
  key: string;
  label: string;
  /** Source URL on the Node backend that returns an array of records */
  sourceUrl: string;
  /** Firestore collection name to write into */
  collection: string;
  /** Field on each record to use as the document id (defaults to "id") */
  idField?: string;
  /** Optional transform applied to each record before write */
  transform?: (item: any) => any;
};

const STEPS: Step[] = [
  {
    key: "siteContent",
    label: "Site Content (home page text)",
    sourceUrl: "/api/site-content",
    collection: "siteContent",
    idField: "key",
    transform: (map) => map, // special: handled below
  },
  {
    key: "pageSections",
    label: "Custom Homepage Sections",
    sourceUrl: "/api/page-sections",
    collection: "pageSections",
  },
  {
    key: "floatingImages",
    label: "Floating Hero Images",
    sourceUrl: "/api/admin/floating-images",
    collection: "floatingImages",
  },
  {
    key: "products",
    label: "Products",
    sourceUrl: "/api/products",
    collection: "products",
  },
  {
    key: "industries",
    label: "Industries",
    sourceUrl: "/api/industries",
    collection: "industries",
  },
  {
    key: "standards",
    label: "Standards",
    sourceUrl: "/api/standards",
    collection: "standards",
  },
  {
    key: "media",
    label: "Media (gallery / hero / banners)",
    sourceUrl: "/api/media",
    collection: "media",
  },
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

  // Fetch directly from the Node backend (bypass our Firestore adapter)
  // by hitting the dev server origin without /api proxy interception. We use
  // the relative path with a special header that the adapter ignores by
  // checking source — easiest is to call the backend directly using a
  // sentinel query param that won't match any Firestore route.
  // Simpler: temporarily uninstall? Better: call the real fetch via a saved ref.
  const realFetch = (window as any).__realFetch__ || fetch;

  const runStep = async (step: Step) => {
    setStatus(step.key, { status: "running" });
    try {
      // Use real fetch (not intercepted) to pull from the Node backend
      const res = await realFetch(step.sourceUrl);
      if (!res.ok) throw new Error(`Source returned ${res.status}`);
      const raw = await res.json();

      let count = 0;
      if (step.key === "siteContent" && raw && typeof raw === "object" && !Array.isArray(raw)) {
        // siteContent comes back as a key→value map; convert to array form
        const items = Object.entries(raw as Record<string, string>).map(([key, value]) => ({ key, value }));
        count = await importBatchToCollection(step.collection, items, { idField: "key" });
      } else if (Array.isArray(raw)) {
        count = await importBatchToCollection(step.collection, raw, { idField: step.idField });
      } else {
        throw new Error("Unexpected response shape");
      }

      setStatus(step.key, { status: "done", count });
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
        await runStep(step);
        total += statuses[step.key]?.count ?? 0;
      } catch {
        failed++;
        // continue — don't abort the whole migration on one failure
      }
    }
    setRunning(false);
    toast({
      title: failed === 0 ? "Migration complete" : `Migration finished with ${failed} error(s)`,
      description: failed === 0 ? `Imported ${total}+ records into Firestore.` : "Check the per-step errors below.",
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
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Postgres → Firestore</h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-2xl">
          This pulls every record from the existing Node + Postgres backend and copies it into
          Firestore. Document IDs are preserved (e.g. <code>products/123</code>) so URLs and
          internal references keep working. Safe to run multiple times — existing docs are merged.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-100 px-4 py-3 mb-6 text-sm flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>
          <b>Before you run this:</b> open the Firestore console and apply the security rules from{" "}
          <code>FIREBASE_SETUP.md</code>. The rules must allow the admin email to write to all
          collections, otherwise every step will fail with "Missing or insufficient permissions".
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
                    {step.sourceUrl} <ArrowRight className="inline w-3 h-3 mx-1" />{" "}
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
