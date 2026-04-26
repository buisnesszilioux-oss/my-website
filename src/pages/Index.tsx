import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ProductSlider from "@/components/ProductSlider";
import AboutSection from "@/components/AboutSection";
import ProductsSection from "@/components/ProductsSection";
import ApplicationsSection from "@/components/ApplicationsSection";
import StandardsSection from "@/components/StandardsSection";
import GallerySection from "@/components/GallerySection";
import StatsCounter from "@/components/StatsCounter";
import SpecificationsSection from "@/components/SpecificationsSection";
import GradeChartSection from "@/components/GradeChartSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import CustomSections from "@/components/CustomSections";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <PageTransition>
      <SEO
        title="M.I. Engineering Works | ASTM A193 Grade B7 Fasteners Manufacturer & Supplier Mumbai India"
        description="M.I. Engineering Works — Leading manufacturer & supplier of ASTM A193 Grade B7 stud bolts, hex bolts, threaded rods, anchor bolts & high-tensile fasteners in Mumbai, India. 25+ years experience, 500+ clients. Call +91-9819972301."
        keywords={[
          "ASTM A193 Grade B7 manufacturer",
          "stud bolts manufacturer Mumbai",
          "hex bolts supplier India",
          "threaded rods manufacturer",
          "anchor bolts supplier Mumbai",
          "foundation bolts manufacturer India",
          "high tensile fasteners Mumbai",
          "B7 bolts manufacturer",
          "fasteners manufacturer India",
          "industrial fasteners supplier",
        ]}
        path="/"
      />
      <div className="min-h-screen">
        <Header />
        <CustomSections position="top" />
        <HeroSection />
        <CustomSections position="after-hero" />
        <ProductSlider />
        <AboutSection />
        <CustomSections position="after-about" />
        <ProductsSection />
        <StatsCounter />
        <CustomSections position="after-stats" />
        <ApplicationsSection />
        <CustomSections position="after-applications" />
        <StandardsSection />
        <CustomSections position="after-standards" />
        <GallerySection />
        <CustomSections position="after-gallery" />
        <SpecificationsSection />
        <GradeChartSection />
        <CustomSections position="before-contact" />
        <ContactSection />
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;
