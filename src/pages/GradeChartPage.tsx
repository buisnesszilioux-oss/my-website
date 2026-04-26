import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GradeChartSection from "@/components/GradeChartSection";
import PageTransition from "@/components/PageTransition";
import { Helmet } from "react-helmet-async";

const GradeChartPage = () => {
  return (
    <PageTransition>
      <Helmet>
        <title>Fastener Grade Chart — ASTM A193 B7, B16, L7, B8, B8M & All Grades | M.I. Engineering Works</title>
        <meta name="description" content="Complete fastener grade chart — ASTM A193 B7, B16, L7, B8, B8M, Inconel, Hastelloy, Duplex, Monel, Titanium. Tensile strength, yield, hardness & dimensional standards. M.I. Engineering Works Mumbai." />
        <meta name="keywords" content="fastener grade chart, ASTM A193 B7 grade chart, bolt grades, nut grades, ASTM A194 2H, stud bolt grades, B7 B16 L7 B8 B8M grades, M.I. Engineering Works" />
        <link rel="canonical" href="https://miengineeringworks.lovable.app/grade-chart" />
      </Helmet>
      <Header />
      <GradeChartSection />
      <Footer />
    </PageTransition>
  );
};

export default GradeChartPage;
