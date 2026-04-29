import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { LogOut, Save, ShieldCheck, Mail, Phone, Building2, User as UserIcon, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const AccountPage = () => {
  const { user, loading, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", company: "" });

  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) setForm({ name: user.name, phone: user.phone || "", company: user.company || "" });
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-charcoal">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await updateProfile(form);
      toast({ title: "Profile updated" });
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-charcoal">
      <Helmet>
        <title>My Account — M.I. Engineering Works</title>
      </Helmet>
      <Header />
      <main className="flex-1">
        <div className="container max-w-3xl py-12 md:py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-primary">My Account</p>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-gradient-gold">
                Welcome, {user.name.split(" ")[0]}
              </h1>
            </div>
            <button
              onClick={() => { logout(); navigate("/"); }}
              data-testid="button-logout"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm text-foreground/80 hover:text-red-400 hover:border-red-400/60 transition"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="rounded-2xl border border-primary/20 bg-card/70 p-5 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-gold flex items-center justify-center text-charcoal text-2xl font-bold overflow-hidden">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <p className="mt-3 font-semibold" data-testid="text-account-name">{user.name}</p>
                <p className="text-xs text-muted-foreground" data-testid="text-account-email">{user.email}</p>
                <span className="inline-flex items-center gap-1 mt-3 text-[10px] uppercase tracking-widest text-primary/90 bg-primary/10 px-2 py-1 rounded">
                  <ShieldCheck className="w-3 h-3" /> Verified email · {user.role}
                </span>
              </div>
              <Link
                to="/quote"
                className="block mt-4 text-center px-4 py-3 rounded-md bg-gradient-gold text-charcoal font-semibold shadow-gold hover:opacity-90"
              >
                Request a Quote
              </Link>
            </div>

            <div className="md:col-span-2">
              <form onSubmit={save} className="rounded-2xl border border-primary/20 bg-card/70 p-5 md:p-6 space-y-4">
                <h2 className="font-heading text-xl font-semibold text-foreground">Profile details</h2>
                <p className="text-xs text-muted-foreground -mt-2">Keep your contact info up to date so we can reach you about quotes.</p>

                <Field label="Full name" icon={<UserIcon className="w-4 h-4" />} testId="input-account-name"
                  value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <Field label="Email" icon={<Mail className="w-4 h-4" />} testId="input-account-email" value={user.email} onChange={() => {}} disabled />
                <Field label="Phone" icon={<Phone className="w-4 h-4" />} testId="input-account-phone"
                  value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                <Field label="Company" icon={<Building2 className="w-4 h-4" />} testId="input-account-company"
                  value={form.company} onChange={(v) => setForm({ ...form, company: v })} />

                <button
                  type="submit"
                  disabled={busy}
                  data-testid="button-save-profile"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-gradient-gold text-charcoal font-semibold hover:opacity-90 transition disabled:opacity-60"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save changes
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Field = ({
  label, icon, value, onChange, testId, required, disabled,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  testId: string;
  required?: boolean;
  disabled?: boolean;
}) => (
  <label className="block">
    <span className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">{label}</span>
    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-md bg-charcoal/60 border border-border ${disabled ? "opacity-70" : "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"} transition`}>
      <span className="text-muted-foreground">{icon}</span>
      <input
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className="flex-1 bg-transparent outline-none text-sm text-foreground"
      />
    </div>
  </label>
);

export default AccountPage;
