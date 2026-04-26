import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import EditDialog, { type Field } from "./EditDialog";
import { api, type Standard } from "@/lib/api";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const fields: Field[] = [
  { name: "slug", label: "Slug", type: "text" },
  { name: "code", label: "Code (e.g. ASTM)", type: "text" },
  { name: "name", label: "Full Name", type: "text" },
  { name: "region", label: "Region", type: "text" },
  { name: "image", label: "Image", type: "image" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "scope", label: "Scope", type: "textarea" },
  { name: "applications", label: "Applications", type: "list" },
  { name: "materials", label: "Materials", type: "list" },
  { name: "examples", label: "Example Specifications", type: "list" },
];

const empty: Partial<Standard> = { slug: "", code: "", name: "", region: "", image: "", description: "", scope: "", applications: [], materials: [], examples: [] };

const AdminStandards = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data } = useQuery<Standard[]>({ queryKey: ["/api/standards"], queryFn: () => api("/api/standards") });
  const [editing, setEditing] = useState<any>(null);

  const save = useMutation({
    mutationFn: (v: Standard) => v.id
      ? api(`/api/admin/standards/${v.id}`, { method: "PATCH", body: JSON.stringify(v) })
      : api("/api/admin/standards", { method: "POST", body: JSON.stringify(v) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/standards"] }); toast({ title: "Saved" }); },
  });
  const del = useMutation({
    mutationFn: (id: number) => api(`/api/admin/standards/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/standards"] }); toast({ title: "Deleted" }); },
  });

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">Standards</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage standard archive pages.</p>
        </div>
        <button onClick={() => setEditing(empty)} data-testid="button-add-standard" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-gold text-charcoal rounded-md font-semibold">
          <Plus className="w-4 h-4" /> Add Standard
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(data || []).map((s) => (
          <div key={s.id} className="bg-card rounded-lg border border-border overflow-hidden" data-testid={`card-standard-${s.slug}`}>
            {s.image && <img src={s.image} alt={s.code} className="aspect-[16/9] w-full object-cover" />}
            <div className="p-4">
              <div className="font-heading text-lg font-bold text-gradient-gold">{s.code}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.region}</div>
              <div className="text-sm font-semibold text-foreground mt-1">{s.name}</div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setEditing(s)} data-testid={`button-edit-${s.slug}`} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs border border-border rounded hover:border-primary hover:text-primary"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                <button onClick={() => { if (confirm(`Delete "${s.code}"?`)) del.mutate(s.id); }} data-testid={`button-delete-${s.slug}`} className="px-3 py-1.5 text-xs border border-destructive/40 text-destructive rounded hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <EditDialog open={!!editing} onClose={() => setEditing(null)} onSave={async (v) => save.mutateAsync(v)} title={editing?.id ? "Edit Standard" : "New Standard"} fields={fields} initial={editing || empty} />
    </AdminLayout>
  );
};

export default AdminStandards;
