import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft, Plus, Trash2, Loader2, Save, X, Check, CheckCheck,
  Receipt, IndianRupee, Wallet, AlertCircle, ListChecks, RotateCcw, Pencil,
  Phone, MapPin, BookOpen, FileSpreadsheet,
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

const today = () => new Date().toISOString().slice(0, 10);

const isPaidEntry = (e: LedgerEntry) => {
  const due = num(e.amountDue);
  const recv = num(e.amountReceived);
  return due > 0 && recv >= due;
};

const isFullyDone = (e: LedgerEntry) => isPaidEntry(e) && e.tallyReceiptDone && e.bookEntryDone;

type FormState = {
  invoiceDate: string;
  invoiceNo: string;
  amountDue: string;
  notes: string;
};

const emptyForm: FormState = {
  invoiceDate: today(),
  invoiceNo: "",
  amountDue: "",
  notes: "",
};

export default function AdminLedgerCustomer() {
  const params = useParams<{ name: string }>();
  const customerId = Number(params.name);
  const nav = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();

  const validId = Number.isFinite(customerId) && customerId > 0;

  const { data: customer, isLoading: cLoading, error: cError } = useQuery<Customer>({
    queryKey: ["/api/admin/customers", customerId],
    queryFn: () => api(`/api/admin/customers/${customerId}`),
    enabled: validId,
  });

  const { data: entries = [], isLoading } = useQuery<LedgerEntry[]>({
    queryKey: ["/api/admin/ledger", { customerId }],
    queryFn: () => api(`/api/admin/ledger?customerId=${customerId}`),
    enabled: validId,
  });

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<LedgerEntry | null>(null);
  const [form, setForm] = useState<FormState>({ ...emptyForm });

  const totals = useMemo(() => {
    let total = 0, paid = 0;
    let tallyPending = 0, bookPending = 0, fullyDone = 0;
    for (const e of entries) {
      const due = num(e.amountDue);
      total += due;
      if (isPaidEntry(e)) paid += due;
      if (isPaidEntry(e) && !e.tallyReceiptDone) tallyPending += 1;
      if (isPaidEntry(e) && !e.bookEntryDone) bookPending += 1;
      if (isFullyDone(e)) fullyDone += 1;
    }
    return {
      total, paid, pending: Math.max(0, total - paid), count: entries.length,
      tallyPending, bookPending, fullyDone,
    };
  }, [entries]);

  const create = useMutation({
    mutationFn: (data: any) => api("/api/admin/ledger", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/ledger"] });
      setAdding(false);
      setForm({ ...emptyForm });
      toast({ title: "Entry added" });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api(`/api/admin/ledger/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/ledger"] });
      setEditing(null);
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api(`/api/admin/ledger/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/ledger"] });
      toast({ title: "Deleted" });
    },
  });

  const submit = () => {
    if (!customer) return;
    if (!form.amountDue || num(form.amountDue) <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    const payload = {
      customerId: customer.id,
      customerName: customer.name,
      invoiceDate: form.invoiceDate || today(),
      invoiceNo: form.invoiceNo || "",
      amountDue: form.amountDue || "0",
      paymentDate: "",
      amountReceived: "0",
      receiptNo: "",
      notes: form.notes || "",
    };
    if (editing) update.mutate({ id: editing.id, data: payload });
    else create.mutate(payload);
  };

  const togglePaid = (e: LedgerEntry) => {
    const paid = isPaidEntry(e);
    const data = paid
      ? { amountReceived: "0", paymentDate: "" }
      : { amountReceived: e.amountDue || "0", paymentDate: today() };
    update.mutate({ id: e.id, data });
    toast({ title: paid ? "Marked as Pending" : "Marked as Paid" });
  };

  const toggleTally = (e: LedgerEntry) => {
    update.mutate({ id: e.id, data: { tallyReceiptDone: !e.tallyReceiptDone } });
  };

  const toggleBook = (e: LedgerEntry) => {
    update.mutate({ id: e.id, data: { bookEntryDone: !e.bookEntryDone } });
  };

  const startEdit = (e: LedgerEntry) => {
    setEditing(e);
    setAdding(true);
    setForm({
      invoiceDate: e.invoiceDate || today(),
      invoiceNo: e.invoiceNo || "",
      amountDue: e.amountDue || "",
      notes: e.notes || "",
    });
  };

  const closeForm = () => {
    setAdding(false);
    setEditing(null);
    setForm({ ...emptyForm });
  };

  if (!validId) {
    return (
      <AdminLayout>
        <p className="text-center text-muted-foreground py-12">Invalid customer.</p>
      </AdminLayout>
    );
  }

  if (cError) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Customer not found.</p>
          <button onClick={() => nav("/admin/ledger")} className="text-primary underline">Back to customer list</button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Helmet><title>{customer?.name || "Customer"} · Ledger</title></Helmet>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/admin/ledger"
            data-testid="link-back-customers"
            className="inline-flex items-center gap-1.5 text-sm font-semibold border border-border hover:bg-secondary px-3 py-2 rounded-md"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-bold truncate" data-testid="text-customer-name">
              {cLoading ? "…" : customer?.name}
            </h1>
            {customer && (
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-0.5">
                {customer.phone && <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" /> {customer.phone}</span>}
                {customer.address && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {customer.address}</span>}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => { setAdding(true); setEditing(null); setForm({ ...emptyForm }); }}
          data-testid="button-add-entry"
          disabled={!customer}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-md hover:opacity-90 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> New Entry
        </button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <Stat label="Total Amount" value={inr(totals.total)} icon={IndianRupee} tone="amber" testid="stat-total-amount" />
        <Stat label="Total Paid" value={inr(totals.paid)} icon={Wallet} tone="green" testid="stat-total-paid" />
        <Stat label="Total Pending" value={inr(totals.pending)} icon={AlertCircle} tone={totals.pending > 0 ? "red" : "green"} testid="stat-total-pending" />
        <Stat label="Entries" value={String(totals.count)} icon={ListChecks} tone="blue" testid="stat-entry-count" />
      </div>

      {/* T / B / Done summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <Stat label="T — Tally Receipt Pending" value={String(totals.tallyPending)} icon={FileSpreadsheet} tone={totals.tallyPending > 0 ? "red" : "green"} testid="stat-tally-pending" />
        <Stat label="B — Book Entry Pending" value={String(totals.bookPending)} icon={BookOpen} tone={totals.bookPending > 0 ? "red" : "green"} testid="stat-book-pending" />
        <Stat label="Fully Done (Paid + T + B)" value={String(totals.fullyDone)} icon={CheckCheck} tone="green" testid="stat-fully-done" />
      </div>

      {/* Entries */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60">
              <tr className="text-left">
                <Th className="w-28">Date</Th>
                <Th>Invoice No.</Th>
                <Th className="text-right">Amount (₹)</Th>
                <Th className="w-44">Payment Status</Th>
                <Th className="w-24 text-center" title="Tally Receipt entered">T</Th>
                <Th className="w-24 text-center" title="Book entry done">B</Th>
                <Th className="text-right w-32">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Loading…</td></tr>
              )}
              {!isLoading && entries.length === 0 && (
                <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">
                  <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  No entries yet — click <strong>New Entry</strong> to add one.
                </td></tr>
              )}
              {entries.map((e) => {
                const paid = isPaidEntry(e);
                const fully = isFullyDone(e);
                return (
                  <tr
                    key={e.id}
                    data-testid={`row-entry-${e.id}`}
                    className={`border-t border-border transition ${fully ? "bg-emerald-500/15 hover:bg-emerald-500/25" : paid ? "bg-emerald-500/5 hover:bg-emerald-500/10" : "hover:bg-secondary/30"}`}
                  >
                    <Td className="text-foreground/90">{e.invoiceDate || "—"}</Td>
                    <Td className="font-medium">{e.invoiceNo || "—"}</Td>
                    <Td className="text-right font-bold">{inr(num(e.amountDue))}</Td>
                    <Td>
                      <button
                        onClick={() => togglePaid(e)}
                        disabled={update.isPending}
                        data-testid={`button-toggle-paid-${e.id}`}
                        title={paid ? "Mark as pending" : "Mark as paid"}
                        className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide px-2.5 py-1.5 rounded ${
                          fully ? "bg-emerald-600 text-white" :
                          paid ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30" :
                          "bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30"
                        }`}
                      >
                        {fully ? (<><CheckCheck className="w-3.5 h-3.5" /> Fully Done</>)
                          : paid ? (<><Check className="w-3.5 h-3.5" /> Paid</>)
                          : (<>● Pending</>)}
                      </button>
                    </Td>
                    <Td className="text-center">
                      <button
                        onClick={() => toggleTally(e)}
                        disabled={update.isPending}
                        data-testid={`button-toggle-tally-${e.id}`}
                        title={e.tallyReceiptDone ? "Tally receipt done — click to undo" : "Mark Tally receipt done"}
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-md font-bold text-sm transition ${
                          e.tallyReceiptDone
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "border-2 border-dashed border-amber-500/60 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                        }`}
                      >
                        {e.tallyReceiptDone ? <Check className="w-4 h-4" /> : "T"}
                      </button>
                    </Td>
                    <Td className="text-center">
                      <button
                        onClick={() => toggleBook(e)}
                        disabled={update.isPending}
                        data-testid={`button-toggle-book-${e.id}`}
                        title={e.bookEntryDone ? "Book entry done — click to undo" : "Mark Book entry done"}
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-md font-bold text-sm transition ${
                          e.bookEntryDone
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "border-2 border-dashed border-amber-500/60 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                        }`}
                      >
                        {e.bookEntryDone ? <Check className="w-4 h-4" /> : "B"}
                      </button>
                    </Td>
                    <Td className="text-right whitespace-nowrap">
                      <button
                        onClick={() => startEdit(e)}
                        data-testid={`button-edit-entry-${e.id}`}
                        className="p-1.5 rounded hover:bg-primary/10 text-primary mr-1"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm("Delete this entry?")) remove.mutate(e.id); }}
                        data-testid={`button-delete-entry-${e.id}`}
                        className="p-1.5 rounded hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-border bg-secondary/30 text-[11px] text-muted-foreground">
          <strong>T</strong> = Tally Receipt entered &nbsp; · &nbsp; <strong>B</strong> = Book entry done &nbsp; · &nbsp; <strong className="text-emerald-700 dark:text-emerald-400">Fully Done</strong> = Payment received + T + B
        </div>
      </div>

      {/* Add / Edit modal — NO customer name field, customer is already selected */}
      {(adding || editing) && customer && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeForm}
        >
          <div
            className="bg-card rounded-xl border max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading text-lg font-bold">{editing ? "Edit Entry" : "New Entry"}</h2>
                <p className="text-xs text-muted-foreground">For <strong>{customer.name}</strong></p>
              </div>
              <button onClick={closeForm} aria-label="Close" className="p-1 rounded hover:bg-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Date">
                <input
                  type="date"
                  value={form.invoiceDate}
                  onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })}
                  data-testid="input-entry-date"
                  className={inputCls}
                />
              </Field>
              <Field label="Invoice No.">
                <input
                  type="text"
                  value={form.invoiceNo}
                  onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })}
                  placeholder="e.g. INV-001"
                  data-testid="input-entry-invoice"
                  className={inputCls}
                />
              </Field>
              <Field label="Amount (₹) *">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amountDue}
                  onChange={(e) => setForm({ ...form, amountDue: e.target.value })}
                  placeholder="0.00"
                  data-testid="input-entry-amount"
                  className={inputCls}
                  autoFocus
                />
              </Field>
              <Field label="Notes (optional)">
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  data-testid="input-entry-notes"
                  className={`${inputCls} resize-none`}
                />
              </Field>
              <p className="text-[11px] text-muted-foreground">New entries are saved as <strong>Pending</strong>. Use the tick on each row to mark Paid.</p>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={closeForm} className="px-4 py-2 rounded-md border border-border text-sm font-semibold hover:bg-secondary">
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={create.isPending || update.isPending}
                data-testid="button-save-entry"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-semibold hover:opacity-90 disabled:opacity-60"
              >
                {create.isPending || update.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editing ? "Update" : "Save Entry"}
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

const Th = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <th className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-foreground/80 ${className}`}>{children}</th>
);

const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-4 py-3 text-sm ${className}`}>{children}</td>
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
