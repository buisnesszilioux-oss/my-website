import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { api, getToken } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { SiteContentMap } from "@/hooks/useSiteContent";
import { Upload, Trash2, Download, FileText, ExternalLink } from "lucide-react";

export default function AdminCatalog() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const { data } = useQuery<SiteContentMap>({
    queryKey: ["/api/site-content"],
    queryFn: () => api("/api/site-content"),
  });
  const customUrl = (data?.["catalog.pdfUrl"] || "").trim();
  const hasCustom = !!customUrl;

  const upload = async (f: File) => {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const headers: Record<string, string> = {};
      const t = getToken();
      if (t) headers["Authorization"] = `Bearer ${t}`;
      const res = await fetch("/api/admin/catalog-pdf", { method: "POST", body: fd, headers });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Upload failed");
      }
      qc.invalidateQueries({ queryKey: ["/api/site-content"] });
      toast({ title: "Catalog uploaded" });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeMut = useMutation({
    mutationFn: () => api("/api/admin/catalog-pdf", { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/site-content"] });
      toast({ title: "Custom catalog removed", description: "The site will fall back to the auto-generated PDF." });
    },
    onError: (e: any) => toast({ title: "Failed to remove", description: e.message, variant: "destructive" }),
  });

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold">PDF Catalog</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload your own PDF catalog or let the site auto-generate one. Visitors download it from the
          "Download Catalog" buttons across the site.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-elegant max-w-3xl">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-heading text-lg font-semibold">
              {hasCustom ? "Custom catalog uploaded" : "No custom catalog uploaded"}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {hasCustom
                ? "Visitors will download your uploaded PDF when they click any Download Catalog button."
                : "Visitors will download an automatically generated branded PDF based on your site content."}
            </p>
            {hasCustom && (
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <a href={customUrl} target="_blank" rel="noopener noreferrer"
                  data-testid="link-current-pdf"
                  className="inline-flex items-center gap-1.5 text-primary hover:underline">
                  <ExternalLink className="w-3.5 h-3.5" /> Open current PDF
                </a>
                <a href="/api/catalog.pdf" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                  <Download className="w-3.5 h-3.5" /> Test public download
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            data-testid="input-pdf-file"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
            }}
          />
          <button
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            data-testid="button-upload-pdf"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition"
          >
            <Upload className="w-4 h-4" />
            {busy ? "Uploading…" : hasCustom ? "Replace PDF" : "Upload PDF"}
          </button>
          {hasCustom && (
            <button
              disabled={removeMut.isPending}
              onClick={() => {
                if (confirm("Remove the custom catalog? Visitors will get the auto-generated PDF instead.")) removeMut.mutate();
              }}
              data-testid="button-remove-pdf"
              className="inline-flex items-center gap-2 border border-destructive/40 text-destructive px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-destructive/10 disabled:opacity-50 transition"
            >
              <Trash2 className="w-4 h-4" />
              {removeMut.isPending ? "Removing…" : "Remove Custom PDF"}
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-4">PDF only · max 25 MB</p>
      </div>
    </AdminLayout>
  );
}
