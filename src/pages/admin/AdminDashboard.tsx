import { useQuery } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { api, clearToken, type Product, type Industry, type Standard, type ContactSubmission } from "@/lib/api";
import type { Media } from "@/lib/api-extras";
import { Package, Factory, Award, Mail, Image as ImageIcon, Video, LogOut, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const nav = useNavigate();
  const { data: products } = useQuery<Product[]>({ queryKey: ["/api/products"], queryFn: () => api("/api/products") });
  const { data: industries } = useQuery<Industry[]>({ queryKey: ["/api/industries"], queryFn: () => api("/api/industries") });
  const { data: standards } = useQuery<Standard[]>({ queryKey: ["/api/standards"], queryFn: () => api("/api/standards") });
  const { data: media } = useQuery<Media[]>({ queryKey: ["/api/media"], queryFn: () => api("/api/media") });
  const { data: contacts } = useQuery<ContactSubmission[]>({ queryKey: ["/api/admin/contacts"], queryFn: () => api("/api/admin/contacts") });

  const logout = () => { clearToken(); nav("/admin/login", { replace: true }); };

  const photosCount = media?.filter((m) => m.type === "photo").length;
  const videosCount = media?.filter((m) => m.type === "video").length;

  const cards = [
    { key: "products", to: "/admin/products", label: "Products", icon: Package, count: products?.length ?? "…", testId: "stat-products" },
    { key: "industries", to: "/admin/industries", label: "Industries", icon: Factory, count: industries?.length ?? "…", testId: "stat-industries" },
    { key: "standards", to: "/admin/standards", label: "Standards", icon: Award, count: standards?.length ?? "…", testId: "stat-standards" },
    { key: "photos", to: "/admin/media", label: "Photos", icon: ImageIcon, count: photosCount ?? "…", testId: "stat-photos" },
    { key: "videos", to: "/admin/media", label: "Videos", icon: Video, count: videosCount ?? "…", testId: "stat-videos" },
    { key: "submissions", to: "/admin/contacts", label: "Submissions", icon: Mail, count: contacts?.length ?? "…", testId: "stat-submissions" },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground mb-1">Dashboard</h1>
          <p className="text-muted-foreground">Manage all editable content for the website from here.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Signed in
          </span>
          <button
            onClick={logout}
            data-testid="button-logout-dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold border border-border hover:border-destructive hover:text-destructive px-3 py-2 rounded-md transition"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map(({ key, to, label, icon: Icon, count }) => (
          <Link key={key} to={to} className="bg-card rounded-lg border border-border p-5 hover:border-primary/40 hover:shadow-gold transition">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
                <div className="font-heading text-3xl font-bold text-foreground mt-1">{count}</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center">
                <Icon className="w-5 h-5 text-charcoal" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 bg-card rounded-lg border border-border p-6">
        <h2 className="font-heading text-lg font-bold text-foreground mb-3">Recent Contact Submissions</h2>
        {contacts && contacts.length > 0 ? (
          <ul className="divide-y divide-border">
            {contacts.slice(0, 5).map((c) => (
              <li key={c.id} className="py-3 flex justify-between items-start text-sm">
                <div>
                  <div className="font-semibold text-foreground">{c.fullName} <span className="text-muted-foreground font-normal">— {c.companyName || "—"}</span></div>
                  <div className="text-muted-foreground">{c.email} · {c.phone}</div>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-muted-foreground">No submissions yet.</p>}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
