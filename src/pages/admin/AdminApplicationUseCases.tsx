import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft, Plus, Pencil, Trash2, Loader2, X, Save, Image as ImageIcon,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import { api, uploadFile, type Industry } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ImagePicker } from "./AdminApplications";

type UseCase = { name: string; description: string; image: string };

const emptyUseCase: UseCase = { name: "", description: "", image: "" };

export default function AdminApplicationUseCases() {
  const { slug } = useParams<{ slug: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: industry, isLoading } = useQuery<Industry>({
    queryKey: ["/api/industries", slug],
    queryFn: () => api(`/api/industries/${slug}`),
    enabled: !!slug,
  });

  const useCases: UseCase[] = (industry?.applications || []) as UseCase[];

  const [draft, setDraft] = useState<UseCase | null>(null);
  const [draftIndex, setDraftIndex] = useState<number | null>(null); // null = adding new
  const [uploading, setUploading] = useState(false);

  // Reset modal whenever the industry changes
  useEffect(() => { setDraft(null); setDraftIndex(null); }, [slug]);

  const persist = useMutation({
    mutationFn: async (next: UseCase[]) => {
      if (!industry) throw new Error("No industry loaded");
      return api(`/api/admin/industries/${industry.id}`, {
        method: "PATCH",
        body: JSON.stringify({ applications: next }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/industries"] });
      qc.invalidateQueries({ queryKey: ["/api/industries", slug] });
      setDraft(null); setDraftIndex(null);
      toast({ title: "Saved" });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const handleUpload = async (file: File) => {
    if (!draft) return;
    setUploading(true);
    try {
      const { url } = await uploadFile(file);
      setDraft({ ...draft, image: url });
      toast({ title: "Image uploaded — click Save to apply" });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally { setUploading(false); }
  };

  const submitDraft = () => {
    if (!draft) return;
    if (!draft.name.trim()) { toast({ title: "Title is required", variant: "destructive" }); return; }
    if (!draft.image.trim()) { toast({ title: "Image is required", variant: "destructive" }); return; }
    const next = [...useCases];
    if (draftIndex === null) next.push(draft);
    else next[draftIndex] = draft;
    persist.mutate(next);
  };

  const removeAt = (idx: number) => {
    if (!confirm("Delete this use case?")) return;
    const next = useCases.filter((_, i) => i !== idx);
    persist.mutate(next);
  };

  if (isLoading) {
    return <AdminLayout><div className="p-12 text-center text-muted-foreground">Loading…</div></AdminLayout>;
  }
  if (!industry) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Application not found.</p>
          <Link to="/admin/applications" className="text-primary underline">Back to applications</Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Helmet><title>{industry.name} · Use Cases</title></Helmet>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/admin/applications" data-testid="link-back-applications" className="inline-flex items-center gap-1.5 text-sm font-semibold border border-border hover:bg-secondary px-3 py-2 rounded-md">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="flex items-center gap-3 min-w-0">
            {industry.image && <img src={industry.image} alt={industry.name} className="w-12 h-12 rounded-md object-cover border border-border" />}
            <div className="min-w-0">
              <h1 className="font-heading text-2xl font-bold truncate" data-testid="text-application-name">{industry.name}</h1>
              <p className="text-xs text-muted-foreground">{useCases.length} {useCases.length === 1 ? "use case" : "use cases"}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => { setDraft({ ...emptyUseCase }); setDraftIndex(null); }}
          data-testid="button-add-usecase"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-md hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Add Use Case
        </button>
      </div>

      {/* Use Cases grid */}
      {useCases.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center">
          <ImageIcon className="w-10 h-10 mx-auto opacity-40 text-muted-foreground" />
          <p className="text-muted-foreground mt-3">No use cases yet for <strong>{industry.name}</strong>.</p>
          <p className="text-xs text-muted-foreground mt-1">Click <strong>Add Use Case</strong> to add the first one with its own image.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {useCases.map((u, idx) => (
            <div
              key={idx}
              data-testid={`card-usecase-${idx}`}
              className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition flex flex-col"
            >
              <div className="aspect-[4/3] bg-secondary/40 overflow-hidden">
                {u.image ? (
                  <img src={u.image} alt={u.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-8 h-8 opacity-40" />
                  </div>
                )}
              </div>
              <div className="p-3 flex flex-col flex-1">
                <div className="font-semibold text-foreground truncate" data-testid={`text-usecase-name-${idx}`}>{u.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-3 mt-1 flex-1">{u.description || "—"}</div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => { setDraft({ ...u }); setDraftIndex(idx); }}
                    data-testid={`button-edit-usecase-${idx}`}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold border border-border rounded hover:border-primary hover:text-primary"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => removeAt(idx)}
                    data-testid={`button-delete-usecase-${idx}`}
                    className="px-2.5 py-1.5 text-xs border border-destructive/40 text-destructive rounded hover:bg-destructive/10"
                    aria-label="Delete use case"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Use Case modal */}
      {draft && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => { setDraft(null); setDraftIndex(null); }}
        >
          <div
            className="bg-card rounded-xl border max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading text-lg font-bold">
                  {draftIndex === null ? "New Use Case" : "Edit Use Case"}
                </h2>
                <p className="text-xs text-muted-foreground">For <strong>{industry.name}</strong></p>
              </div>
              <button onClick={() => { setDraft(null); setDraftIndex(null); }} aria-label="Close" className="p-1 rounded hover:bg-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Title *">
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="e.g. Engine Mounting Bolts"
                  data-testid="input-usecase-title"
                  className={inputCls}
                  autoFocus
                />
              </Field>
              <Field label="Description">
                <textarea
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder="Where it is used and what makes it special"
                  data-testid="input-usecase-description"
                  className={`${inputCls} resize-none`}
                />
              </Field>
              <Field label="Image *">
                <ImagePicker
                  value={draft.image}
                  onChange={(v) => setDraft({ ...draft, image: v })}
                  onUpload={handleUpload}
                  uploading={uploading}
                />
              </Field>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => { setDraft(null); setDraftIndex(null); }} className="px-4 py-2 rounded-md border border-border text-sm font-semibold hover:bg-secondary">
                Cancel
              </button>
              <button
                onClick={submitDraft}
                disabled={persist.isPending || uploading}
                data-testid="button-save-usecase"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-semibold hover:opacity-90 disabled:opacity-60"
              >
                {persist.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Use Case
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
