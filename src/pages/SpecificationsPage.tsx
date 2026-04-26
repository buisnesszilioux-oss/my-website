import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SpecificationsSection from "@/components/SpecificationsSection";
import PageTransition from "@/components/PageTransition";
import { Helmet } from "react-helmet-async";

const SpecificationsPage = () => {
  return (
    <PageTransition>
      <Helmet>
        <title>ASTM A193 Grade B7 Specifications — Chemical & Mechanical Properties | M.I. Engineering Works</title>
        <meta name="description" content="Complete ASTM A193 Grade B7 technical specifications — chemical composition, mechanical properties (tensile 125 ksi, yield 105 ksi), hardness 35 HRC max. M.I. Engineering Works Mumbai." />
        <meta name="keywords" content="ASTM A193 B7 specifications, B7 chemical composition, B7 mechanical properties, B7 tensile strength, B7 yield strength, B7 hardness, AISI 4140 specs, M.I. Engineering Works" />
        <link rel="canonical" href="https://miengineeringworks.lovable.app/specifications" />
      </Helmet>
      <Header />
      <SpecificationsSection />
      <Footer />
    </PageTransition>
  );
};

export default SpecificationsPage;
