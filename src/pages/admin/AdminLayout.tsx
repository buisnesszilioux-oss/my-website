import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, Factory, Award, Mail, LogOut, Home, Image, FileText, LayoutGrid, Table2, FileBarChart, BookOpen, Sparkles, Palette, Notebook, Calculator, Layers, Bot, HardDriveDownload } from "lucide-react";
import { clearToken } from "@/lib/api";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/mi", label: "MI Chat", icon: Bot },
  { to: "/admin/backups", label: "Backups", icon: HardDriveDownload },
  { to: "/admin/branding", label: "Branding & Identity", icon: Palette },
  { to: "/admin/animations", label: "Animations", icon: Sparkles },
  { to: "/admin/content", label: "Site Content", icon: FileText },
  { to: "/admin/sections", label: "Custom Sections", icon: LayoutGrid },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/applications", label: "Applications / Use Cases", icon: Layers },
  { to: "/admin/industries", label: "Industries (Advanced)", icon: Factory },
  { to: "/admin/standards", label: "Standards", icon: Award },
  { to: "/admin/grade-chart", label: "Grade Chart", icon: Table2 },
  { to: "/admin/specifications", label: "Specifications", icon: FileBarChart },
  { to: "/admin/catalog", label: "PDF Catalog", icon: BookOpen },
  { to: "/admin/media", label: "Photos & Videos", icon: Image },
  { to: "/admin/calculator", label: "Calculator", icon: Calculator },
  { to: "/admin/ledger", label: "Ledger / Khata", icon: Notebook },
  { to: "/admin/contacts", label: "Submissions", icon: Mail },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const nav = useNavigate();
  const logout = () => { clearToken(); nav("/admin/login"); };

  return (
    <div className="min-h-screen flex bg-secondary/20">
      <aside className="w-60 bg-gradient-dark text-primary-foreground flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="font-heading text-lg font-bold text-gradient-gold">M.I. Admin</div>
          <div className="text-[10px] uppercase tracking-widest text-primary-foreground/60 mt-1">Content Manager</div>
        </div>
        <nav className="flex-1 py-3">
          {links.map(({ to, label, icon: Icon }) => {
            const active = loc.pathname === to;
            return (
              <Link key={to} to={to} data-testid={`nav-${label.toLowerCase()}`}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm hover:bg-white/5 transition ${active ? "bg-primary/20 text-primary border-l-2 border-primary" : "text-primary-foreground/80"}`}>
                <Icon className="w-4 h-4" /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm text-primary-foreground/80 hover:text-primary"><Home className="w-4 h-4" /> View Site</Link>
          <button onClick={logout} data-testid="button-logout" className="flex items-center gap-2 px-3 py-2 text-sm text-primary-foreground/80 hover:text-destructive w-full">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-10 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
