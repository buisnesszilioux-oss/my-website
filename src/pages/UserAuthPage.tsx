import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, LogIn, UserPlus, Mail, Lock, User as UserIcon, Phone, Building2, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const UserAuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, register, user } = useAuth();
  const initialMode = location.pathname === "/register" ? "register" : "login";
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({ name: "", email: "", phone: "", company: "", password: "" });

  useEffect(() => {
    setMode(location.pathname === "/register" ? "register" : "login");
  }, [location.pathname]);

  // Redirect already-signed-in users based on role
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
        title: mode === "login" ? "Welcome back!" : "Account created",
        description: mode === "login" ? undefined : "You are now signed in.",
      });
      navigate(profile.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (e: any) {
      setErr(humanizeFirebaseError(e?.code, e?.message));
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
          <div className="rounded-2xl border border-primary/20 bg-card/70 backdrop-blur-xl shadow-elegant p-6 md:p-8">
            <div className="grid grid-cols-2 mb-6 rounded-lg bg-secondary/40 p-1">
              <button
                type="button"
                data-testid="tab-login"
                onClick={() => setMode("login")}
                className={`py-2 rounded-md text-sm font-semibold transition-all ${
                  mode === "login" ? "bg-gradient-gold text-charcoal shadow" : "text-foreground/70 hover:text-foreground"
                }`}
              >
                <span className="inline-flex items-center gap-2"><LogIn className="w-4 h-4" /> Sign In</span>
              </button>
              <button
                type="button"
                data-testid="tab-register"
                onClick={() => setMode("register")}
                className={`py-2 rounded-md text-sm font-semibold transition-all ${
                  mode === "register" ? "bg-gradient-gold text-charcoal shadow" : "text-foreground/70 hover:text-foreground"
                }`}
              >
                <span className="inline-flex items-center gap-2"><UserPlus className="w-4 h-4" /> Create Account</span>
              </button>
            </div>

            <h1 className="font-heading text-2xl md:text-3xl font-bold text-gradient-gold text-center mb-1">
              {mode === "login" ? "Welcome Back" : "Create Your Account"}
            </h1>
            <p className="text-center text-sm text-muted-foreground mb-6">
              {mode === "login"
                ? "Sign in to track quotes and orders."
                : "Join to request quotes faster and save your details."}
            </p>

            {err && (
              <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 text-red-300 text-sm px-3 py-2 flex items-start gap-2">
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
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-gradient-gold text-charcoal font-bold shadow-gold hover:opacity-90 transition disabled:opacity-60"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6">
              {mode === "login" ? (
                <>New here? <button type="button" onClick={() => setMode("register")} className="text-primary font-semibold hover:underline" data-testid="link-switch-register">Create an account</button></>
              ) : (
                <>Already have an account? <button type="button" onClick={() => setMode("login")} className="text-primary font-semibold hover:underline" data-testid="link-switch-login">Sign in</button></>
              )}
            </p>
            <p className="text-center text-[11px] text-muted-foreground mt-2">
              <Link to="/" className="hover:text-primary">← Back to home</Link>
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
  <label className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-charcoal/60 border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition">
    <span className="text-muted-foreground">{icon}</span>
    <input
      data-testid={testId}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      autoComplete={type === "password" ? "current-password" : "on"}
      className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/60"
    />
  </label>
);

function humanizeFirebaseError(code?: string, fallback?: string) {
  switch (code) {
    case "auth/invalid-email": return "Please enter a valid email address.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential": return "Incorrect email or password.";
    case "auth/email-already-in-use": return "An account with this email already exists.";
    case "auth/weak-password": return "Password must be at least 6 characters.";
    case "auth/too-many-requests": return "Too many attempts. Please try again later.";
    case "auth/network-request-failed": return "Network error. Check your connection and retry.";
    default: return fallback || "Something went wrong. Please try again.";
  }
}

export default UserAuthPage;
