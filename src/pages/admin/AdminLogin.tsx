import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adminLogin, isAdminLoggedIn } from "@/lib/adminAuth";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAdminLoggedIn()) nav("/admin", { replace: true });
  }, [nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await adminLogin(email, password);
      toast({ title: "Welcome back" });
      nav("/admin", { replace: true });
    } catch (err: any) {
      setErr(err?.message || "Sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark p-6">
      <form onSubmit={submit} className="bg-card rounded-2xl shadow-elegant p-8 w-full max-w-md border border-border" autoComplete="off">
        <div className="text-center mb-7">
          <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center mx-auto mb-4 shadow-gold">
            <ShieldCheck className="w-7 h-7 text-charcoal" />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Admin Sign In</h1>
          <p className="text-sm text-muted-foreground mt-1.5">M.I. Engineering Works · Content Panel</p>
        </div>

        {err && (
          <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 text-red-300 text-sm px-3 py-2 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span data-testid="text-admin-login-error">{err}</span>
          </div>
        )}

        <label className="block mb-4">
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">Admin Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="off"
            data-testid="input-username"
            placeholder="Enter admin email"
            className="mt-2 w-full bg-background border border-border rounded-lg px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
          />
        </label>

        <label className="block mb-5">
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            data-testid="input-password"
            placeholder="Enter your password"
            className="mt-2 w-full bg-background border border-border rounded-lg px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
          />
        </label>

        <button
          type="submit"
          disabled={busy || !email || !password}
          data-testid="button-login"
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-gold text-charcoal font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 shadow-gold"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {busy ? "Signing in…" : "Sign In"}
        </button>

        <p className="text-[11px] text-muted-foreground/70 mt-5 text-center leading-relaxed">
          Restricted access. For authorised administrators only.
        </p>
      </form>
    </div>
  );
};

export default AdminLogin;
