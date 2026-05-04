import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SpecificationsSection from "@/components/SpecificationsSection";
import PageTransition from "@/components/PageTransition";
import { Helmet } from "react-helmet-async";
import { useHeroImage } from "@/hooks/useHeroImage";

const SpecificationsPage = () => {
  const heroImage = useHeroImage("specifications");
  return (
    <PageTransition>
      <Helmet>
        <title>ASTM A193 Grade B7 Specifications — Chemical & Mechanical Properties | M.I. Engineering Works</title>
        <meta name="description" content="Complete ASTM A193 Grade B7 technical specifications — chemical composition, mechanical properties (tensile 125 ksi, yield 105 ksi), hardness 35 HRC max. M.I. Engineering Works Mumbai." />
        <meta name="keywords" content="ASTM A193 B7 specifications, B7 chemical composition, B7 mechanical properties, B7 tensile strength, B7 yield strength, B7 hardness, AISI 4140 specs, M.I. Engineering Works" />
        <link rel="canonical" href="https://miengineeringworks.lovable.app/specifications" />
      </Helmet>
      <Header />

      <section className="relative bg-gradient-dark py-20 md:py-28 text-foreground overflow-hidden">
        {heroImage && (
          <div className="absolute inset-0 opacity-25" style={{ backgroundImage: `url(${heroImage})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-charcoal/55 to-charcoal/85" />
        <div className="container relative z-10 text-center">
          <span className="text-xs md:text-sm font-semibold tracking-[0.4em] uppercase text-primary drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">Technical Reference</span>
          <h1 className="font-heading text-4xl md:text-6xl font-bold mt-4 leading-[1.1] tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]">
            Speci<span className="text-gradient-gold">fications</span>
          </h1>
          <div className="gold-divider w-24 mx-auto mt-5" />
          <p className="mt-5 max-w-2xl mx-auto text-white/90 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            Chemical composition, mechanical properties and dimensional standards for every grade we manufacture.
          </p>
        </div>
      </section>

      <SpecificationsSection />
      <Footer />
    </PageTransition>
  );
};

export default SpecificationsPage;
