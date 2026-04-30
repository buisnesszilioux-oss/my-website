import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, LogIn, UserPlus, Mail, Lock, User as UserIcon, Phone, Building2, AlertCircle, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const UserAuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, loginWithGoogle, register, user } = useAuth();
  const initialMode = location.pathname === "/register" ? "register" : "login";
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({ name: "", email: "", phone: "", company: "", password: "" });

  useEffect(() => {
    setMode(location.pathname === "/register" ? "register" : "login");
  }, [location.pathname]);

  // Redirect already-signed-in users
  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const profile =
        mode === "login"
          ? await login(loginForm.email, loginForm.password)
          : await register(regForm);
      toast({
        title: mode === "login" ? "Welcome back!" : "Account ready",
        description: profile.role === "admin" ? "Admin access granted." : "You are now signed in.",
      });
      navigate(profile.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setErr(null);
    setBusy(true);
    try {
      const profile = await loginWithGoogle();
      toast({
        title: "Welcome",
        description: profile.role === "admin" ? "Admin access granted." : "You are now signed in.",
      });
      navigate(profile.role === "admin" ? "/admin" : "/dashboard", { replace: true });
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
        <title>{mode === "register" ? "Create Account" : "Sign In"} — M.I. Engineering Works</title>
        <meta name="description" content="Customer login & registration for M.I. Engineering Works." />
      </Helmet>
      <Header />
      <main className="flex-1 relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal" />
        <div className="absolute inset-0 -z-10 opacity-[0.07] bg-[radial-gradient(circle_at_30%_20%,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent" />

        <div className="container max-w-md py-16 md:py-24">
          {/* Light card with dark text → high contrast in every mode */}
          <div className="rounded-2xl border border-primary/30 bg-white text-slate-900 shadow-2xl p-6 md:p-8">
            <div className="grid grid-cols-2 mb-6 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                data-testid="tab-login"
                onClick={() => { setErr(null); setMode("login"); }}
                className={`py-2 rounded-md text-sm font-semibold transition-all ${
                  mode === "login"
                    ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 shadow"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="inline-flex items-center gap-2"><LogIn className="w-4 h-4" /> Sign In</span>
              </button>
              <button
                type="button"
                data-testid="tab-register"
                onClick={() => { setErr(null); setMode("register"); }}
                className={`py-2 rounded-md text-sm font-semibold transition-all ${
                  mode === "register"
                    ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 shadow"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="inline-flex items-center gap-2"><UserPlus className="w-4 h-4" /> Create Account</span>
              </button>
            </div>

            <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 text-center mb-1">
              {mode === "login" ? "Welcome Back" : "Create Your Account"}
            </h1>
            <p className="text-center text-sm text-slate-600 mb-5">
              {mode === "login"
                ? "Sign in to track quotes and orders."
                : "Join to request quotes faster and save your details."}
            </p>

            {err && (
              <div className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-700 text-sm px-3 py-2 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span data-testid="text-auth-error">{err}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-3">
              {mode === "register" && (
                <>
                  <Field icon={<UserIcon className="w-4 h-4" />} placeholder="Full name" value={regForm.name}
                    onChange={(v) => setRegForm({ ...regForm, name: v })} testId="input-register-name" required />
                  <Field icon={<Building2 className="w-4 h-4" />} placeholder="Company (optional)" value={regForm.company}
                    onChange={(v) => setRegForm({ ...regForm, company: v })} testId="input-register-company" />
                  <Field icon={<Phone className="w-4 h-4" />} placeholder="Phone (optional)" value={regForm.phone}
                    onChange={(v) => setRegForm({ ...regForm, phone: v })} testId="input-register-phone" />
                </>
              )}
              <Field icon={<Mail className="w-4 h-4" />} placeholder="Email address" type="email"
                value={mode === "login" ? loginForm.email : regForm.email}
                onChange={(v) => mode === "login"
                  ? setLoginForm({ ...loginForm, email: v })
                  : setRegForm({ ...regForm, email: v })}
                testId={mode === "login" ? "input-login-email" : "input-register-email"} required />
              <Field icon={<Lock className="w-4 h-4" />} placeholder="Password (min 6 characters)" type="password"
                value={mode === "login" ? loginForm.password : regForm.password}
                onChange={(v) => mode === "login"
                  ? setLoginForm({ ...loginForm, password: v })
                  : setRegForm({ ...regForm, password: v })}
                testId={mode === "login" ? "input-login-password" : "input-register-password"} required />

              <button
                type="submit"
                disabled={busy}
                data-testid="button-submit-auth"
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold shadow-lg hover:from-amber-600 hover:to-yellow-700 transition disabled:opacity-60"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {mode === "login" ? "Sign In" : "Create Account"}
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
              data-testid="button-google-auth"
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
              Continue with Google
            </button>

            <p className="text-center text-xs text-slate-600 mt-6">
              {mode === "login" ? (
                <>New here? <button type="button" onClick={() => { setErr(null); setMode("register"); }} className="text-amber-600 font-semibold hover:underline" data-testid="link-switch-register">Create an account</button></>
              ) : (
                <>Already have an account? <button type="button" onClick={() => { setErr(null); setMode("login"); }} className="text-amber-600 font-semibold hover:underline" data-testid="link-switch-login">Sign in</button></>
              )}
            </p>
            <p className="text-center text-[11px] text-slate-500 mt-2">
              <Link to="/" className="hover:text-amber-600">← Back to home</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Field = ({
  icon, placeholder, type = "text", value, onChange, testId, required,
}: {
  icon: React.ReactNode;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  testId: string;
  required?: boolean;
}) => (
  <label className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-slate-50 border border-slate-300 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-300 transition">
    <span className="text-slate-500">{icon}</span>
    <input
      data-testid={testId}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      autoComplete={type === "password" ? "current-password" : "on"}
      className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
    />
  </label>
);

export default UserAuthPage;
