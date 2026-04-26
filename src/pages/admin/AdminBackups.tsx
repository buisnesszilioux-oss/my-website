import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import {
  HardDriveDownload, Loader2, Save, Trash2, Upload, Download, Calendar,
  Database, Image as ImageIcon, Clock, RotateCcw, AlertCircle, CheckCircle2, RefreshCw, FileJson,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import { api, getToken } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type BackupItem = {
  file: string;
  size: number;
  modified: string;
  createdAt?: string;
  kind: "db" | "full";
  totalRows: number;
  counts: Record<string, number>;
  fileCount: number;
};

const fmtBytes = (n: number) =>
  n < 1024 ? `${n} B` :
  n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` :
  `${(n / 1024 / 1024).toFixed(2)} MB`;

const fmtDateTime = (s?: string) =>
  s ? new Date(s).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

export default function AdminBackups() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: backups = [], isLoading, refetch } = useQuery<BackupItem[]>({
    queryKey: ["/api/admin/mi/backups"],
    queryFn: () => api("/api/admin/mi/backups"),
  });

  const fullBackup = useMutation({
    mutationFn: () => api("/api/admin/mi/backup/full", { method: "POST", body: JSON.stringify({ label: "manual" }) }),
    onSuccess: (r: any) => {
      toast({ title: "Full backup created", description: `${r.totalRows} rows + ${r.fileCount} files saved.` });
      qc.invalidateQueries({ queryKey: ["/api/admin/mi/backups"] });
    },
    onError: (e: any) => toast({ title: "Backup failed", description: e.message, variant: "destructive" }),
  });

  const dbBackup = useMutation({
    mutationFn: () => api("/api/admin/mi/backup", { method: "POST", body: JSON.stringify({ label: "manual" }) }),
    onSuccess: (r: any) => {
      toast({ title: "DB backup created", description: `${r.totalRows} rows saved.` });
      qc.invalidateQueries({ queryKey: ["/api/admin/mi/backups"] });
    },
    onError: (e: any) => toast({ title: "Backup failed", description: e.message, variant: "destructive" }),
  });

  const restore = useMutation({
    mutationFn: (file: string) => api("/api/admin/mi/restore", { method: "POST", body: JSON.stringify({ file, mode: "replace" }) }),
    onSuccess: (r: any) => {
      const total = Object.values(r.restored as Record<string, number>).reduce((a, b) => a + b, 0);
      toast({ title: "Restore complete", description: `${total} rows wapas aaye${r.filesRestored ? ` + ${r.filesRestored} photos restored` : ""}.` });
      qc.invalidateQueries();
    },
    onError: (e: any) => toast({ title: "Restore failed", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (file: string) => api(`/api/admin/mi/backups/${encodeURIComponent(file)}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Backup deleted" });
      qc.invalidateQueries({ queryKey: ["/api/admin/mi/backups"] });
    },
    onError: (e: any) => toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
  });

  const onUploadClick = () => fileRef.current?.click();

  const onFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    e.target.value = "";
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/admin/mi/backups/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken() || ""}` },
        body: fd,
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Upload failed");
      toast({ title: "Backup uploaded", description: `${j.file} (${j.totalRows} rows, ${j.fileCount} files)` });
      qc.invalidateQueries({ queryKey: ["/api/admin/mi/backups"] });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const download = async (file: string) => {
    try {
      const res = await fetch(`/api/admin/mi/backups/${encodeURIComponent(file)}/download`, {
        headers: { Authorization: `Bearer ${getToken() || ""}` },
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = file; document.body.appendChild(a); a.click();
      a.remove(); URL.revokeObjectURL(url);
    } catch (e: any) {
      toast({ title: "Download failed", description: e.message, variant: "destructive" });
    }
  };

  const onRestoreClick = (b: BackupItem) => {
    const ok = confirm(
      `"${b.file}" se restore karna hai?\n\n` +
      `⚠️ Yeh abhi ka data REPLACE kar dega (${b.totalRows} rows${b.fileCount ? ` + ${b.fileCount} photos` : ""}).\n\n` +
      `Continue?`
    );
    if (ok) restore.mutate(b.file);
  };

  const onDeleteClick = (b: BackupItem) => {
    if (confirm(`Backup "${b.file}" delete karna hai?\n\nYeh action undo nahi ho sakta.`)) remove.mutate(b.file);
  };

  // Stats
  const total = backups.length;
  const fullCount = backups.filter((b) => b.kind === "full").length;
  const totalSize = backups.reduce((a, b) => a + b.size, 0);
  const lastAuto = backups.find((b) => /-auto-(daily|first-run)/.test(b.file));

  return (
    <AdminLayout>
      <Helmet><title>Backups · Admin</title></Helmet>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <HardDriveDownload className="w-6 h-6 text-primary" /> Backups
          </h1>
          <p className="text-sm text-muted-foreground">Full website backups (database + photos). Auto-runs daily. Download / Upload / Restore / Delete.</p>
        </div>
        <button
          onClick={() => refetch()}
          data-testid="button-refresh-backups"
          className="inline-flex items-center gap-2 border border-border px-3 py-2 rounded-md text-sm font-semibold hover:bg-secondary"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Total Backups" value={String(total)} icon={Database} tone="blue" testid="stat-total-backups" />
        <Stat label="Full Backups" value={String(fullCount)} icon={ImageIcon} tone="amber" testid="stat-full-backups" />
        <Stat label="Storage Used" value={fmtBytes(totalSize)} icon={HardDriveDownload} tone="green" testid="stat-storage" />
        <Stat label="Last Auto Backup" value={lastAuto ? fmtDateTime(lastAuto.createdAt || lastAuto.modified) : "Never"} icon={Clock} tone={lastAuto ? "green" : "red"} testid="stat-last-auto" />
      </div>

      {/* Action panel */}
      <div className="bg-card border-2 border-primary/20 rounded-xl p-5 mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => fullBackup.mutate()}
            disabled={fullBackup.isPending}
            data-testid="button-create-full-backup"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-3 rounded-md hover:opacity-90 disabled:opacity-60"
          >
            {fullBackup.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Create FULL Backup Now
          </button>
          <button
            onClick={() => dbBackup.mutate()}
            disabled={dbBackup.isPending}
            data-testid="button-create-db-backup"
            className="inline-flex items-center gap-2 border-2 border-border font-semibold px-5 py-3 rounded-md hover:bg-secondary disabled:opacity-60"
          >
            {dbBackup.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            Quick DB Backup
          </button>
          <button
            onClick={onUploadClick}
            disabled={uploading}
            data-testid="button-upload-backup"
            className="inline-flex items-center gap-2 border-2 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-semibold px-5 py-3 rounded-md hover:bg-emerald-500/10 disabled:opacity-60"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload Backup (.json)
          </button>
          <input ref={fileRef} type="file" accept=".json,application/json" onChange={onFileChosen} className="hidden" data-testid="input-upload-backup" />
        </div>
        <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>Auto-backup har 24 ghante me ek baar chalta hai. Last 7 daily backups rakhe jaate hain, baki apne aap delete ho jaate hain.</span>
        </div>
      </div>

      {/* Backups list */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b bg-secondary/40">
          <div className="font-semibold text-sm flex items-center gap-2">
            <FileJson className="w-4 h-4" /> Backup History — {total} {total === 1 ? "file" : "files"}
          </div>
        </div>
        {isLoading && (
          <div className="p-10 text-center text-muted-foreground">Loading…</div>
        )}
        {!isLoading && backups.length === 0 && (
          <div className="p-10 text-center text-muted-foreground">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
            No backups yet. Click <strong>Create FULL Backup Now</strong> above.
          </div>
        )}
        {!isLoading && backups.length > 0 && (
          <ul className="divide-y divide-border">
            {backups.map((b) => {
              const isAuto = /-auto-/.test(b.file);
              return (
                <li key={b.file} data-testid={`row-backup-${b.file}`} className="px-4 py-4 hover:bg-secondary/30 transition">
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-12 lg:col-span-5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${b.kind === "full" ? "bg-amber-500/20 text-amber-700 dark:text-amber-300" : "bg-sky-500/20 text-sky-700 dark:text-sky-300"}`}>
                          {b.kind === "full" ? "FULL" : "DB"}
                        </span>
                        {isAuto && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">AUTO</span>}
                        <span className="font-mono text-xs text-foreground truncate">{b.file}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDateTime(b.createdAt || b.modified)}</span>
                        <span>•</span>
                        <span>{fmtBytes(b.size)}</span>
                      </div>
                    </div>
                    <div className="col-span-6 lg:col-span-3 text-sm">
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Contents</div>
                      <div className="font-semibold">
                        {b.totalRows} rows
                        {b.fileCount > 0 && <span className="text-muted-foreground"> + {b.fileCount} files</span>}
                      </div>
                    </div>
                    <div className="col-span-6 lg:col-span-4 flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onRestoreClick(b)}
                        disabled={restore.isPending}
                        data-testid={`button-restore-${b.file}`}
                        title="Restore this backup"
                        className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Restore
                      </button>
                      <button
                        onClick={() => download(b.file)}
                        data-testid={`button-download-${b.file}`}
                        title="Download backup file"
                        className="inline-flex items-center gap-1.5 border border-border text-xs font-semibold px-3 py-2 rounded-md hover:bg-secondary"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                      <button
                        onClick={() => onDeleteClick(b)}
                        disabled={remove.isPending}
                        data-testid={`button-delete-${b.file}`}
                        title="Delete backup"
                        className="inline-flex items-center gap-1.5 border border-red-500/40 text-red-700 dark:text-red-400 text-xs font-semibold px-3 py-2 rounded-md hover:bg-red-500/10 disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AdminLayout>
  );
}

const Stat = ({
  label, value, icon: Icon, tone, testid,
}: {
  label: string; value: string; icon: any; tone: "amber" | "green" | "red" | "blue"; testid: string;
}) => {
  const palette =
    tone === "green" ? "border-emerald-500/30 text-emerald-700 dark:text-emerald-400" :
    tone === "red" ? "border-red-500/30 text-red-700 dark:text-red-400" :
    tone === "blue" ? "border-sky-500/30 text-sky-700 dark:text-sky-400" :
    "border-amber-500/30 text-amber-700 dark:text-amber-400";
  return (
    <div className={`bg-card border-2 rounded-xl p-4 ${palette}`}>
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">{label}</div>
          <div className="font-heading text-base md:text-lg font-bold mt-1 truncate" data-testid={testid}>{value}</div>
        </div>
        <Icon className="w-6 h-6 opacity-70 shrink-0 ml-2" />
      </div>
    </div>
  );
};
