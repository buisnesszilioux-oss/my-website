import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, LogIn, Mail, Lock, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) navigate("/admin", { replace: true });
  }, [isAdmin, navigate]);

  if (isAdmin) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login(email, password);
      toast({ title: "Welcome", description: "Admin access granted." });
      navigate("/admin", { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Sign-in failed. Check email and password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal">
      <Helmet>
        <title>Admin Sign In — M.I. Engineering Works</title>
      </Helmet>

      <div className="w-full max-w-sm mx-4">
        <div className="rounded-2xl border border-amber-400/40 bg-white text-slate-900 shadow-2xl p-8">
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-amber-600" />
            </div>
            <h1 className="font-heading text-2xl font-extrabold text-slate-900">Admin Sign In</h1>
            <p className="text-center text-sm text-slate-500">
              M.I. Engineering Works — Admin Panel
            </p>
          </div>

          {err && (
            <div className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-700 text-sm px-3 py-2 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span data-testid="text-admin-login-error">{err}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-3">
            <label className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-slate-50 border border-slate-300 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-200 transition">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                data-testid="input-admin-email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
              />
            </label>
            <label className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-slate-50 border border-slate-300 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-200 transition">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                data-testid="input-admin-password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              data-testid="button-admin-login"
              className="w-full mt-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold shadow-md hover:from-amber-600 hover:to-yellow-700 transition disabled:opacity-60"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
