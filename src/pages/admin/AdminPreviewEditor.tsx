import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Save, RefreshCw, Smartphone, Monitor, Image as ImageIcon, Type, Loader2, ExternalLink, Search } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { SITE_CONTENT_DEFAULTS } from "@/hooks/useSiteContent";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// ── Field groups (everything editable, organised like Shopify Theme Editor) ────
type FieldDef = { key: string; label: string; multiline?: boolean; image?: boolean };
type FieldGroup = { title: string; preview: string; fields: FieldDef[] };

const GROUPS: FieldGroup[] = [
  {
    title: "Brand Identity",
    preview: "/",
    fields: [
      { key: "brand.name",     label: "Brand Name" },
      { key: "brand.tagline",  label: "Tagline" },
      { key: "brand.logo",     label: "Logo Image",    image: true },
      { key: "brand.favicon",  label: "Favicon Image", image: true },
    ],
  },
  {
    title: "Hero Section",
    preview: "/#hero",
    fields: [
      { key: "hero.eyebrow",   label: "Eyebrow / Tag" },
      { key: "hero.title",     label: "Main Title", multiline: true },
      { key: "hero.subtitle",  label: "Subtitle",   multiline: true },
      { key: "hero.cta1",      label: "Primary Button Text" },
      { key: "hero.cta2",      label: "Secondary Button Text" },
      { key: "hero.image",     label: "Hero Image", image: true },
    ],
  },
  {
    title: "About Section",
    preview: "/#about",
    fields: [
      { key: "about.title",     label: "Title" },
      { key: "about.subtitle",  label: "Subtitle", multiline: true },
      { key: "about.body",      label: "Body Text", multiline: true },
      { key: "about.image",     label: "Image", image: true },
    ],
  },
  {
    title: "Stats / Counters",
    preview: "/#stats",
    fields: [
      { key: "stats.label1", label: "Stat 1 Label" }, { key: "stats.value1", label: "Stat 1 Value" },
      { key: "stats.label2", label: "Stat 2 Label" }, { key: "stats.value2", label: "Stat 2 Value" },
      { key: "stats.label3", label: "Stat 3 Label" }, { key: "stats.value3", label: "Stat 3 Value" },
      { key: "stats.label4", label: "Stat 4 Label" }, { key: "stats.value4", label: "Stat 4 Value" },
    ],
  },
  {
    title: "Contact Info",
    preview: "/contact",
    fields: [
      { key: "contact.phone1",  label: "Phone 1" },
      { key: "contact.phone2",  label: "Phone 2" },
      { key: "contact.email",   label: "Email" },
      { key: "contact.address", label: "Address", multiline: true },
      { key: "contact.hours",   label: "Hours" },
      { key: "company.gst",     label: "GSTIN" },
    ],
  },
  {
    title: "Footer",
    preview: "/",
    fields: [
      { key: "footer.about", label: "Footer About Text", multiline: true },
      { key: "footer.copy",  label: "Copyright Line" },
    ],
  },
];

