import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "@/lib/api";
import { ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) || "";

declare global {
  interface Window {
    google?: any;
  }
}

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement | null>(null);
  const nav = useNavigate();
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api<{ token: string }>("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ username: email.trim().toLowerCase(), password }),
      });
      setToken(res.token);
      toast({ title: "Welcome back" });
      nav("/admin");
    } catch (err: any) {
      toast({ title: "Sign-in failed", description: err.message || "Please try again", variant: "destructive" });
    } finally { setBusy(false); }
  };

  // Load Google Identity Services script + render the button.
  // Works on any host (dev Replit URL or production custom domain) as long as
  // the host is added to "Authorised JavaScript origins" in Google Cloud Console.
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const handleCredential = async (response: { credential: string }) => {
      try {
        setBusy(true);
        const res = await api<{ token: string }>("/api/admin/google-login", {
          method: "POST",
          body: JSON.stringify({ credential: response.credential }),
        });
        setToken(res.token);
        toast({ title: "Signed in with Google" });
        nav("/admin");
      } catch (err: any) {
        toast({ title: "Google sign-in failed", description: err.message || "Please try again", variant: "destructive" });
      } finally { setBusy(false); }
    };

    const init = () => {
      if (!window.google?.accounts?.id || !googleBtnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
        auto_select: false,
        ux_mode: "popup",
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "signin_with",
        width: 320,
      });
      setGoogleReady(true);
    };

    if (window.google?.accounts?.id) {
      init();
      return;
    }

    const existing = document.getElementById("google-identity-script") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", init, { once: true });
      return;
    }
    const s = document.createElement("script");
    s.id = "google-identity-script";
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = init;
    document.head.appendChild(s);
  }, [nav, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark p-6">
      <form onSubmit={submit} className="bg-card rounded-2xl shadow-elegant p-8 w-full max-w-md border border-border">
        <div className="text-center mb-7">
          <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center mx-auto mb-4 shadow-gold">
            <ShieldCheck className="w-7 h-7 text-charcoal" />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Admin Sign In</h1>
          <p className="text-sm text-muted-foreground mt-1.5">M.I. Engineering Works · Content Panel</p>
        </div>

        {GOOGLE_CLIENT_ID ? (
          <>
            <div className="flex justify-center mb-5 min-h-[44px]" data-testid="google-signin-container">
              <div ref={googleBtnRef} />
              {!googleReady && (
                <div className="text-xs text-muted-foreground self-center">Loading Google sign-in…</div>
              )}
            </div>
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center"><span className="bg-card px-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Or with password</span></div>
            </div>
          </>
        ) : null}

        <label className="block mb-4">
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">Admin Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            data-testid="input-username"
            placeholder="miengineering@gmail.com"
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
            data-testid="input-password"
            placeholder="Enter your password"
            className="mt-2 w-full bg-background border border-border rounded-lg px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
          />
        </label>

        <button
          type="submit"
          disabled={busy || !email || !password}
          data-testid="button-login"
          className="w-full bg-gradient-gold text-charcoal font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 shadow-gold"
        >
          {busy ? "Signing in…" : "Sign In"}
        </button>

        <p className="text-[11px] text-muted-foreground/70 mt-5 text-center leading-relaxed">
          Restricted access. Only the registered admin email can sign in.
        </p>
      </form>
    </div>
  );
};

export default AdminLogin;
