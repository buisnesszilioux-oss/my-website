import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GradeChartSection from "@/components/GradeChartSection";
import PageTransition from "@/components/PageTransition";
import { Helmet } from "react-helmet-async";
import { useHeroImage } from "@/hooks/useHeroImage";

const GradeChartPage = () => {
  const heroImage = useHeroImage("gradeChart");
  return (
    <PageTransition>
      <Helmet>
        <title>Fastener Grade Chart — ASTM A193 B7, B16, L7, B8, B8M & All Grades | M.I. Engineering Works</title>
        <meta name="description" content="Complete fastener grade chart — ASTM A193 B7, B16, L7, B8, B8M, Inconel, Hastelloy, Duplex, Monel, Titanium. Tensile strength, yield, hardness & dimensional standards. M.I. Engineering Works Mumbai." />
        <meta name="keywords" content="fastener grade chart, ASTM A193 B7 grade chart, bolt grades, nut grades, ASTM A194 2H, stud bolt grades, B7 B16 L7 B8 B8M grades, M.I. Engineering Works" />
        <link rel="canonical" href="https://miengineeringworks.lovable.app/grade-chart" />
      </Helmet>
      <Header />

      <section className="relative bg-gradient-dark py-20 md:py-28 text-foreground overflow-hidden">
        {heroImage && (
          <div className="absolute inset-0 opacity-25" style={{ backgroundImage: `url(${heroImage})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-charcoal/55 to-charcoal/85" />
        <div className="container relative z-10 text-center">
          <span className="text-xs md:text-sm font-semibold tracking-[0.4em] uppercase text-primary drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">Engineering Reference</span>
          <h1 className="font-heading text-4xl md:text-6xl font-bold mt-4 leading-[1.1] tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]">
            Fastener <span className="text-gradient-gold">Grade Chart</span>
          </h1>
          <div className="gold-divider w-24 mx-auto mt-5" />
          <p className="mt-5 max-w-2xl mx-auto text-white/90 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            Tensile strength, yield, hardness and matching specifications for every grade we supply.
          </p>
        </div>
      </section>

      <GradeChartSection />
      <Footer />
    </PageTransition>
  );
};

export default GradeChartPage;