export default function AdminPreviewEditor() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load all site content (server is source of truth) — fall back to defaults
  const { data: serverContent = {} } = useQuery<Record<string, string>>({
    queryKey: ["/api/site-content"],
    queryFn: () => api<Record<string, string>>("/api/site-content"),
  });

  const merged = useMemo<Record<string, string>>(
    () => ({ ...SITE_CONTENT_DEFAULTS, ...serverContent }),
    [serverContent]
  );

  // Draft state — local edits before save
  const [draft, setDraft] = useState<Record<string, string>>({});
  useEffect(() => { setDraft(merged); }, [merged]);

  const [activeGroup, setActiveGroup] = useState(0);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [search, setSearch] = useState("");
  const [previewKey, setPreviewKey] = useState(0); // bump to force iframe reload

  const dirty = useMemo(
    () => Object.keys(draft).some((k) => (draft[k] ?? "") !== (merged[k] ?? "")),
    [draft, merged]
  );

  const saveAll = useMutation({
    mutationFn: async () => {
      const changes = Object.entries(draft)
        .filter(([k, v]) => (v ?? "") !== (merged[k] ?? ""))
        .map(([key, value]) => ({ key, value: value ?? "" }));
      if (changes.length === 0) return null;
      return apiRequest("POST", "/api/admin/site-content", changes);
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Live website updated successfully." });
      qc.invalidateQueries({ queryKey: ["/api/site-content"] });
      setPreviewKey((k) => k + 1);
    },
    onError: (e: any) => toast({ title: "Save failed", description: e?.message || "Try again", variant: "destructive" }),
  });

  // Image upload handler
  const uploadImage = async (key: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: fd,
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}` },
    });
    if (!res.ok) throw new Error("Upload failed");
    const { url } = await res.json();
    setDraft((d) => ({ ...d, [key]: url }));
    toast({ title: "Image uploaded", description: file.name });
  };

  const previewUrl = useMemo(() => {
    const path = GROUPS[activeGroup]?.preview || "/";
    return `${path}${path.includes("?") ? "&" : "?"}_preview=${previewKey}`;
  }, [activeGroup, previewKey]);

  // Filter fields by search across all groups
  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return GROUPS;
    return GROUPS.map((g) => ({
      ...g,
      fields: g.fields.filter(
        (f) => f.label.toLowerCase().includes(q) || f.key.toLowerCase().includes(q) || (draft[f.key] || "").toLowerCase().includes(q)
      ),
    })).filter((g) => g.fields.length > 0);
  }, [search, draft]);

  return (
    <AdminLayout>
      <div className="-m-6 md:-m-10 h-[calc(100vh-0px)] flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white shadow-sm">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            <div>
              <div className="font-heading text-lg font-bold">Live Preview Editor</div>
              <div className="text-xs text-muted-foreground">Edit text & images on the left, see changes on the right.</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border bg-secondary/30 p-0.5">
              <button
                onClick={() => setDevice("desktop")}
                data-testid="button-device-desktop"
                className={`px-2.5 py-1.5 rounded ${device === "desktop" ? "bg-white shadow-sm" : "text-muted-foreground"}`}
                title="Desktop preview"
              ><Monitor className="w-4 h-4" /></button>
              <button
                onClick={() => setDevice("mobile")}
                data-testid="button-device-mobile"
                className={`px-2.5 py-1.5 rounded ${device === "mobile" ? "bg-white shadow-sm" : "text-muted-foreground"}`}
                title="Mobile preview"
              ><Smartphone className="w-4 h-4" /></button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setPreviewKey((k) => k + 1)} data-testid="button-refresh-preview">
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
            <a href={GROUPS[activeGroup]?.preview || "/"} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" data-testid="button-open-newtab">
                <ExternalLink className="w-4 h-4 mr-1" /> Open
              </Button>
            </a>
            <Button
              size="sm"
              onClick={() => saveAll.mutate()}
              disabled={!dirty || saveAll.isPending}
              data-testid="button-save-all"
              className={dirty ? "bg-primary text-white" : ""}
            >
              {saveAll.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              {saveAll.isPending ? "Saving…" : dirty ? "Save Changes" : "All Saved"}
            </Button>
          </div>
        </div>

        {/* Body: editor sidebar (left) + iframe preview (right) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[380px_1fr] overflow-hidden">
          {/* LEFT: editable fields */}
          <aside className="border-r bg-white flex flex-col overflow-hidden">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Search any field…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9"
                  data-testid="input-search-fields"
                />
              </div>
            </div>

            {/* Group tabs (only when not searching) */}
            {!search && (
              <div className="flex flex-wrap gap-1 p-2 border-b bg-secondary/20">
                {GROUPS.map((g, i) => (
                  <button
                    key={g.title}
                    onClick={() => setActiveGroup(i)}
                    data-testid={`tab-group-${i}`}
                    className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition ${
                      activeGroup === i ? "bg-primary text-white" : "bg-white border hover:bg-secondary/40"
                    }`}
                  >{g.title}</button>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {(search ? filteredGroups : [GROUPS[activeGroup]]).map((group) => (
                <section key={group.title}>
                  {search && <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group.title}</div>}
                  <div className="space-y-3">
                    {group.fields.map((f) => (
                      <FieldEditor
                        key={f.key}
                        field={f}
                        value={draft[f.key] ?? ""}
                        onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))}
                        onUpload={(file) => uploadImage(f.key, file)}
                      />
                    ))}
                  </div>
                </section>
              ))}
              {search && filteredGroups.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-8">No fields match "{search}"</div>
              )}
            </div>
          </aside>

          {/* RIGHT: live preview iframe */}
          <div className="bg-secondary/20 overflow-auto flex items-start justify-center p-4">
            <div
              className={`bg-white shadow-xl border rounded-md overflow-hidden transition-all ${
                device === "mobile" ? "w-[390px] h-[800px]" : "w-full h-[calc(100vh-120px)]"
              }`}
            >
              <iframe
                ref={iframeRef}
                key={previewKey}
                src={previewUrl}
                title="Live preview"
                className="w-full h-full border-0"
                data-testid="iframe-preview"
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// ── Single field editor (text / textarea / image) ────────────────────────────
function FieldEditor({
  field, value, onChange, onUpload,
}: {
  field: FieldDef;
  value: string;
  onChange: (v: string) => void;
  onUpload: (f: File) => Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  if (field.image) {
    return (
      <div>
        <Label className="text-xs flex items-center gap-1 mb-1">
          <ImageIcon className="w-3 h-3" /> {field.label}
        </Label>
        <div className="flex gap-2 items-start">
          <div className="w-16 h-16 rounded border bg-secondary/30 overflow-hidden flex items-center justify-center shrink-0">
            {value ? (
              <img src={value} alt="" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="/uploads/... or full URL"
              className="h-8 text-xs"
              data-testid={`input-${field.key}`}
            />
            <input
              type="file"
              ref={fileRef}
              accept="image/*"
              hidden
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setUploading(true);
                try { await onUpload(f); } finally { setUploading(false); e.target.value = ""; }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs w-full"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              data-testid={`button-upload-${field.key}`}
            >
              {uploading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <ImageIcon className="w-3 h-3 mr-1" />}
              {uploading ? "Uploading…" : "Upload Image"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Label className="text-xs flex items-center gap-1 mb-1">
        <Type className="w-3 h-3" /> {field.label}
      </Label>
      {field.multiline ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="text-sm resize-none"
          data-testid={`textarea-${field.key}`}
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 text-sm"
          data-testid={`input-${field.key}`}
        />
      )}
    </div>
  );
}
