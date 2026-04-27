import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, LogIn, UserPlus, Mail, Lock, User as UserIcon, Phone, Building2, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    google?: any;
  }
}

const UserAuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, register, loginWithGoogle, user } = useAuth();
  const initialMode = location.pathname === "/register" ? "register" : "login";
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({ name: "", email: "", phone: "", company: "", password: "" });

  const googleBtnRef = useRef<HTMLDivElement>(null);
  const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) || "";

  useEffect(() => {
    setMode(location.pathname === "/register" ? "register" : "login");
  }, [location.pathname]);

  useEffect(() => {
    if (user) navigate("/account", { replace: true });
  }, [user, navigate]);

  // Load Google Identity Services script and render button
  useEffect(() => {
    if (!clientId) return;
    const renderBtn = () => {
      if (!window.google?.accounts?.id || !googleBtnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (resp: any) => {
          try {
            setBusy(true);
            setErr(null);
            await loginWithGoogle(resp.credential);
            toast({ title: "Welcome!", description: "Signed in with Google." });
            navigate("/account");
          } catch (e: any) {
            setErr(e.message || "Google sign-in failed");
          } finally {
            setBusy(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "filled_black",
        size: "large",
        text: mode === "register" ? "signup_with" : "signin_with",
        shape: "rectangular",
        width: 360,
      });
    };

    if (window.google?.accounts?.id) {
      renderBtn();
      return;
    }
    const existing = document.getElementById("gsi-client") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", renderBtn, { once: true });
      return;
    }
    const s = document.createElement("script");
    s.id = "gsi-client";
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = renderBtn;
    document.head.appendChild(s);
  }, [clientId, mode, loginWithGoogle, navigate, toast]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === "login") {
        await login(loginForm.email, loginForm.password);
        toast({ title: "Welcome back!" });
      } else {
        await register(regForm);
        toast({ title: "Account created", description: "You are now signed in." });
      }
      navigate("/account");
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
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
            {/* Mode tabs */}
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

            {/* Google sign-in */}
            <div className="flex justify-center mb-4">
              <div ref={googleBtnRef} className="min-h-[40px]" />
            </div>
            {!clientId && (
              <p className="text-xs text-amber-300/90 text-center mb-2">
                Google sign-in is not configured (missing client ID).
              </p>
            )}

            <div className="flex items-center gap-3 my-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">or with email</span>
              <div className="h-px flex-1 bg-border" />
            </div>

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
              <Field icon={<Lock className="w-4 h-4" />} placeholder="Password" type="password"
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
                <>New here? <button type="button" onClick={() => setMode("register")} className="text-primary font-semibold hover:underline">Create an account</button></>
              ) : (
                <>Already have an account? <button type="button" onClick={() => setMode("login")} className="text-primary font-semibold hover:underline">Sign in</button></>
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

export default UserAuthPage;
