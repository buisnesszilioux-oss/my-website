import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import WhatsAppButton from "./components/WhatsAppButton.tsx";
import ScrollToTop from "./components/ScrollToTop";
import BrandingHead from "./components/BrandingHead";
import { useApplyBackgroundAnimation } from "@/hooks/useActiveAnimations";

// Public pages — lazy loaded for faster initial paint
const ProductDetail = lazy(() => import("./pages/ProductDetail.tsx"));
const ProductsPage = lazy(() => import("./pages/ProductsPage.tsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.tsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.tsx"));
const IndustryDetail = lazy(() => import("./pages/IndustryDetail.tsx"));
const ApplicationsPage = lazy(() => import("./pages/ApplicationsPage.tsx"));
const SpecificationsPage = lazy(() => import("./pages/SpecificationsPage.tsx"));
const GradeChartPage = lazy(() => import("./pages/GradeChartPage.tsx"));
const StandardsPage = lazy(() => import("./pages/StandardsPage.tsx"));
const StandardDetail = lazy(() => import("./pages/StandardDetail.tsx"));
const GalleryPage = lazy(() => import("./pages/GalleryPage.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

// Calculator is now an admin-only tool
const CalculatorPage = lazy(() => import("./pages/CalculatorPage.tsx"));

// Admin pages — lazy loaded (only ever opened by site owner)
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin.tsx"));
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia.tsx"));
const AdminContent = lazy(() => import("./pages/admin/AdminContent.tsx"));
const AdminSections = lazy(() => import("./pages/admin/AdminSections.tsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.tsx"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts.tsx"));
const AdminIndustries = lazy(() => import("./pages/admin/AdminIndustries.tsx"));
const AdminStandards = lazy(() => import("./pages/admin/AdminStandards.tsx"));
const AdminContacts = lazy(() => import("./pages/admin/AdminContacts.tsx"));
const AdminGradeChart = lazy(() => import("./pages/admin/AdminGradeChart.tsx"));
const AdminSpecifications = lazy(() => import("./pages/admin/AdminSpecifications.tsx"));
const AdminCatalog = lazy(() => import("./pages/admin/AdminCatalog.tsx"));
const AdminBranding = lazy(() => import("./pages/admin/AdminBranding.tsx"));
const AdminAnimations = lazy(() => import("./pages/admin/AdminAnimations.tsx"));
const AdminLedger = lazy(() => import("./pages/admin/AdminLedger.tsx"));
const AdminLedgerCustomer = lazy(() => import("./pages/admin/AdminLedgerCustomer.tsx"));
const AdminApplications = lazy(() => import("./pages/admin/AdminApplications.tsx"));
const AdminApplicationUseCases = lazy(() => import("./pages/admin/AdminApplicationUseCases.tsx"));
const AdminMI = lazy(() => import("./pages/admin/AdminMI.tsx"));
const AdminBackups = lazy(() => import("./pages/admin/AdminBackups.tsx"));
const RequireAdmin = lazy(() => import("./pages/admin/RequireAdmin.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const RouteFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<RouteFallback />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/industry/:slug" element={<IndustryDetail />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/standards" element={<StandardsPage />} />
          <Route path="/standards/:slug" element={<StandardDetail />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/specifications" element={<SpecificationsPage />} />
          <Route path="/grade-chart" element={<GradeChartPage />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/calculator" element={<RequireAdmin><CalculatorPage /></RequireAdmin>} />
          <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          <Route path="/admin/products" element={<RequireAdmin><AdminProducts /></RequireAdmin>} />
          <Route path="/admin/industries" element={<RequireAdmin><AdminIndustries /></RequireAdmin>} />
          <Route path="/admin/standards" element={<RequireAdmin><AdminStandards /></RequireAdmin>} />
          <Route path="/admin/media" element={<RequireAdmin><AdminMedia /></RequireAdmin>} />
          <Route path="/admin/content" element={<RequireAdmin><AdminContent /></RequireAdmin>} />
          <Route path="/admin/sections" element={<RequireAdmin><AdminSections /></RequireAdmin>} />
          <Route path="/admin/contacts" element={<RequireAdmin><AdminContacts /></RequireAdmin>} />
          <Route path="/admin/grade-chart" element={<RequireAdmin><AdminGradeChart /></RequireAdmin>} />
          <Route path="/admin/specifications" element={<RequireAdmin><AdminSpecifications /></RequireAdmin>} />
          <Route path="/admin/catalog" element={<RequireAdmin><AdminCatalog /></RequireAdmin>} />
          <Route path="/admin/branding" element={<RequireAdmin><AdminBranding /></RequireAdmin>} />
          <Route path="/admin/animations" element={<RequireAdmin><AdminAnimations /></RequireAdmin>} />
          <Route path="/admin/ledger" element={<RequireAdmin><AdminLedger /></RequireAdmin>} />
          <Route path="/admin/ledger/:name" element={<RequireAdmin><AdminLedgerCustomer /></RequireAdmin>} />
          <Route path="/admin/applications" element={<RequireAdmin><AdminApplications /></RequireAdmin>} />
          <Route path="/admin/applications/:slug" element={<RequireAdmin><AdminApplicationUseCases /></RequireAdmin>} />
          <Route path="/admin/mi" element={<RequireAdmin><AdminMI /></RequireAdmin>} />
          <Route path="/admin/backups" element={<RequireAdmin><AdminBackups /></RequireAdmin>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const SiteEffects = () => {
  useApplyBackgroundAnimation();
  return null;
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      {/* reducedMotion="always" disables scroll-triggered & all motion animations so pages open instantly */}
      <MotionConfig reducedMotion="always">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <BrandingHead />
            <SiteEffects />
            <ScrollToTop />
            <AnimatedRoutes />
            <WhatsAppButton />
          </BrowserRouter>
        </TooltipProvider>
      </MotionConfig>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
