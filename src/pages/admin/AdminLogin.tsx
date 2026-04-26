import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "@/lib/api";
import { ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
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

        <label className="block mb-4">
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">Admin Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
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
