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
  const { login, loginWithGoogle, isAdmin, loading } = useAuth();
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

  const handleGoogle = async () => {
    setErr(null);
    setBusy(true);
    try {
      const profile = await loginWithGoogle();
      if (profile.role !== "admin") {
        throw new Error("This Google account is not authorised as an admin.");
      }
      toast({ title: "Welcome", description: "Admin access granted." });
      navigate("/admin", { replace: true });
    } catch (e: any) {
      const msg =
        e?.code === "auth/popup-closed-by-user"
          ? "Sign-in cancelled."
          : e?.code === "auth/popup-blocked"
          ? "Pop-up blocked by the browser. Please allow pop-ups and retry."
          : e?.message || "Google sign-in failed.";
      setErr(msg);
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

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  or
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={busy}
              data-testid="button-admin-google"
              className="w-full inline-flex items-center justify-center gap-3 px-4 py-3 rounded-md bg-white border border-slate-300 text-slate-700 font-semibold shadow-sm hover:bg-slate-50 hover:border-slate-400 transition disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Sign in with Google
            </button>
            <p className="text-center text-[11px] text-slate-500 mt-2">
              Use your authorised admin Google account.
            </p>

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
