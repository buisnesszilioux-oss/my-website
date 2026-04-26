import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";
import StatsCounter from "@/components/StatsCounter";
import PageTransition from "@/components/PageTransition";
import SEO from "@/components/SEO";

export default function AboutPage() {
  return (
    <PageTransition>
      <SEO
        title="About M.I. Engineering Works — 25+ Years in Industrial Fasteners"
        description="M.I. Engineering Works is a Mumbai-based manufacturer & supplier of high-tensile fasteners with 25+ years of experience, serving 500+ clients across aerospace, oil & gas, construction and automotive industries."
        keywords={[
          "about MI Engineering Works",
          "fasteners company Mumbai",
          "ISO certified fasteners manufacturer",
          "industrial fasteners experience",
        ]}
        path="/about"
      />
      <Header />
      <main>
        <AboutSection />
        <StatsCounter />
      </main>
      <Footer />
    </PageTransition>
  );
}
