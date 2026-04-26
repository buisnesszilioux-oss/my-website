import { useEffect, useState } from "react";
import { uploadFile } from "@/lib/api";
import { X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export type Field =
  | { name: string; label: string; type: "text" | "textarea" | "image" }
  | { name: string; label: string; type: "list" }       // string[]
  | { name: string; label: string; type: "json"; placeholder?: string }; // free-form jsonb

export default function EditDialog({
  open, onClose, onSave, title, fields, initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (values: any) => Promise<void>;
  title: string;
  fields: Field[];
  initial: any;
}) {
  const [values, setValues] = useState<any>(initial);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  useEffect(() => { setValues(initial); }, [initial]);

  if (!open) return null;

  const set = (n: string, v: any) => setValues((p: any) => ({ ...p, [n]: v }));

  const handleFile = async (n: string, file: File) => {
    try {
      setBusy(true);
      const { url } = await uploadFile(file);
      set(n, url);
      toast({ title: "Uploaded", description: file.name });
    } catch (e: any) { toast({ title: "Upload failed", description: e.message, variant: "destructive" }); }
    finally { setBusy(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setBusy(true);
      const out: any = { ...values };
      for (const f of fields) {
        if (f.type === "list" && typeof out[f.name] === "string") {
          out[f.name] = out[f.name].split("\n").map((x: string) => x.trim()).filter(Boolean);
        }
        if (f.type === "json" && typeof out[f.name] === "string") {
          try { out[f.name] = JSON.parse(out[f.name] || "[]"); } catch { throw new Error(`Invalid JSON in ${f.label}`); }
        }
      }
      await onSave(out);
      onClose();
    } catch (e: any) { toast({ title: "Save failed", description: e.message, variant: "destructive" }); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start md:items-center justify-center p-4 overflow-y-auto">
      <form onSubmit={submit} className="bg-card border border-border rounded-xl shadow-elegant w-full max-w-2xl my-6">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-heading text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {fields.map((f) => {
            const v = values?.[f.name];
            if (f.type === "text") return (
              <label key={f.name} className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{f.label}</span>
                <input value={v ?? ""} onChange={(e) => set(f.name, e.target.value)} className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </label>
            );
            if (f.type === "textarea") return (
              <label key={f.name} className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{f.label}</span>
                <textarea rows={4} value={v ?? ""} onChange={(e) => set(f.name, e.target.value)} className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </label>
            );
            if (f.type === "image") return (
              <div key={f.name}>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{f.label}</span>
                <div className="mt-1 flex items-center gap-3">
                  {v && <img src={v} alt="" className="w-20 h-20 object-cover rounded border border-border" />}
                  <input value={v ?? ""} onChange={(e) => set(f.name, e.target.value)} placeholder="Paste image URL or upload" className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-2 bg-secondary hover:bg-secondary/70 rounded-md text-sm">
                    <Upload className="w-4 h-4" /> Upload
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f2 = e.target.files?.[0]; if (f2) handleFile(f.name, f2); }} />
                  </label>
                </div>
              </div>
            );
            if (f.type === "list") return (
              <label key={f.name} className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{f.label} <span className="normal-case font-normal text-[11px]">(one per line)</span></span>
                <textarea rows={4} value={Array.isArray(v) ? v.join("\n") : (v ?? "")} onChange={(e) => set(f.name, e.target.value)} className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none font-mono" />
              </label>
            );
            if (f.type === "json") return (
              <label key={f.name} className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{f.label} <span className="normal-case font-normal text-[11px]">(JSON)</span></span>
                <textarea rows={6} placeholder={f.placeholder} value={typeof v === "string" ? v : JSON.stringify(v ?? [], null, 2)} onChange={(e) => set(f.name, e.target.value)} className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none font-mono" />
              </label>
            );
            return null;
          })}
        </div>
        <div className="flex justify-end gap-2 p-5 border-t border-border bg-secondary/30">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border border-border hover:bg-secondary">Cancel</button>
          <button type="submit" disabled={busy} data-testid="button-save" className="px-5 py-2 rounded-md bg-gradient-gold text-charcoal font-semibold disabled:opacity-60">{busy ? "Saving…" : "Save"}</button>
        </div>
      </form>
    </div>
  );
}
