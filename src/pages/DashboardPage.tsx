import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { LogOut, User as UserIcon, FileText, Mail, Phone, Building2, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    toast({ title: "Signed out" });
    nav("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-charcoal">
      <Helmet>
        <title>Dashboard — M.I. Engineering Works</title>
        <meta name="description" content="Your customer dashboard." />
      </Helmet>
      <Header />
      <main className="flex-1 relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal" />
        <div className="container max-w-5xl py-12 md:py-16">
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary/80 mb-1">Customer Portal</p>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-gradient-gold" data-testid="text-dashboard-title">
                Welcome{user.name ? `, ${user.name.split(" ")[0]}` : ""}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm" data-testid="text-dashboard-email">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              data-testid="button-logout"
              className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-card/60 hover:bg-card text-foreground px-4 py-2 text-sm transition"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-primary/20 bg-card/70 backdrop-blur-xl p-6 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <UserIcon className="w-5 h-5 text-primary" />
                <h2 className="font-heading text-lg font-semibold">Your Profile</h2>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <Row icon={<Mail className="w-4 h-4" />} label="Email" value={user.email} testId="row-email" />
                <Row icon={<UserIcon className="w-4 h-4" />} label="Name" value={user.name || "—"} testId="row-name" />
                <Row icon={<Phone className="w-4 h-4" />} label="Phone" value={user.phone || "—"} testId="row-phone" />
                <Row icon={<Building2 className="w-4 h-4" />} label="Company" value={user.company || "—"} testId="row-company" />
                <Row icon={<ShieldCheck className="w-4 h-4" />} label="Role" value={user.role} testId="row-role" />
              </dl>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-card/70 backdrop-blur-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="font-heading text-lg font-semibold">Quick Actions</h2>
              </div>
              <div className="flex flex-col gap-2">
                <Link to="/quote" data-testid="link-request-quote"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-gradient-gold text-charcoal font-semibold shadow-gold hover:opacity-90 transition">
                  Request a Quote
                </Link>
                <Link to="/products" data-testid="link-browse-products"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-border bg-card hover:bg-secondary/50 transition text-sm">
                  Browse Products
                </Link>
                <Link to="/contact" data-testid="link-contact-us"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-border bg-card hover:bg-secondary/50 transition text-sm">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Row = ({ icon, label, value, testId }: { icon: React.ReactNode; label: string; value: string; testId: string }) => (
  <div className="flex items-start gap-3">
    <span className="text-primary/80 mt-0.5">{icon}</span>
    <div>
      <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className="text-foreground" data-testid={testId}>{value}</dd>
    </div>
  </div>
);

export default DashboardPage;
