import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import EditDialog, { type Field } from "./EditDialog";
import { api, type Industry } from "@/lib/api";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const fields: Field[] = [
  { name: "slug", label: "Slug", type: "text" },
  { name: "name", label: "Name", type: "text" },
  { name: "image", label: "Hero Image", type: "image" },
  { name: "description", label: "Short Description", type: "textarea" },
  { name: "heroDescription", label: "Detailed Hero Description", type: "textarea" },
  { name: "grades", label: "Grades", type: "json", placeholder: '[{"grade":"ASTM A193 B7","specification":"…","usage":"…"}]' },
  { name: "applications", label: "Use-Case Applications", type: "json", placeholder: '[{"name":"…","description":"…","image":"…"}]' },
  { name: "keyRequirements", label: "Key Requirements", type: "list" },
];

const empty: Partial<Industry> = { slug: "", name: "", image: "", description: "", heroDescription: "", grades: [], applications: [], keyRequirements: [] };

const AdminIndustries = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data } = useQuery<Industry[]>({ queryKey: ["/api/industries"], queryFn: () => api("/api/industries") });
  const [editing, setEditing] = useState<any>(null);

  const save = useMutation({
    mutationFn: (v: Industry) => v.id
      ? api(`/api/admin/industries/${v.id}`, { method: "PATCH", body: JSON.stringify(v) })
      : api("/api/admin/industries", { method: "POST", body: JSON.stringify(v) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/industries"] }); toast({ title: "Saved" }); },
  });
  const del = useMutation({
    mutationFn: (id: number) => api(`/api/admin/industries/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/industries"] }); toast({ title: "Deleted" }); },
  });

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">Industries / Applications</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage industry pages, hero images, and detail content.</p>
        </div>
        <button onClick={() => setEditing(empty)} data-testid="button-add-industry" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-gold text-charcoal rounded-md font-semibold">
          <Plus className="w-4 h-4" /> Add Industry
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(data || []).map((i) => (
          <div key={i.id} className="bg-card rounded-lg border border-border overflow-hidden" data-testid={`card-industry-${i.slug}`}>
            <img src={i.image} alt={i.name} className="aspect-[4/3] w-full object-cover" />
            <div className="p-3">
              <div className="font-semibold text-foreground">{i.name}</div>
              <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{i.description}</div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setEditing(i)} data-testid={`button-edit-${i.slug}`} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs border border-border rounded hover:border-primary hover:text-primary"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                <button onClick={() => { if (confirm(`Delete "${i.name}"?`)) del.mutate(i.id); }} data-testid={`button-delete-${i.slug}`} className="px-3 py-1.5 text-xs border border-destructive/40 text-destructive rounded hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <EditDialog open={!!editing} onClose={() => setEditing(null)} onSave={async (v) => save.mutateAsync(v)} title={editing?.id ? "Edit Industry" : "New Industry"} fields={fields} initial={editing || empty} />
    </AdminLayout>
  );
};

export default AdminIndustries;
