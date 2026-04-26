import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Plus, Pencil, Trash2, Layers, ChevronRight, Upload, Loader2, X, Save, Image as ImageIcon,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import { api, uploadFile, type Industry } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

type FormState = {
  id?: number;
  slug: string;
  name: string;
  image: string;
  description: string;
};

const empty: FormState = { slug: "", name: "", image: "", description: "" };

export default function AdminApplications() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: industries = [], isLoading } = useQuery<Industry[]>({
    queryKey: ["/api/industries"],
    queryFn: () => api("/api/industries"),
  });

  const [editing, setEditing] = useState<FormState | null>(null);
  const [uploading, setUploading] = useState(false);

  const save = useMutation({
    mutationFn: async (v: FormState) => {
      const body = {
        slug: v.slug || slugify(v.name),
        name: v.name,
        image: v.image,
        description: v.description,
      };
      if (v.id) return api(`/api/admin/industries/${v.id}`, { method: "PATCH", body: JSON.stringify(body) });
      // include defaults for required jsonb / array columns when creating
      return api("/api/admin/industries", {
        method: "POST",
        body: JSON.stringify({ ...body, heroDescription: "", grades: [], applications: [], keyRequirements: [] }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/industries"] });
      setEditing(null);
      toast({ title: "Application saved" });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => api(`/api/admin/industries/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/industries"] }); toast({ title: "Deleted" }); },
  });

  const handleUpload = async (file: File) => {
    if (!editing) return;
    setUploading(true);
    try {
      const { url } = await uploadFile(file);
      setEditing({ ...editing, image: url });
      toast({ title: "Image uploaded — remember to Save" });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally { setUploading(false); }
  };

  const submit = () => {
    if (!editing?.name?.trim()) { toast({ title: "Name is required", variant: "destructive" }); return; }
    if (!editing.image?.trim()) { toast({ title: "Main image is required", variant: "destructive" }); return; }
    save.mutate(editing);
  };

  return (
    <AdminLayout>
      <Helmet><title>Applications & Use Cases · Admin</title></Helmet>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" /> Applications / Use Cases
          </h1>
          <p className="text-sm text-muted-foreground">
            Each application is an industry your fasteners serve. Click a card to manage its use cases and per-use-case images.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...empty })}
          data-testid="button-add-application"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-md hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Add Application
        </button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-card animate-pulse rounded-xl" />
          ))}
        </div>
      ) : industries.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center text-muted-foreground">
          No applications yet — click <strong>Add Application</strong> to create your first one.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {industries.map((i) => {
            const useCaseCount = (i.applications || []).length;
            return (
              <div
                key={i.id}
                data-testid={`card-application-${i.slug}`}
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-gold transition group flex flex-col"
              >
                <Link to={`/admin/applications/${i.slug}`} className="block relative aspect-[4/3] overflow-hidden">
                  {i.image ? (
                    <img src={i.image} alt={i.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/40">
                      <ImageIcon className="w-10 h-10 opacity-40" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur text-white text-[10px] font-semibold px-2 py-1 rounded">
                    {useCaseCount} {useCaseCount === 1 ? "use case" : "use cases"}
                  </div>
                </Link>
                <div className="p-3 flex flex-col flex-1">
                  <div className="font-semibold text-foreground truncate">{i.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5 flex-1">{i.description || "—"}</div>
                  <div className="flex gap-2 mt-3">
                    <Link
                      to={`/admin/applications/${i.slug}`}
                      data-testid={`button-manage-usecases-${i.slug}`}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded hover:opacity-90"
                    >
                      Use Cases <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => setEditing({
                        id: i.id, slug: i.slug, name: i.name, image: i.image, description: i.description,
                      })}
                      data-testid={`button-edit-application-${i.slug}`}
                      className="px-2.5 py-1.5 text-xs border border-border rounded hover:border-primary hover:text-primary"
                      aria-label="Edit application"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { if (confirm(`Delete "${i.name}" and all its use cases?`)) del.mutate(i.id); }}
                      data-testid={`button-delete-application-${i.slug}`}
                      className="px-2.5 py-1.5 text-xs border border-destructive/40 text-destructive rounded hover:bg-destructive/10"
                      aria-label="Delete application"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Application modal */}
      {editing && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="bg-card rounded-xl border max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold">
                {editing.id ? "Edit Application" : "New Application"}
              </h2>
              <button onClick={() => setEditing(null)} aria-label="Close" className="p-1 rounded hover:bg-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Application Name *">
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })}
                  placeholder="e.g. Aerospace, Oil & Gas, Automotive"
                  data-testid="input-application-name"
                  className={inputCls}
                  autoFocus
                />
              </Field>

              <Field label="URL Slug">
                <input
                  type="text"
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })}
                  placeholder="auto-generated from name"
                  data-testid="input-application-slug"
                  className={inputCls}
                />
                <p className="text-[11px] text-muted-foreground mt-1">Used in the public URL: <code>/industry/{editing.slug || "your-slug"}</code></p>
              </Field>

              <Field label="Main Image *">
                <ImagePicker
                  value={editing.image}
                  onChange={(v) => setEditing({ ...editing, image: v })}
                  onUpload={handleUpload}
                  uploading={uploading}
                />
              </Field>

              <Field label="Short Description">
                <textarea
                  rows={3}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  placeholder="Brief description shown on cards"
                  data-testid="input-application-description"
                  className={`${inputCls} resize-none`}
                />
              </Field>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-md border border-border text-sm font-semibold hover:bg-secondary">
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={save.isPending || uploading}
                data-testid="button-save-application"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-semibold hover:opacity-90 disabled:opacity-60"
              >
                {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Application
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

export const ImagePicker = ({
  value, onChange, onUpload, uploading,
}: {
  value: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => void | Promise<void>;
  uploading: boolean;
}) => {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste image URL or click Upload"
          className={`${inputCls} flex-1`}
        />
        <label className={`inline-flex items-center gap-1.5 cursor-pointer px-3 py-2 rounded-md border border-border text-sm font-semibold hover:border-primary hover:text-primary ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? "Uploading…" : "Upload"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.currentTarget.value = ""; }}
          />
        </label>
      </div>
      {value && (
        <div className="rounded-md border border-border overflow-hidden bg-secondary/30">
          <img src={value} alt="Preview" className="w-full max-h-48 object-cover" />
        </div>
      )}
    </div>
  );
};
