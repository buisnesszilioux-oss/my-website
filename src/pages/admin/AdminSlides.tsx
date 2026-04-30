import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import EditDialog, { type Field } from "./EditDialog";
import { api } from "@/lib/api";
import { Pencil, Trash2, Plus, ImageOff, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface HomeSlide {
  id: string;
  slug: string;
  name: string;
  image: string;
  standard: string;
  link?: string;
  enabled?: boolean;
  sortOrder?: number;
}

const fields: Field[] = [
  { name: "name", label: "Product Name", type: "text" },
  { name: "image", label: "Slide Image", type: "image" },
  { name: "standard", label: "Standard / Caption", type: "text" },
  { name: "slug", label: "Slug (used in link to product)", type: "text" },
  { name: "link", label: "Custom Link (optional, e.g. /product/stud-bolts)", type: "text" },
];

const empty: Partial<HomeSlide> = {
  slug: "",
  name: "",
  image: "",
  standard: "",
  link: "",
  enabled: true,
  sortOrder: 0,
};

const AdminSlides = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useQuery<HomeSlide[]>({
    queryKey: ["/api/admin/home-slides"],
    queryFn: () => api("/api/admin/home-slides"),
  });
  const [editing, setEditing] = useState<any>(null);

  const save = useMutation({
    mutationFn: (v: HomeSlide) =>
      v.id
        ? api(`/api/admin/home-slides/${v.id}`, { method: "PATCH", body: JSON.stringify(v) })
        : api("/api/admin/home-slides", { method: "POST", body: JSON.stringify(v) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/home-slides"] });
      qc.invalidateQueries({ queryKey: ["/api/home-slides"] });
      toast({ title: "Saved" });
    },
  });

  const del = useMutation({
    mutationFn: (id: string) => api(`/api/admin/home-slides/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/home-slides"] });
      qc.invalidateQueries({ queryKey: ["/api/home-slides"] });
      toast({ title: "Deleted" });
    },
  });

  const toggleEnabled = useMutation({
    mutationFn: (s: HomeSlide) =>
      api(`/api/admin/home-slides/${s.id}`, {
        method: "PATCH",
        body: JSON.stringify({ enabled: !(s.enabled !== false) }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/home-slides"] });
      qc.invalidateQueries({ queryKey: ["/api/home-slides"] });
    },
  });

  const reorder = useMutation({
    mutationFn: ({ id, sortOrder }: { id: string; sortOrder: number }) =>
      api(`/api/admin/home-slides/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ sortOrder }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/home-slides"] });
      qc.invalidateQueries({ queryKey: ["/api/home-slides"] });
    },
  });

  const slides = (data || []).slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const move = (idx: number, dir: -1 | 1) => {
    const a = slides[idx];
    const b = slides[idx + dir];
    if (!a || !b) return;
    reorder.mutate({ id: a.id, sortOrder: b.sortOrder ?? idx + dir });
    reorder.mutate({ id: b.id, sortOrder: a.sortOrder ?? idx });
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-start mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-3xl font-bold">Home Page Slides</h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-xl">
            Edit the auto-rotating product slider that appears on the home page below the
            <span className="font-semibold"> Premium B7 Fasteners</span> heading. Add a slide,
            upload an image, set the caption, and reorder.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...empty, sortOrder: slides.length })}
          data-testid="button-add-slide"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-gold text-charcoal rounded-md font-semibold"
        >
          <Plus className="w-4 h-4" /> Add Slide
        </button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading slides…</div>
      ) : slides.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-lg p-10 text-center">
          <ImageOff className="w-10 h-10 mx-auto text-muted-foreground/60 mb-3" />
          <p className="text-foreground font-semibold">No slides yet</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            The home page is currently showing the built-in default product slides. Add your
            first custom slide here to take over the slider.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slides.map((s, i) => (
            <div
              key={s.id}
              data-testid={`row-slide-${s.slug || s.id}`}
              className={`bg-card border border-border rounded-lg overflow-hidden shadow-sm ${
                s.enabled === false ? "opacity-60" : ""
              }`}
            >
              <div className="aspect-square bg-secondary/30 flex items-center justify-center overflow-hidden">
                {s.image ? (
                  <img src={s.image} alt={s.name} className="w-full h-full object-contain" />
                ) : (
                  <ImageOff className="w-10 h-10 text-muted-foreground/60" />
                )}
              </div>
              <div className="p-3 border-t border-border">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{s.name || "Untitled"}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{s.standard}</div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      s.enabled === false
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/15 text-primary"
                    }`}
                  >
                    {s.enabled === false ? "Hidden" : "Live"}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="p-1.5 border border-border rounded hover:border-primary hover:text-primary disabled:opacity-40"
                    title="Move up"
                    data-testid={`button-up-${s.slug || s.id}`}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === slides.length - 1}
                    className="p-1.5 border border-border rounded hover:border-primary hover:text-primary disabled:opacity-40"
                    title="Move down"
                    data-testid={`button-down-${s.slug || s.id}`}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => toggleEnabled.mutate(s)}
                    className="ml-1 px-2 py-1 text-[11px] border border-border rounded hover:border-primary hover:text-primary"
                    data-testid={`button-toggle-${s.slug || s.id}`}
                  >
                    {s.enabled === false ? "Show" : "Hide"}
                  </button>
                  <button
                    onClick={() => setEditing(s)}
                    className="ml-auto inline-flex items-center gap-1 px-2 py-1 text-[11px] border border-border rounded hover:border-primary hover:text-primary"
                    data-testid={`button-edit-slide-${s.slug || s.id}`}
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete slide "${s.name}"?`)) del.mutate(s.id);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] border border-destructive/40 text-destructive rounded hover:bg-destructive/10"
                    data-testid={`button-delete-slide-${s.slug || s.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <EditDialog
        open={!!editing}
        onClose={() => setEditing(null)}
        onSave={async (v) => save.mutateAsync(v)}
        title={editing?.id ? "Edit Slide" : "New Slide"}
        fields={fields}
        initial={editing || empty}
      />
    </AdminLayout>
  );
};

export default AdminSlides;
