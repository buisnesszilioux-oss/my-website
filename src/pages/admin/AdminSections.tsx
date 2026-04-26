import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import EditDialog, { type Field } from "./EditDialog";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

type PageSection = {
  id: number;
  page: string;
  position: string;
  title: string;
  subtitle: string;
  body: string;
  image: string;
  linkText: string;
  linkUrl: string;
  enabled: boolean;
};

const positions = [
  { value: "top", label: "Top of homepage" },
  { value: "after-hero", label: "After Hero" },
  { value: "after-about", label: "After About" },
  { value: "after-stats", label: "After Stats" },
  { value: "after-applications", label: "After Applications" },
  { value: "after-standards", label: "After Standards" },
  { value: "after-gallery", label: "After Gallery" },
  { value: "before-contact", label: "Before Contact" },
];

const fields: Field[] = [
  { name: "title", label: "Title", type: "text" },
  { name: "subtitle", label: "Subtitle / Tagline", type: "text" },
  { name: "body", label: "Body Text", type: "textarea" },
  { name: "image", label: "Image (optional)", type: "image" },
  { name: "linkText", label: "Button Text (optional)", type: "text" },
  { name: "linkUrl", label: "Button Link (optional)", type: "text" },
  { name: "position", label: "Position on page (top, after-hero, after-about, after-stats, after-applications, after-standards, after-gallery, before-contact)", type: "text" },
];

const empty: Partial<PageSection> = { page: "home", position: "after-stats", title: "", subtitle: "", body: "", image: "", linkText: "", linkUrl: "", enabled: true };

export default function AdminSections() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data } = useQuery<PageSection[]>({ queryKey: ["/api/page-sections"], queryFn: () => api("/api/page-sections?page=home") });
  const [editing, setEditing] = useState<any>(null);

  const save = useMutation({
    mutationFn: (v: any) => v.id
      ? api(`/api/admin/page-sections/${v.id}`, { method: "PATCH", body: JSON.stringify(v) })
      : api("/api/admin/page-sections", { method: "POST", body: JSON.stringify({ ...v, page: "home" }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/page-sections"] }); toast({ title: "Saved" }); },
    onError: (e: any) => toast({ title: "Save failed", description: e?.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => api(`/api/admin/page-sections/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/page-sections"] }); toast({ title: "Deleted" }); },
  });

  const toggleEnabled = (s: PageSection) => {
    save.mutate({ id: s.id, enabled: !s.enabled });
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-start mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Custom Sections</h1>
          <p className="text-muted-foreground text-sm mt-1">Add new sections (banners, callouts, services) anywhere on the homepage.</p>
        </div>
        <button onClick={() => setEditing(empty)} data-testid="button-add-section"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-gold text-charcoal rounded-md font-semibold">
          <Plus className="w-4 h-4" /> Add Section
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {(!data || data.length === 0) ? (
          <div className="p-10 text-center">
            <p className="text-muted-foreground">No custom sections yet.</p>
            <button onClick={() => setEditing(empty)} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-gold text-charcoal rounded-md font-semibold">
              <Plus className="w-4 h-4" /> Add Your First Section
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-3">Image</th>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Position</th>
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((s) => (
                <tr key={s.id} data-testid={`row-section-${s.id}`}>
                  <td className="p-3 w-20">
                    {s.image && <img src={s.image} alt="" className="w-14 h-14 object-cover rounded border border-border" />}
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-foreground">{s.title || <em className="text-muted-foreground">Untitled</em>}</div>
                    {s.subtitle && <div className="text-xs text-muted-foreground">{s.subtitle}</div>}
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">{positions.find(p => p.value === s.position)?.label || s.position}</td>
                  <td className="p-3">
                    <button onClick={() => toggleEnabled(s)} className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${s.enabled ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                      {s.enabled ? <><Eye className="w-3 h-3" /> Visible</> : <><EyeOff className="w-3 h-3" /> Hidden</>}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => setEditing(s)} data-testid={`button-edit-section-${s.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-border rounded hover:border-primary hover:text-primary mr-2"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                    <button onClick={() => { if (confirm(`Delete section "${s.title}"?`)) del.mutate(s.id); }} data-testid={`button-delete-section-${s.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-destructive/40 text-destructive rounded hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <EditDialog
        open={!!editing}
        onClose={() => setEditing(null)}
        onSave={async (v) => save.mutateAsync(v)}
        title={editing?.id ? "Edit Section" : "New Section"}
        fields={fields}
        initial={editing || empty}
      />
    </AdminLayout>
  );
}
