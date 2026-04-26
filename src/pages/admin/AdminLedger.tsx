import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Search, Notebook, ChevronRight, Users, Wallet, AlertCircle, IndianRupee,
  Plus, X, Loader2, Save, Phone, MapPin, Trash2, FileSpreadsheet, BookOpen, CheckCheck,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Customer, LedgerEntry } from "@shared/schema";

const inr = (n: number) =>
  Number.isFinite(n)
    ? n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })
    : "₹0.00";

const num = (s: string | number | null | undefined) =>
  parseFloat(String(s ?? "0").replace(/[^0-9.\-]/g, "")) || 0;

const isPaidEntry = (e: LedgerEntry) => {
  const due = num(e.amountDue);
  const recv = num(e.amountReceived);
  return due > 0 && recv >= due;
};

type CustomerSummary = Customer & {
  entries: number;
  total: number;
  paid: number;
  pending: number;
  tallyPending: number;
  bookPending: number;
  fullyDone: number;
};

export default function AdminLedger() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/admin/customers"],
    queryFn: () => api("/api/admin/customers"),
  });
  const { data: allEntries = [] } = useQuery<LedgerEntry[]>({
    queryKey: ["/api/admin/ledger"],
    queryFn: () => api("/api/admin/ledger"),
  });

  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });

  const summaries: CustomerSummary[] = useMemo(() => {
    return customers.map((c) => {
      const mine = allEntries.filter((e) => e.customerId === c.id);
      let total = 0, paid = 0;
      let tallyPending = 0, bookPending = 0, fullyDone = 0;
      for (const e of mine) {
        const due = num(e.amountDue);
        total += due;
        const isPaid = isPaidEntry(e);
        if (isPaid) paid += due;
        if (isPaid && !e.tallyReceiptDone) tallyPending += 1;
        if (isPaid && !e.bookEntryDone) bookPending += 1;
        if (isPaid && e.tallyReceiptDone && e.bookEntryDone) fullyDone += 1;
      }
      return {
        ...c, entries: mine.length, total, paid,
        pending: Math.max(0, total - paid),
        tallyPending, bookPending, fullyDone,
      };
    });
  }, [customers, allEntries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return summaries;
    return summaries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q) ||
        (c.address || "").toLowerCase().includes(q)
    );
  }, [summaries, search]);

  const totals = useMemo(() => {
    let total = 0, paid = 0, pending = 0;
    let tallyPending = 0, bookPending = 0, fullyDone = 0;
    for (const c of summaries) {
      total += c.total; paid += c.paid; pending += c.pending;
      tallyPending += c.tallyPending; bookPending += c.bookPending; fullyDone += c.fullyDone;
    }
    return { total, paid, pending, count: summaries.length, tallyPending, bookPending, fullyDone };
  }, [summaries]);

  const create = useMutation({
    mutationFn: (data: typeof form) =>
      api("/api/admin/customers", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/customers"] });
      setShowAdd(false);
      setForm({ name: "", phone: "", address: "" });
      toast({ title: "Customer added" });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api(`/api/admin/customers/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/customers"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/ledger"] });
      toast({ title: "Customer removed" });
    },
  });

  const submit = () => {
    if (!form.name.trim()) { toast({ title: "Customer name is required", variant: "destructive" }); return; }
    create.mutate(form);
  };

  return (
    <AdminLayout>
      <Helmet><title>Ledger / Khata · Admin</title></Helmet>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <Notebook className="w-6 h-6 text-primary" /> Ledger / Khata
          </h1>
          <p className="text-sm text-muted-foreground">First add a customer, then open them to record invoices.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          data-testid="button-add-customer"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-md hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {/* Top totals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <Stat label="Customers" value={String(totals.count)} icon={Users} tone="blue" testid="stat-customers" />
        <Stat label="Total Amount" value={inr(totals.total)} icon={IndianRupee} tone="amber" testid="stat-total" />
        <Stat label="Total Paid" value={inr(totals.paid)} icon={Wallet} tone="green" testid="stat-paid" />
        <Stat label="Total Pending" value={inr(totals.pending)} icon={AlertCircle} tone="red" testid="stat-pending" />
      </div>

      {/* T / B / Done across all customers */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <Stat label="T — Tally Receipt Pending" value={String(totals.tallyPending)} icon={FileSpreadsheet} tone={totals.tallyPending > 0 ? "red" : "green"} testid="stat-all-tally-pending" />
        <Stat label="B — Book Entry Pending" value={String(totals.bookPending)} icon={BookOpen} tone={totals.bookPending > 0 ? "red" : "green"} testid="stat-all-book-pending" />
        <Stat label="Fully Done (Paid + T + B)" value={String(totals.fullyDone)} icon={CheckCheck} tone="green" testid="stat-all-fully-done" />
      </div>

      {/* Search */}
      <div className="bg-card border rounded-xl p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, phone or address…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-customer"
            className="w-full pl-9 pr-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Customer list */}
      <div className="bg-card border rounded-xl overflow-hidden">
        {isLoading && (
          <div className="p-10 text-center text-muted-foreground">Loading…</div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="p-10 text-center text-muted-foreground">
            {customers.length === 0
              ? <>No customers yet. Click <strong>Add Customer</strong> to create your first one.</>
              : <>No customer matches your search.</>}
          </div>
        )}
        {!isLoading && filtered.length > 0 && (
          <ul className="divide-y divide-border">
            {filtered.map((c) => (
              <li key={c.id}>
                <div className="flex items-center hover:bg-secondary/40 transition">
                  <Link
                    to={`/admin/ledger/${c.id}`}
                    data-testid={`row-customer-${c.id}`}
                    className="flex-1 grid grid-cols-12 gap-3 items-center px-4 py-4 min-w-0"
                  >
                    <div className="col-span-12 sm:col-span-5 flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-gold text-charcoal flex items-center justify-center font-bold text-sm shrink-0">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground truncate">{c.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {c.phone || "—"} · {c.entries} {c.entries === 1 ? "entry" : "entries"}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-6 sm:col-span-3 text-right">
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Pending</div>
                      <div className={`font-bold ${c.pending > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                        {inr(c.pending)}
                      </div>
                    </div>
                    <div className="col-span-5 sm:col-span-3 text-right">
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Paid</div>
                      <div className="font-bold text-emerald-700 dark:text-emerald-400">{inr(c.paid)}</div>
                      <div className="mt-1 inline-flex items-center gap-1 flex-wrap justify-end">
                        {c.tallyPending > 0 && (
                          <span title={`${c.tallyPending} entries: Tally Receipt pending`} className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                            T<span className="opacity-80">·{c.tallyPending}</span>
                          </span>
                        )}
                        {c.bookPending > 0 && (
                          <span title={`${c.bookPending} entries: Book entry pending`} className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                            B<span className="opacity-80">·{c.bookPending}</span>
                          </span>
                        )}
                        {c.fullyDone > 0 && c.tallyPending === 0 && c.bookPending === 0 && c.entries > 0 && (
                          <span title="All entries fully done" className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                            <CheckCheck className="w-3 h-3" /> All Done
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-1 text-right text-muted-foreground">
                      <ChevronRight className="w-5 h-5 ml-auto" />
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm(`Delete customer "${c.name}" and all their entries?`)) remove.mutate(c.id);
                    }}
                    data-testid={`button-delete-customer-${c.id}`}
                    className="p-3 text-muted-foreground hover:text-destructive"
                    aria-label="Delete customer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add customer modal */}
      {showAdd && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="bg-card rounded-xl border max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold">Add Customer</h2>
              <button onClick={() => setShowAdd(false)} aria-label="Close" className="p-1 rounded hover:bg-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <Field label="Customer Name *">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Sharma Industries"
                  data-testid="input-customer-name"
                  className={inputCls}
                  autoFocus
                />
              </Field>
              <Field label="Phone (optional)">
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98XXX XXXXX"
                    data-testid="input-customer-phone"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </Field>
              <Field label="Address (optional)">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <textarea
                    rows={2}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Shop / Office / City"
                    data-testid="input-customer-address"
                    className={`${inputCls} pl-9 resize-none`}
                  />
                </div>
              </Field>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-md border border-border text-sm font-semibold hover:bg-secondary">
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={create.isPending}
                data-testid="button-save-customer"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-semibold hover:opacity-90 disabled:opacity-60"
              >
                {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

const inputCls = "w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</label>
    {children}
  </div>
);

const Stat = ({
  label, value, icon: Icon, tone, testid,
}: {
  label: string; value: string; icon: any; tone: "amber" | "green" | "red" | "blue"; testid: string;
}) => {
  const palette =
    tone === "green" ? "border-emerald-500/30 text-emerald-700 dark:text-emerald-400" :
    tone === "red" ? "border-red-500/30 text-red-700 dark:text-red-400" :
    tone === "blue" ? "border-sky-500/30 text-sky-700 dark:text-sky-400" :
    "border-amber-500/30 text-amber-700 dark:text-amber-400";
  return (
    <div className={`bg-card border-2 rounded-xl p-4 ${palette}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">{label}</div>
          <div className="font-heading text-xl md:text-2xl font-bold mt-1" data-testid={testid}>{value}</div>
        </div>
        <Icon className="w-6 h-6 opacity-70" />
      </div>
    </div>
  );
};
