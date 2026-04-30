import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, LogIn, Mail, Lock, AlertCircle, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { isAdminEmail } from "@/lib/firebase";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isAdmin, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Already an admin? skip login
  useEffect(() => {
    if (!loading && isAdmin) navigate("/admin", { replace: true });
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal">
        <div className="flex flex-col items-center gap-3 text-amber-300">
          <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Checking session…</span>
        </div>
      </div>
    );
  }

  if (isAdmin) return <Navigate to="/admin" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (!isAdminEmail(email)) {
        throw new Error("This email is not authorised as an admin.");
      }
      const profile = await login(email, password);
      toast({ title: "Welcome", description: profile.role === "admin" ? "Admin access granted." : "Signed in." });
      navigate(profile.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Sign-in failed. Check email and password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-charcoal">
      <Helmet>
        <title>Admin Sign In — M.I. Engineering Works</title>
      </Helmet>
      <Header />
      <main className="flex-1 relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal" />
        <div className="container max-w-md py-16 md:py-24">
          <div className="rounded-2xl border border-amber-400/40 bg-white text-slate-900 shadow-2xl p-6 md:p-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <ShieldCheck className="w-6 h-6 text-amber-600" />
              <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900">Admin Sign In</h1>
            </div>
            <p className="text-center text-sm text-slate-600 mb-5">
              Authorised personnel only. Please enter your admin credentials.
            </p>

            {err && (
              <div className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-700 text-sm px-3 py-2 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span data-testid="text-admin-login-error">{err}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-3">
              <label className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-slate-50 border border-slate-300 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-300 transition">
                <Mail className="w-4 h-4 text-slate-500" />
                <input
                  data-testid="input-admin-email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
                />
              </label>
              <label className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-slate-50 border border-slate-300 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-300 transition">
                <Lock className="w-4 h-4 text-slate-500" />
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
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold shadow-lg hover:from-amber-600 hover:to-yellow-700 transition disabled:opacity-60"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                Sign In
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 mt-6">
              Not an admin?{" "}
              <Link to="/auth" className="text-amber-600 font-semibold hover:underline">
                Customer sign-in
              </Link>{" "}
              ·{" "}
              <Link to="/" className="hover:text-amber-600">← Home</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminLogin;
