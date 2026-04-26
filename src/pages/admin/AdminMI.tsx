import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Bot, Send, User2, Loader2, Sparkles, RotateCcw, Database, HeartPulse, Save, Download, AlertTriangle, CheckCircle2 } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { api, getToken } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type BackupItem = {
  file: string;
  size: number;
  modified: string;
  createdAt?: string;
  totalRows: number;
  counts: Record<string, number>;
};

type ChatResp = {
  reply: string;
  kind?: "text" | "health" | "backups" | "stats" | "ok" | "error" | "help";
  data?: any;
  actions?: { label: string; command: string }[];
};

type Msg =
  | { role: "user"; text: string }
  | { role: "bot"; resp: ChatResp };

const QUICK = [
  { label: "🩺 Health Check", cmd: "health" },
  { label: "💾 Backup Now", cmd: "backup" },
  { label: "♻️ Restore Data", cmd: "restore" },
  { label: "📊 Stats", cmd: "stats" },
  { label: "❓ Help", cmd: "help" },
];

const fmtBytes = (n: number) => n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(2)} MB`;
const fmtDate = (s?: string) => s ? new Date(s).toLocaleString() : "—";

export default function AdminMI() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Msg[]>(() => [{
    role: "bot",
    resp: {
      kind: "help",
      reply: "Namaste! 👋 Main MI Chat hoon — aapka admin assistant.\n\nMain teen kaam kar sakta hoon:\n\n💾 **Backup** — abhi ke saare data ka safe copy banao\n♻️ **Restore** — purane backup se data wapas le aao (jab GitHub se Replit me data gayab ho jaye)\n🩺 **Health Check** — site me kya broken hai dikhau\n\nNeeche koi quick button dabao, ya seedha message likho.",
    },
  }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || busy) return;
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setInput("");
    setBusy(true);
    try {
      const resp = await api<ChatResp>("/api/admin/mi/chat", {
        method: "POST",
        body: JSON.stringify({ message: msg }),
      });
      setMessages((m) => [...m, { role: "bot", resp }]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: "bot", resp: { kind: "error", reply: `❌ ${e.message}` } }]);
    } finally {
      setBusy(false);
    }
  };

  const restore = async (file: string) => {
    if (!confirm(`"${file}" se restore karna hai?\n\n⚠️ Abhi ka data REPLACE ho jayega backup wale data se. Pehle ek fresh backup le lo agar zaroori ho.`)) return;
    setBusy(true);
    setMessages((m) => [...m, { role: "user", text: `Restore from ${file}` }]);
    try {
      const resp = await api<ChatResp>("/api/admin/mi/chat", {
        method: "POST",
        body: JSON.stringify({ message: "restore", restoreFile: file, restoreMode: "replace" }),
      });
      setMessages((m) => [...m, { role: "bot", resp }]);
      toast({ title: "Restore complete", description: file });
    } catch (e: any) {
      setMessages((m) => [...m, { role: "bot", resp: { kind: "error", reply: `❌ ${e.message}` } }]);
    } finally { setBusy(false); }
  };

  const download = (file: string) => {
    // include token in query for auth-bearing download
    const token = getToken();
    const url = `/api/admin/mi/backups/${encodeURIComponent(file)}/download`;
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(async (r) => {
        if (!r.ok) throw new Error("download failed");
        const blob = await r.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = file;
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch((e) => toast({ title: "Download failed", description: e.message, variant: "destructive" }));
  };

  return (
    <AdminLayout>
      <Helmet><title>MI Chat · Admin</title></Helmet>

      <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-amber-700 flex items-center justify-center text-white shadow-gold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-bold flex items-center gap-2">MI Chat</h1>
            <p className="text-xs text-muted-foreground">
              Aapka self-service backup, restore aur health-check assistant.
              Ye <strong>locally chalta hai</strong> — koi external AI nahi, koi paid API nahi. Deploy ke baad bhi exact same chalega.
            </p>
          </div>
        </div>

        {/* Quick action chips */}
        <div className="mb-3 flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <button
              key={q.cmd}
              onClick={() => send(q.cmd)}
              disabled={busy}
              data-testid={`button-quick-${q.cmd}`}
              className="px-3 py-1.5 text-xs font-semibold rounded-full border border-border hover:border-primary hover:bg-primary/5 disabled:opacity-50"
            >
              {q.label}
            </button>
          ))}
          <button
            onClick={() => setMessages(messages.slice(0, 1))}
            className="ml-auto px-3 py-1.5 text-xs font-semibold rounded-full border border-border hover:bg-secondary inline-flex items-center gap-1"
            data-testid="button-clear-chat"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-card border border-border rounded-xl p-4 space-y-3" data-testid="chat-window">
          {messages.map((m, i) => (
            <Bubble key={i} m={m} onAction={send} onRestore={restore} onDownload={download} />
          ))}
          {busy && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground pl-10">
              <Loader2 className="w-4 h-4 animate-spin" /> Soch raha hoon…
            </div>
          )}
        </div>

        {/* Input */}
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => { e.preventDefault(); send(input); }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Likho: "backup", "restore", "health", "stats", ya "help"'
            className="flex-1 bg-background border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-primary"
            data-testid="input-chat-message"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            data-testid="button-send-message"
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold px-5 rounded-md hover:opacity-90 disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> Send
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}

function Bubble({
  m, onAction, onRestore, onDownload,
}: {
  m: Msg;
  onAction: (cmd: string) => void;
  onRestore: (file: string) => void;
  onDownload: (file: string) => void;
}) {
  if (m.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] inline-flex items-start gap-2 bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm">
          <span className="whitespace-pre-wrap">{m.text}</span>
          <User2 className="w-4 h-4 mt-0.5 opacity-70 flex-shrink-0" />
        </div>
      </div>
    );
  }
  const r = m.resp;
  return (
    <div className="flex gap-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-amber-700 flex items-center justify-center text-white flex-shrink-0">
        <Bot className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0 bg-secondary/50 border border-border rounded-2xl rounded-tl-sm px-4 py-3 text-sm">
        <div className="whitespace-pre-wrap" data-testid="bot-reply">{r.reply}</div>

        {/* Health card */}
        {r.kind === "health" && r.data && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <Stat icon={<Database className="w-3.5 h-3.5" />} label="DB rows" value={r.data.totalRows} />
            <Stat icon={<HeartPulse className="w-3.5 h-3.5" />} label="Files on disk" value={r.data.uploadedFilesOnDisk} />
            {r.data.missingFilesCount > 0 && (
              <div className="col-span-2 mt-1 p-2 rounded bg-destructive/10 border border-destructive/30 text-destructive flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">{r.data.missingFilesCount} image file(s) missing</div>
                  <ul className="mt-1 space-y-0.5 max-h-24 overflow-y-auto">
                    {r.data.missingFiles.map((f: any, i: number) => (
                      <li key={i} className="font-mono text-[10px] opacity-80">{f.table} #{f.row} → {f.url}</li>
                    ))}
                  </ul>
                  <p className="mt-1 text-[11px]">Type <code className="bg-card px-1 rounded">restore</code> to recover them from a backup that includes the files.</p>
                </div>
              </div>
            )}
            {r.data.issues?.length === 0 && (
              <div className="col-span-2 p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Sab kuch theek hai!
              </div>
            )}
          </div>
        )}

        {/* Stats grid */}
        {r.kind === "stats" && r.data && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {Object.entries(r.data as Record<string, number>).map(([k, v]) => (
              <div key={k} className="bg-card border border-border rounded p-2">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
                <div className="font-bold text-base text-foreground">{v}</div>
              </div>
            ))}
          </div>
        )}

        {/* Backups list */}
        {r.kind === "backups" && Array.isArray(r.data) && (
          <div className="mt-3 space-y-2">
            {(r.data as BackupItem[]).map((b) => (
              <div key={b.file} className="bg-card border border-border rounded-lg p-3 text-xs" data-testid={`backup-${b.file}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[11px] font-semibold truncate text-foreground">{b.file}</div>
                    <div className="text-muted-foreground mt-0.5">
                      {b.totalRows} rows · {fmtBytes(b.size)} · {fmtDate(b.createdAt || b.modified)}
                    </div>
                    {b.counts && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {Object.entries(b.counts).filter(([_, v]) => v > 0).map(([k, v]) => (
                          <span key={k} className="px-1.5 py-0.5 rounded bg-secondary text-[10px]">{k}:{v}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => onRestore(b.file)}
                      data-testid={`button-restore-${b.file}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary text-primary-foreground rounded text-[11px] font-semibold hover:opacity-90"
                    >
                      <Save className="w-3 h-3" /> Restore
                    </button>
                    <button
                      onClick={() => onDownload(b.file)}
                      data-testid={`button-download-${b.file}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 border border-border rounded text-[11px] font-semibold hover:bg-secondary"
                    >
                      <Download className="w-3 h-3" /> Save
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action chips */}
        {r.actions && r.actions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {r.actions.map((a, i) => (
              <button
                key={i}
                onClick={() => onAction(a.command)}
                data-testid={`button-action-${i}`}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) {
  return (
    <div className="bg-card border border-border rounded p-2 flex items-center gap-2">
      <div className="text-primary">{icon}</div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-bold text-sm text-foreground">{value}</div>
      </div>
    </div>
  );
}
