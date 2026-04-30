import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import EditDialog, { type Field } from "./EditDialog";
import { api, type Product } from "@/lib/api";
import { Pencil, Trash2, Plus, Search, ImageOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PRODUCT_CATEGORIES = [
  "Bolts",
  "Nuts",
  "Screws",
  "Washers",
  "Rivets",
  "Threaded Rods / Studs",
  "Anchors",
  "Industrial / Heavy",
  "Special",
];

const fields: Field[] = [
  { name: "name", label: "Product Name", type: "text" },
  { name: "image", label: "Main Image", type: "image" },
  { name: "images", label: "Gallery Images", type: "images" },
  { name: "standard", label: "Standard", type: "text" },
  { name: "category", label: "Category", type: "select", options: PRODUCT_CATEGORIES },
  { name: "description", label: "Short Description", type: "textarea" },
  { name: "slug", label: "Slug (URL)", type: "text" },
];

const empty: Partial<Product> = {
  slug: "",
  name: "",
  image: "",
  images: [],
  standard: "",
  category: "Bolts",
  description: "",
  sizes: "",
  threads: "",
  length: "",
  material: "",
  finish: [],
  grades: [],
  applications: [],
  dimensions: [],
};

const AdminCatalogue = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: () => api("/api/products"),
  });
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");

  const save = useMutation({
    mutationFn: (v: Product) =>
      v.id
        ? api(`/api/admin/products/${v.id}`, { method: "PATCH", body: JSON.stringify(v) })
        : api("/api/admin/products", { method: "POST", body: JSON.stringify(v) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Saved" });
    },
  });

  const del = useMutation({
    mutationFn: (id: string) => api(`/api/admin/products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Deleted" });
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data || []).filter((p) => {
      if (category !== "All" && (p.category || "Special") !== category) return false;
      if (!q) return true;
      return `${p.name} ${p.standard} ${p.slug}`.toLowerCase().includes(q);
    });
  }, [data, search, category]);

  return (
    <AdminLayout>
      <div className="flex justify-between items-start mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-3xl font-bold">Catalogue</h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-xl">
            Edit the products shown in the
            <span className="font-semibold"> Premium Industrial Fasteners </span>
            grid on the home page and the products page. Upload images and update names,
            categories, and descriptions.
          </p>
        </div>
        <button
          onClick={() => setEditing(empty)}
          data-testid="button-add-catalogue-product"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-gold text-charcoal rounded-md font-semibold"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-card border border-border rounded-lg p-4 mb-5 flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, standard, or slug…"
            data-testid="input-catalogue-search"
            className="w-full pl-9 pr-3 py-2 rounded-md bg-background border border-border focus:border-primary/60 outline-none text-sm"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          data-testid="select-catalogue-category"
          className="bg-background border border-border rounded-md px-3 py-2 text-sm"
        >
          <option value="All">All Categories</option>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading catalogue…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-lg p-10 text-center">
          <p className="text-foreground font-semibold">No products match your filter.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Clear the search or pick a different category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              data-testid={`card-catalogue-${p.slug}`}
              className="bg-card border border-border rounded-lg overflow-hidden shadow-sm flex flex-col"
            >
              <div className="aspect-square bg-secondary/30 flex items-center justify-center overflow-hidden">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                ) : (
                  <ImageOff className="w-10 h-10 text-muted-foreground/60" />
                )}
              </div>
              <div className="p-3 border-t border-border flex flex-col flex-1">
                <div className="font-semibold text-sm line-clamp-1">{p.name}</div>
                <div className="text-[11px] text-muted-foreground line-clamp-1">{p.standard}</div>
                <div className="mt-1 inline-flex w-fit text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                  {p.category || "Special"}
                </div>
                <div className="mt-3 flex items-center gap-2 mt-auto">
                  <button
                    onClick={() => setEditing(p)}
                    data-testid={`button-edit-catalogue-${p.slug}`}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs border border-border rounded hover:border-primary hover:text-primary"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${p.name}"?`)) del.mutate(p.id);
                    }}
                    data-testid={`button-delete-catalogue-${p.slug}`}
                    className="inline-flex items-center justify-center px-2 py-1.5 text-xs border border-destructive/40 text-destructive rounded hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
        title={editing?.id ? "Edit Product" : "New Product"}
        fields={fields}
        initial={editing || empty}
      />
    </AdminLayout>
  );
};

export default AdminCatalogue;
